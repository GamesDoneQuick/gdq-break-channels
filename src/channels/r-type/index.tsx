/**
 * @author GDQ
 *
 * @file R-Type style shoot-em-up game
 */

import type { Total } from '@gdq/types/tracker';
import type { ChannelProps } from '../channels';
import { registerChannel } from '../channels';
import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';
import { useReplicant } from 'use-nodecg';
import { useRTypeGame } from './hook';
import { CONFIG } from './config';
import bgPng from './sprites/bg.png';
import enemySpritePng from './sprites/r-enemy-2.png';
import enemy3SpritePng from './sprites/r-enemy-3.png';
import playerSpritePng from './sprites/r-player-1.png';
import boomSpritePng from './sprites/r-boom.png';
import shootSpritePng from './sprites/r-shoot.png';
import barPng from './sprites/bar.png';
import barFilledPng from './sprites/bar-filled.png';
import number0Png from './sprites/numbers/0.png';
import number1Png from './sprites/numbers/1.png';
import number2Png from './sprites/numbers/2.png';
import number3Png from './sprites/numbers/3.png';
import number4Png from './sprites/numbers/4.png';
import number5Png from './sprites/numbers/5.png';
import number6Png from './sprites/numbers/6.png';
import number7Png from './sprites/numbers/7.png';
import number8Png from './sprites/numbers/8.png';
import number9Png from './sprites/numbers/9.png';
import dollarPng from './sprites/numbers/dollar.png';
import commaPng from './sprites/numbers/comma.png';

registerChannel('R-Type', 16, RType, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'ViMaSter',
});

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
	padding: 0;
	margin: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	background: #000;
`;

const Canvas = styled.canvas`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
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

function formatTotalText(totalRaw: number): string {
	return `$${Intl.NumberFormat('en-US').format(Math.floor(totalRaw))}`;
}

