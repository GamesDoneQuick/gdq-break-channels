import { useReplicant } from 'use-nodecg';
import { ChannelProps, registerChannel } from '../channels';
import { Total } from '@gdq/types/tracker';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { useRafCapped } from '@gdq/lib/hooks/useRafCapped';

import PinballModule, { offscreen } from './import';
import { useEffect, useRef } from 'react';
import { BallState, TableState, vector3 } from './bin/SpaceCadetPinball';
import { useListenForFn } from '@gdq/lib/hooks/useListenForFn';
import { useGame } from './hook';

registerChannel('Pinball', 50, Pinball, {
	handle: 'VodBox',
	site: 'SupportClass',
	position: 'bottomLeft',
});

const keysRep = nodecg.Replicant('pinball-keys', {
	defaultValue: {
		LDown: false,
		RDown: false,
	},
});

const pinballData = nodecg.Replicant<TableState | null>('pinball-state', {
	defaultValue: null,
	persistent: true,
});

const pinballHighScore = nodecg.Replicant<number>('pinball-highscore', {
	defaultValue: 0,
	persistent: true,
});

export function Pinball(_: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const game = useGame();

	const canvasRef = useRef<HTMLCanvasElement>(null);

	const keysRef = useRef<HTMLDivElement>(null);

	const elRef = useRef([
		195, 195, 195, 195, 195, 195, 195, 195, 195, 195, 195, 195, 195, 195, 195, 195, 195, 195, 195, 195, 195, 195,
		195, 195,
	]);

	useEffect(() => {
		if (!game) return;

		if (pinballData.value) game.Deserialize(pinballData.value);

		game.pause(false);

		return () => {
			pinballData.value = game.Serialize();
			game.pause(true);
		};
	}, [game]);

	useRafCapped(() => {
		if (!canvasRef.current || !game) return;

		const ctx = canvasRef.current.getContext('2d');

		if (!ctx) return;

		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';

		const data = game.Serialize();

		const avg = elRef.current.reduce((a, b) => a + b) / elRef.current.length;

		const sortedBalls = data.ballList
			.filter((ball: BallState) => ball.active && GetHeightFromPos(ball.position) < 220)
			.sort((a: BallState, b: BallState) => b.position[1] - a.position[1]);

		const height = sortedBalls[0] ? Math.max(Math.min(GetHeightFromPos(sortedBalls[0].position), 195), 18) : avg;

		elRef.current.push(height);
		elRef.current.shift();

		ctx.clearRect(0, 0, 1092, 332);
		ctx.drawImage(offscreen, 0, avg, 380, 158, 131.5, 0, 524, 237);
		ctx.drawImage(offscreen, 0, 353, 380, 63, 131.5, 237, 524, 95);
		ctx.drawImage(offscreen, 382, 197, 193, 43, 787, 0, 305, 68);
		ctx.drawImage(offscreen, 382, 296, 193, 119, 787, 159, 305, 188);
		ctx.drawImage(offscreen, 535, 162, 27, 27, 802, 12, 43, 43);
		//ctx.drawImage(offscreen, 382, 197, 193, 250, 787, 0, 305, 396);

		ctx.beginPath();
		ctx.moveTo(0, 237);
		ctx.lineTo(787, 237);
		ctx.lineWidth = 2;
		ctx.strokeStyle = 'white';
		ctx.stroke();

		if (keysRef.current && keysRep.value) {
			const lEl = keysRef.current.children[0];
			const rEl = keysRef.current.children[2];

			if (keysRep.value.LDown) {
				lEl.classList.remove('unpressed');
			} else {
				lEl.classList.add('unpressed');
			}

			if (keysRep.value.RDown) {
				rEl.classList.remove('unpressed');
			} else {
				rEl.classList.add('unpressed');
			}
		}
	});

	useListenForFn('donation', () => {
		if (!game) return;
		game.sendBall();
	});

	useEffect(() => {
		const listener = (ev: KeyboardEvent) => {
			if (ev.key.toLocaleLowerCase() === 'l') keysRep.value!.LDown = ev.type === 'keydown';
			if (ev.key.toLocaleLowerCase() === 'r') keysRep.value!.RDown = ev.type === 'keydown';
		};

		window.addEventListener('keyup', listener);
		window.addEventListener('keydown', listener);

		return () => {
			window.removeEventListener('keyup', listener);
			window.removeEventListener('keydown', listener);
		};
	}, []);

	return (
		<Container>
			<CompositeCanvas ref={canvasRef} width={1092} height={332} />
			<Keys ref={keysRef}>
				<Key>L</Key>
				<div style={{ flexGrow: 1 }}></div>
				<Key>R</Key>
			</Keys>
			<TotalText>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalText>
		</Container>
	);
}

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	overflow: hidden;
	background: black;
`;

const TotalText = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	text-shadow: -1px 4px black;

	position: absolute;

	top: 27.5%;
	right: 10px;
`;

const CompositeCanvas = styled.canvas`
	position: absolute;
	width: 1092px;
	height: 332px;
	top: 0;
	left: 0;
`;

function GetHeightFromPos(position: vector3) {
	return ((position[1] + 10) / 40) * 400;
}

keysRep.on('change', (newKeys) => {
	PinballModule.then((game) => {
		game.toggleLeftFlipper(newKeys.LDown);
		game.toggleRightFlipper(newKeys.RDown);
	});
});

window.addEventListener('pinballScore', (event) => {
	if (pinballHighScore.status === 'declaring') return;
	if ((pinballHighScore.value ?? 0) < event.detail.score) pinballHighScore.value = event.detail.score;
});

const Keys = styled.div`
	display: flex;
	position: absolute;
	top: 206px;
	left: 74px;
	right: 380px;
	gap: 6px;
`;

const Key = styled.div`
	width: 64px;
	height: 64px;
	background: linear-gradient(135deg, white 10%, #b7aea1 40%, black);
	border-radius: 4px;

	position: relative;

	&::before {
		content: '';
		width: 54px;
		height: 54px;
		position: absolute;
		top: 5px;
		left: 5px;
		border-radius: 4px;

		background: radial-gradient(ellipse at bottom, #b8afa4 20%, #635b51);
		z-index: -1;
	}

	//transition: filter 0.1s, transform 0.1s;
	color: black;
	text-align: center;
	line-height: 66px;
	font-family: 'Arial';
	font-size: 36px;

	&.unpressed {
		filter: brightness(0.65);
		transform: scale(1) translateY(0);
	}

	filter: brightness(1);
	transform: scale(0.9) translateY(0px);
`;
