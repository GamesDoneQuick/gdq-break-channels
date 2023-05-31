import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import * as PIXI from 'pixi.js';
import { CRTFilter } from '@pixi/filter-crt';
import { useBreakout } from './hook';
import { useEffect, useRef } from 'react';
import { Block, Color, Position } from './game/model';
import {
	AI_SAMPLE_MS,
	BALL_RADIUS,
	BALL_TEMPLATE,
	BLOCK_HEIGHT,
	BLOCK_TEMPLATES,
	BLOCK_WIDTH,
	PADDLE_HEIGHT,
	PADDLE_TEMPLATE,
	PADDLE_WIDTH,
} from './config';
import { BreakoutAI } from './game/ai';
import { angleBetween } from './game/math';

registerChannel('Breakout', 84, Breakout, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'plamoni',
});

function Breakout(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const breakout = useBreakout(
		{
			x: 0,
			y: 0,
			width: 1092,
			height: 320,
		},
		{
			x: 500,
			y: 285,
			width: PADDLE_WIDTH,
			height: PADDLE_HEIGHT,
			collisionBuffer: BALL_RADIUS,
			velocity: 2,
			destroyable: false,
			destroyed: false,
			color: Color.WHITE,
		},
	);

	const blocks = useRef<PIXI.Graphics[]>([]);
	const balls = useRef<PIXI.Graphics[]>([]);
	const backdrop = useRef<PIXI.Graphics | null>(null);
	const paddle = useRef<PIXI.Graphics | null>(null);
	const crtFilter = useRef<CRTFilter | null>(null);
	const ai = useRef<BreakoutAI | null>(null);
	const resetting = useRef<boolean>(false);

	useListenFor('donation', (donation: FormattedDonation) => {
		emitBall();
	});

	function emitBall() {
		const x = breakout.bounds.width / 2;
		const y = breakout.bounds.height / 2;
		const angle = -Math.random() * Math.PI;

		breakout.addBall({
			x,
			y,
			angle,
			amplitude: 1.5,
		});
	}

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 320, transparent: true }, () => {
		if (!app.current || !balls.current || !paddle.current || !crtFilter.current) return;

		crtFilter.current.time += 0.1;
		crtFilter.current.seed = Math.random();

		if (breakout.balls.length > balls.current.length) {
			balls.current.push(
				...Array.from({ length: breakout.balls.length - balls.current.length }, () => {
					const graphics = new PIXI.Graphics(BALL_TEMPLATE.geometry);
					app.current!.stage.addChild(graphics);
					return graphics;
				}),
			);
		}

		balls.current
			.splice(breakout.balls.length, balls.current.length - breakout.balls.length)
			.forEach((ballToRemove) => {
				ballToRemove.destroy();
				app.current!.stage.removeChild(ballToRemove);
			});

		if (breakout.blocks.length > blocks.current.length) {
			blocks.current.push(
				...Array.from({ length: breakout.blocks.length - blocks.current.length }, (_, i) => {
					const graphics = new PIXI.Graphics(
						BLOCK_TEMPLATES.get(breakout.blocks[blocks.current.length + i]?.color ?? Color.RED)?.geometry,
					);
					app.current!.stage.addChild(graphics);
					return graphics;
				}),
			);
		}

		breakout.blocks.forEach((block, i) => {
			blocks.current[i].setTransform(block.x, block.y);
			blocks.current[i].visible = !block.destroyed;
		});

		breakout.balls.forEach((ball, i) => {
			balls.current[i].setTransform(ball.x, ball.y);
		});

		paddle.current.setTransform(breakout.paddle.x, breakout.paddle.y);

		if (breakout.isLevelClear() && !resetting.current) {
			resetting.current = true;

			// Clear all the balls.
			breakout.balls.length = 0;

			breakout.stop();

			const victoryInterval = setInterval(() => {
				breakout.blocks.forEach((block) => {
					block.destroyed = Math.random() > 0.5;
				});
			}, 100);

			setTimeout(() => {
				clearInterval(victoryInterval);

				// Reset all the blocks;
				breakout.blocks.forEach((block) => (block.destroyed = false));

				// We won. Give us a starter ball.
				emitBall();

				resetting.current = false;
				breakout.start();
			}, 2000);
		}

		return () => {
			crtFilter.current?.destroy();
			crtFilter.current = null;

			balls.current.forEach((ball) => {
				if (!ball.destroyed) ball.destroy();
				app.current!.stage.removeChild(ball);
			});
			balls.current.length = 0;

			blocks.current.forEach((block) => {
				if (!block.destroyed) block.destroy();
				app.current!.stage.removeChild(block);
			});
			blocks.current.length = 0;

			if (paddle.current) {
				paddle.current.destroy();
				app.current!.stage.removeChild(paddle.current);
			}

			if (backdrop.current) {
				backdrop.current.destroy();
				app.current!.stage.removeChild(backdrop.current);
			}
		};
	});

	// Create initial filters/backdrop
	useEffect(() => {
		if (!app.current || crtFilter.current) return;
		crtFilter.current = new CRTFilter({
			vignetting: 0.2,
			time: 0,
			lineWidth: 1,
			lineContrast: 0.3,
			noise: 0.1,
		});

		app.current.stage.filters = [crtFilter.current];

		backdrop.current = new PIXI.Graphics();

		backdrop.current.beginFill(Color.LIGHT_GRAY);
		backdrop.current.drawRect(breakout.bounds.x, breakout.bounds.y, breakout.bounds.width, breakout.bounds.height);

		app.current.stage.addChild(backdrop.current);
	}, [app, crtFilter]);

	// Create blocks
	useEffect(() => {
		if (!app.current || total == null || breakout.blocks.length > 1) return;

		function addBlock(color: Color, position: Position) {
			const x = position.x;
			const y = position.y;
			const width = BLOCK_WIDTH;
			const height = BLOCK_HEIGHT;
			const block: Block = {
				x,
				y,
				width,
				height,
				collisionBuffer: BALL_RADIUS,
				color,
				destroyable: true,
				destroyed: false,
			};
			breakout.addBlock(block);
			return block;
		}

		const top = 30;
		const blocksPerRow = 19;
		const skipCount = 7;
		const leftOffset = 26;

		const shouldSkip = (i: number) =>
			i >= Math.floor((blocksPerRow - skipCount) / 2) && i < Math.floor((blocksPerRow + skipCount) / 2);

		Array.from(
			{ length: blocksPerRow },
			(_, i) => !shouldSkip(i) && addBlock(Color.RED, { x: i * (BLOCK_WIDTH + 5) + leftOffset, y: top }),
		);
		Array.from(
			{ length: blocksPerRow },
			(_, i) => !shouldSkip(i) && addBlock(Color.ORANGE, { x: i * (BLOCK_WIDTH + 5) + leftOffset, y: top + 15 }),
		);
		Array.from(
			{ length: blocksPerRow },
			(_, i) => !shouldSkip(i) && addBlock(Color.YELLOW, { x: i * (BLOCK_WIDTH + 5) + leftOffset, y: top + 30 }),
		);
		Array.from({ length: blocksPerRow }, (_, i) =>
			addBlock(Color.GREEN, { x: i * (BLOCK_WIDTH + 5) + leftOffset, y: top + 45 }),
		);
		Array.from({ length: blocksPerRow }, (_, i) =>
			addBlock(Color.BLUE, { x: i * (BLOCK_WIDTH + 5) + leftOffset, y: top + 60 }),
		);
		Array.from({ length: blocksPerRow }, (_, i) =>
			addBlock(Color.INDIGO, { x: i * (BLOCK_WIDTH + 5) + leftOffset, y: top + 75 }),
		);
		Array.from({ length: blocksPerRow }, (_, i) =>
			addBlock(Color.VIOLET, { x: i * (BLOCK_WIDTH + 5) + leftOffset, y: top + 90 }),
		);
	}, [app, total]);

	useEffect(() => {
		if (!app.current || ai.current || !breakout) return;

		ai.current = new BreakoutAI(breakout);

		const aiInterval = setInterval(() => {
			ai.current?.evaluateMove();
		}, AI_SAMPLE_MS);

		return () => {
			clearInterval(aiInterval);
			ai.current = null;
		};
	}, [app, ai]);

	// Create paddle
	useEffect(() => {
		if (!app.current || paddle.current) return;

		paddle.current = new PIXI.Graphics(PADDLE_TEMPLATE.geometry);

		app.current.stage.addChild(paddle.current);
	}, [app, paddle]);

	return (
		<Container>
			<Canvas ref={canvasRef} />
			<TotalEl>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalEl>
		</Container>
	);
}

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
`;

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: rgb(200 200 200);

	position: absolute;

	right: calc(50% + -5px);
	top: 5%;
	transform: translateX(50%);
`;

const Canvas = styled.canvas`
	position: absolute;
	width: 100% !important;
	height: 100% !important;
`;