function RType(props: ChannelProps) {
	const gameState = useRTypeGame();
	const [total] = useReplicant<Total | null>('total', null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const spritesLoadedRef = useRef<boolean>(false);
	const bgImgRef = useRef<HTMLImageElement | null>(null);
	const enemyImgRef = useRef<HTMLImageElement | null>(null);
	const enemy3ImgRef = useRef<HTMLImageElement | null>(null);
	const playerImgRef = useRef<HTMLImageElement | null>(null);
	const boomImgRef = useRef<HTMLImageElement | null>(null);
	const shootImgRef = useRef<HTMLImageElement | null>(null);
	const barImgRef = useRef<HTMLImageElement | null>(null);
	const barFilledImgRef = useRef<HTMLImageElement | null>(null);
	const numberImgsRef = useRef<Record<string, HTMLImageElement | null>>({
		0: null,
		1: null,
		2: null,
		3: null,
		4: null,
		5: null,
		6: null,
		7: null,
		8: null,
		9: null,
		$: null,
		',': null,
	});
	// Tracks current bank frame (0=most up, 2=neutral, 4=most down) for smooth tilt animation
	const playerAnimFrameRef = useRef<number>(2);

	useEffect(() => {
		Promise.all([
			loadImg(bgPng),
			loadImg(enemySpritePng),
			loadImg(enemy3SpritePng),
			loadImg(playerSpritePng),
			loadImg(boomSpritePng),
			loadImg(shootSpritePng),
			loadImg(barPng),
			loadImg(barFilledPng),
			loadImg(number0Png),
			loadImg(number1Png),
			loadImg(number2Png),
			loadImg(number3Png),
			loadImg(number4Png),
			loadImg(number5Png),
			loadImg(number6Png),
			loadImg(number7Png),
			loadImg(number8Png),
			loadImg(number9Png),
			loadImg(dollarPng),
			loadImg(commaPng),
		]).then((images) => {
			bgImgRef.current = images[0];
			enemyImgRef.current = images[1];
			enemy3ImgRef.current = images[2];
			playerImgRef.current = images[3];
			boomImgRef.current = images[4];
			shootImgRef.current = images[5];
			barImgRef.current = images[6];
			barFilledImgRef.current = images[7];
			numberImgsRef.current['0'] = images[8];
			numberImgsRef.current['1'] = images[9];
			numberImgsRef.current['2'] = images[10];
			numberImgsRef.current['3'] = images[11];
			numberImgsRef.current['4'] = images[12];
			numberImgsRef.current['5'] = images[13];
			numberImgsRef.current['6'] = images[14];
			numberImgsRef.current['7'] = images[15];
			numberImgsRef.current['8'] = images[16];
			numberImgsRef.current['9'] = images[17];
			numberImgsRef.current['$'] = images[18];
			numberImgsRef.current[','] = images[19];
			spritesLoadedRef.current = true;
		});
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !spritesLoadedRef.current) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.imageSmoothingEnabled = false;

		// Draw scrolling tiled background with uniform scaling (no deformation).
		if (bgImgRef.current) {
			const scale = CONFIG.PLAYFIELD_HEIGHT / bgImgRef.current.height;
			const drawW = bgImgRef.current.width * scale;
			const drawH = bgImgRef.current.height * scale;
			const y = 0;
			const normalizedOffset = ((gameState.bgOffset % drawW) + drawW) % drawW;
			const scrollOffset = -normalizedOffset;

			for (let x = scrollOffset - drawW; x < CONFIG.WIDTH + drawW; x += drawW) {
				ctx.drawImage(bgImgRef.current, x, y, drawW, drawH);
			}
		}

		// Keep a fixed bottom stripe outside the active playfield.
		ctx.fillStyle = '#000';
		ctx.fillRect(0, CONFIG.PLAYFIELD_HEIGHT, CONFIG.WIDTH, CONFIG.BOTTOM_STRIPE_HEIGHT);

		const totalText = formatTotalText(total?.raw ?? 0);
		const totalScale = 3;
		const totalGap = 3;
		const numberXOffsetSourcePx = 1;
		const numberYOffsetSourcePx = 1;
		const numberYOffsetFineTunePx = 3;
		const totalSprites = [...totalText].map((char) => ({ char, sprite: numberImgsRef.current[char] })).filter(
			(item): item is { char: string; sprite: HTMLImageElement } => !!item.sprite,
		);
		const totalWidth = totalSprites.reduce(
			(sum, item, index) => sum + item.sprite.width * totalScale + (index > 0 ? totalGap : 0),
			0,
		);
		const totalHeight = totalSprites.reduce((maxHeight, item) => Math.max(maxHeight, item.sprite.height * totalScale), 0);
		const totalY = CONFIG.PLAYFIELD_HEIGHT + CONFIG.BOTTOM_STRIPE_HEIGHT - totalHeight;
		let totalX = CONFIG.WIDTH - totalWidth;
		for (const item of totalSprites) {
			ctx.drawImage(
				item.sprite,
				totalX - numberXOffsetSourcePx * totalScale,
				totalY - numberYOffsetSourcePx * totalScale + numberYOffsetFineTunePx,
				item.sprite.width * totalScale,
				item.sprite.height * totalScale,
			);
			totalX += item.sprite.width * totalScale + totalGap;
		}

		const donationLabelScale = 2;
		const donationLabelGap = 2;
		const donationLabelTopMarginPx = 130;
		ctx.save();
		ctx.beginPath();
		ctx.rect(0, 0, CONFIG.WIDTH, CONFIG.PLAYFIELD_HEIGHT);
		ctx.clip();
		for (const label of gameState.enemyGroupLabels) {
			const donationText = formatTotalText(label.donationAmount);
			const donationSprites = [...donationText]
				.map((char) => ({ char, sprite: numberImgsRef.current[char] }))
				.filter((item): item is { char: string; sprite: HTMLImageElement } => !!item.sprite);

			if (donationSprites.length === 0) {
				continue;
			}

			const donationWidth = donationSprites.reduce(
				(sum, item, index) => sum + item.sprite.width * donationLabelScale + (index > 0 ? donationLabelGap : 0),
				0,
			);
			const donationHeight = donationSprites.reduce(
				(maxHeight, item) => Math.max(maxHeight, item.sprite.height * donationLabelScale),
				0,
			);

			const donationX = label.x - donationWidth / 2;
			const donationY = label.y - donationHeight - 6;

			let drawX = donationX;
			for (const item of donationSprites) {
				ctx.drawImage(
					item.sprite,
					drawX,
					donationY - numberYOffsetSourcePx * donationLabelScale + numberYOffsetFineTunePx + donationLabelTopMarginPx,
					item.sprite.width * donationLabelScale,
					item.sprite.height * donationLabelScale,
				);
				drawX += item.sprite.width * donationLabelScale + donationLabelGap;
			}
		}
		ctx.restore();

		// Draw charge HUD in the bottom stripe at native sprite size, top-right anchored.
		if (barImgRef.current && barFilledImgRef.current) {
			const barWidth = barImgRef.current.width;
			const barHeight = barImgRef.current.height;
			const barX = (CONFIG.WIDTH - barWidth) / 2;
			const barY = CONFIG.PLAYFIELD_HEIGHT + 3;

			ctx.drawImage(barImgRef.current, barX, barY, barWidth, barHeight);

			const heldSeconds = gameState.chargeTimeMs / 1000;
			const maxChargeSeconds = CONFIG.SHOT_CHARGE_MAX_MS / 1000;
			const chargePercent = Math.max(0, Math.min(1, heldSeconds / maxChargeSeconds));
			const innerLeft = 131;
			const innerRight = 15;
			const fillMaxWidth = Math.max(0, barWidth - innerLeft - innerRight);
			const fillWidth = Math.floor(fillMaxWidth * chargePercent);

			if (fillWidth > 0) {
				const srcFillWidth = (barFilledImgRef.current.width - innerLeft - innerRight) * chargePercent;
				ctx.drawImage(
					barFilledImgRef.current,
					innerLeft,
					0,
					srcFillWidth,
					barFilledImgRef.current.height,
					barX + innerLeft,
					barY,
					fillWidth,
					barFilledImgRef.current.height,
				);
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
			// Death animation
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

		// Draw shots using r-shoot.png with 5 charge rows.
		const SHOT_FRAME_W = 20;
		const SHOT_FRAME_H = 18;
		const SHOT_SRC_X = 127;
		gameState.shots.forEach((shot) => {
			if (shootImgRef.current) {
				const srcY = (shot.chargeLevel - 1) * SHOT_FRAME_H;
				ctx.drawImage(
					shootImgRef.current,
					SHOT_SRC_X, srcY, SHOT_FRAME_W, SHOT_FRAME_H,
					shot.x, shot.y, shot.width, shot.height,
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
				// Death animation
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
