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
			loadImg(enemySpritePng),
			loadImg(enemy3SpritePng),
			loadImg(playerSpritePng),
			loadImg(boomSpritePng),
			loadImg(shootSpritePng),
		]).then((images) => {
			enemyImgRef.current = images[0];
			enemy3ImgRef.current = images[1];
			playerImgRef.current = images[2];
			boomImgRef.current = images[3];
			shootImgRef.current = images[4];
			spritesLoadedRef.current = true;
		});
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !spritesLoadedRef.current) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Draw background
		const gradient = ctx.createLinearGradient(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
		gradient.addColorStop(0, '#000033');
		gradient.addColorStop(1, '#000055');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);

		// Add starfield
		ctx.fillStyle = '#ffffff';
		for (let i = 0; i < CONFIG.HEIGHT * CONFIG.WIDTH * 0.0001; i++) {
			const x = Math.random() * CONFIG.WIDTH;
			const y = Math.random() * CONFIG.HEIGHT;
			const size = Math.random() * 0.5;
			ctx.fillRect(x, y, size, size);
		}

		// Scrolling lines pattern
		const scrollOffset = -(gameState.bgOffset % CONFIG.BG_WIDTH);
		ctx.strokeStyle = 'rgba(0, 100, 100, 0.3)';
		ctx.lineWidth = 1;
		for (let x = scrollOffset; x < CONFIG.WIDTH; x += 32) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, CONFIG.HEIGHT);
			ctx.stroke();
		}

		// Draw player ship
		// r-player-1.png: 5 frames (166×18), frame 0=banked up, 2=neutral, 4=banked down
		const PLAYER_FRAME_W = Math.floor(166 / 5); // 33px
		const PLAYER_FRAME_H = 18;
		const PLAYER_FRAME_COUNT = 5;
		if (!gameState.player.dead) {
			// Animate bank frame toward target based on vertical velocity
			const targetFrame = gameState.player.vy < 0 ? 0 : gameState.player.vy > 0 ? PLAYER_FRAME_COUNT - 1 : 2;
			if (playerAnimFrameRef.current < targetFrame) playerAnimFrameRef.current++;
			else if (playerAnimFrameRef.current > targetFrame) playerAnimFrameRef.current--;
			if (playerImgRef.current) {
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
