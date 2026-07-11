/**
 * @author GDQ
 *
 * @file R-Type style shoot-em-up game
 */

import type { ChannelProps } from '../channels';
import { registerChannel } from '../channels';
import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import { useRTypeGame } from './hook';
import { CONFIG } from './config';
import bgPng from './sprites/bg.png';
import enemySpritePng from './sprites/r-enemy-2.png';
import enemy3SpritePng from './sprites/r-enemy-3.png';
import playerSpritePng from './sprites/r-player-1.png';
import boomSpritePng from './sprites/r-boom.png';
import shootSpritePng from './sprites/r-shoot.png';

registerChannel('R-Type', 85, RType, {
	position: 'topLeft',
	site: 'GitHub',
	handle: 'gdq',
});

const Container = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background: #000;
`;

const Canvas = styled.canvas`
	display: block;
	image-rendering: pixelated;
	image-rendering: -moz-crisp-edges;
	image-rendering: crisp-edges;
`;

function loadImg(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

function RType(props: ChannelProps) {
	const gameState = useRTypeGame();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const spritesLoadedRef = useRef<boolean>(false);
	const bgImgRef = useRef<HTMLImageElement | null>(null);
	const enemyImgRef = useRef<HTMLImageElement | null>(null);
	const enemy3ImgRef = useRef<HTMLImageElement | null>(null);
	const playerImgRef = useRef<HTMLImageElement | null>(null);
	const boomImgRef = useRef<HTMLImageElement | null>(null);
	const shootImgRef = useRef<HTMLImageElement | null>(null);
	// Tracks current bank frame (0=most up, 2=neutral, 4=most down) for smooth tilt animation
	const playerAnimFrameRef = useRef<number>(2);

	// Load all sprite sheets on mount
	useEffect(() => {
		Promise.all([
			loadImg(bgPng),
			loadImg(enemySpritePng),
			loadImg(enemy3SpritePng),
			loadImg(playerSpritePng),
			loadImg(boomSpritePng),
			loadImg(shootSpritePng),
		]).then((images) => {
			bgImgRef.current = images[0];
			enemyImgRef.current = images[1];
			enemy3ImgRef.current = images[2];
			playerImgRef.current = images[3];
			boomImgRef.current = images[4];
			shootImgRef.current = images[5];
			spritesLoadedRef.current = true;
		});
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !spritesLoadedRef.current) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Draw scrolling tiled background with uniform scaling (no deformation).
		if (bgImgRef.current) {
			const scale = CONFIG.HEIGHT / bgImgRef.current.height;
			const drawW = bgImgRef.current.width * scale;
			const drawH = bgImgRef.current.height * scale;
			const y = (CONFIG.HEIGHT - drawH) / 2;
			const normalizedOffset = ((gameState.bgOffset % drawW) + drawW) % drawW;
			const scrollOffset = -normalizedOffset;

			for (let x = scrollOffset - drawW; x < CONFIG.WIDTH + drawW; x += drawW) {
				ctx.drawImage(bgImgRef.current, x, y, drawW, drawH);
			}
		}

		// Draw player ship
		// r-player-1.png: 5 frames (166×18), frame 0=banked up, 2=neutral, 4=banked down
		const PLAYER_FRAME_W = Math.floor(166 / 5); // 33px
		const PLAYER_FRAME_H = 18;
		const PLAYER_FRAME_COUNT = 5;
		if (!gameState.player.dead) {
			const isInvincible = gameState.playerInvincibilityTimer > 0;
			const flickerStep = Math.floor(gameState.playerInvincibilityTimer / CONFIG.RESPAWN_FLICKER_INTERVAL_MS);
			const shouldDrawPlayer = !isInvincible || flickerStep % 2 === 0;

			// Animate bank frame toward target based on vertical velocity
			const targetFrame = gameState.player.vy < 0 ? 0 : gameState.player.vy > 0 ? PLAYER_FRAME_COUNT - 1 : 2;
			if (playerAnimFrameRef.current < targetFrame) playerAnimFrameRef.current++;
			else if (playerAnimFrameRef.current > targetFrame) playerAnimFrameRef.current--;
			if (playerImgRef.current && shouldDrawPlayer) {
				ctx.drawImage(
					playerImgRef.current,
					playerAnimFrameRef.current * PLAYER_FRAME_W, 0, PLAYER_FRAME_W, PLAYER_FRAME_H,
					gameState.player.x, gameState.player.y, CONFIG.PLAYER_WIDTH * 2, CONFIG.PLAYER_HEIGHT * 2,
				);
			}
		} else if (gameState.player.deathFrame < CONFIG.DEATH_ANIMATION_FRAMES) {
			// Death animation: r-boom.png — 4 frames at 33×35 (134px total, Game.cpp Infos(33.5, 35))
			if (boomImgRef.current) {
				const BOOM_FRAME_W = 33;
				const BOOM_FRAME_H = 35;
				const BOOM_FRAMES = 4;
				const boomFrame = Math.min(
					Math.floor((gameState.player.deathFrame / CONFIG.DEATH_ANIMATION_FRAMES) * BOOM_FRAMES),
					BOOM_FRAMES - 1,
				);
				ctx.drawImage(
					boomImgRef.current,
					boomFrame * BOOM_FRAME_W, 0, BOOM_FRAME_W, BOOM_FRAME_H,
					gameState.player.x + gameState.player.width / 2 - BOOM_FRAME_W / 2,
					gameState.player.y + gameState.player.height / 2 - BOOM_FRAME_H / 2,
					BOOM_FRAME_W, BOOM_FRAME_H,
				);
			}
		}

		// Draw shots using r-shoot.png — frame at x=127 as per E_Bullet::render() sourceRec {127,0,20,20}
		const SHOT_FRAME_W = 20;
		const SHOT_FRAME_H = 20;
		const SHOT_SRC_X = 146;
		gameState.shots.forEach((shot) => {
			if (shootImgRef.current) {
				ctx.drawImage(
					shootImgRef.current,
					SHOT_SRC_X, 0, SHOT_FRAME_W, SHOT_FRAME_H,
					shot.x, shot.y + shot.height / 2 - SHOT_FRAME_H / 2, SHOT_FRAME_W, SHOT_FRAME_H,
				);
			}
		});

		// Draw enemies — type 2: r-enemy-2.png (8 frames, 33×36)
		//               type 3: r-enemy-3.png (5 frames, 65×66)
		// Frame cycles via bgOffset for all enemies in sync
		const ENEMY2_FRAME_W = 33;
		const ENEMY2_FRAME_H = 36;
		const ENEMY2_FRAME_COUNT = 8;
		const ENEMY3_FRAME_W = 65;
		const ENEMY3_FRAME_H = 66;
		const ENEMY3_FRAME_COUNT = 5;
		const ENEMY_ANIM_SPEED = 6; // ticks per frame
		const anim2Frame = Math.floor(gameState.bgOffset / ENEMY_ANIM_SPEED) % ENEMY2_FRAME_COUNT;
		const anim3Frame = Math.floor(gameState.bgOffset / ENEMY_ANIM_SPEED) % ENEMY3_FRAME_COUNT;
		gameState.enemies.forEach((enemy) => {
			if (!enemy.dead) {
				if (enemy.enemyType === 3 && enemy3ImgRef.current) {
					ctx.drawImage(
						enemy3ImgRef.current,
						anim3Frame * ENEMY3_FRAME_W, 0, ENEMY3_FRAME_W, ENEMY3_FRAME_H,
						enemy.x, enemy.y, enemy.width, enemy.height,
					);
				} else if (enemy.enemyType === 2 && enemyImgRef.current) {
					ctx.drawImage(
						enemyImgRef.current,
						anim2Frame * ENEMY2_FRAME_W, 0, ENEMY2_FRAME_W, ENEMY2_FRAME_H,
						enemy.x, enemy.y, enemy.width, enemy.height,
					);
				}
			} else {
				// Death animation: r-boom.png — 4 frames at 33×35; type 3 renders at 2× size
				if (boomImgRef.current) {
					const BOOM_FRAME_W = 33;
					const BOOM_FRAME_H = 35;
					const BOOM_FRAMES = 4;
					const boomScale = enemy.enemyType === 3 ? 2 : 1;
					const boomDrawW = BOOM_FRAME_W * boomScale;
					const boomDrawH = BOOM_FRAME_H * boomScale;
					const boomFrame = Math.min(
						Math.floor((enemy.deathFrame / CONFIG.DEATH_ANIMATION_FRAMES) * BOOM_FRAMES),
						BOOM_FRAMES - 1,
					);
					ctx.drawImage(
						boomImgRef.current,
						boomFrame * BOOM_FRAME_W, 0, BOOM_FRAME_W, BOOM_FRAME_H,
						enemy.x + enemy.width / 2 - boomDrawW / 2,
						enemy.y + enemy.height / 2 - boomDrawH / 2,
						boomDrawW, boomDrawH,
					);
				}
			}
		});
	}, [gameState]);

	return (
		<Container>
			<Canvas ref={canvasRef} width={CONFIG.WIDTH} height={CONFIG.HEIGHT} />
		</Container>
	);
}

export default RType;
