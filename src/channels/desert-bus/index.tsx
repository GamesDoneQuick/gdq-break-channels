/**
 * @author Dillon Pentz <dillon@vodbox.io>
 */

import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useListenFor, useReplicant } from 'use-nodecg';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import * as PIXI from 'pixi.js';
import { Sprite2d, TilingSprite2d } from 'pixi-projection';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { useActive } from '@gdq/lib/hooks/useActive';
import { useRafCapped } from '@gdq/lib/hooks/useRafCapped';

import {
	Sprites,
	bug,
	headlights,
	line1,
	line2,
	line3,
	line4,
	line5,
	line6,
	line7,
	numbersBlack,
	splat,
	tree,
} from './sprites';
import { useObjects } from './useObjects';
import { Palettes } from './palettes';
import { keyframes } from '@emotion/react';

registerChannel('Desert Bus', 18, DesertBus, {
	handle: 'VodBox',
	position: 'bottomRight',
	site: 'SupportClass',
});

const lines = [line1, line2, line3, line4, line5, line6, line7];

PIXI.settings.ROUND_PIXELS = true;
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const firstBus = nodecg.Replicant<boolean>('desert-bus-started', {
	defaultValue: false,
});

const distanceRep = nodecg.Replicant<number>('desert-bus-distance', {
	defaultValue: 0,
});

let distance = 0;

export function DesertBus(_: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const active = useActive();

	useEffect(() => {
		distance = distanceRep.value ?? 0;
	}, []);

	const frame = useRef(0);

	const busRef = useRef<HTMLDivElement>(null);
	const headlightsRef = useRef<HTMLImageElement>(null);
	const wheelRef = useRef<HTMLImageElement>(null);
	const speedoRef = useRef<HTMLImageElement>(null);
	const odometerRef = useRef<HTMLDivElement>(null);

	const speed = useRef<number>(firstBus.value ? 45 : -10);
	const left = useRef<number>(10);
	const steer = useRef<number>(1);

	if (active) firstBus.value = true;

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		if (!objects.current) return;

		frame.current = (frame.current + 1) % 3;
		if (frame.current !== 0) return;

		const background = objects.current.background as PIXI.Graphics;
		background.clear();

		background.beginFill(Palettes[timeDay].sky);
		background.drawRect(0, 0, 546, 166);
		background.endFill();

		background.beginFill(Palettes[timeDay].horizonSky);
		background.drawRect(0, 43, 546, 1);
		background.endFill();

		background.beginFill(Palettes[timeDay].horizonSky);
		background.drawRect(0, 44, 546, 1);
		background.endFill();

		background.beginFill(Palettes[timeDay].ground);
		background.drawRect(0, 46, 546, 120);
		background.endFill();

		const x = 442 + left.current * 20;

		const desert = objects.current.desert as TilingSprite2d;
		desert.tilePosition.y = (distance * 275 * 0.75) % 166;
		desert.tileScale.x = 2;
		desert.tileScale.y = 0.05;
		desert.width = 2048;
		desert.proj.mapSprite(desert, [
			{
				x: 182 + left.current - 5,
				y: 46,
			},
			{
				x: 182 + left.current + 5,
				y: 46,
			},
			{
				x: x + 100,
				y: 166,
			},
			{
				x: x - 480,
				y: 166,
			},
		]);

		const road = objects.current.road as PIXI.Graphics;
		road.clear();

		road.beginFill(Palettes[timeDay].road);
		road.drawPolygon([182 + left.current, 46, x + 10, 166, x - 490, 166]);
		road.endFill();

		const sandPitsMask = objects.current.sandPitsMask;
		sandPitsMask.transform.setFromMatrix(
			new PIXI.Matrix(0.85, 0, left.current * 0.155 + 0.2, 1, left.current - 158, 46),
		);

		const sandPits = objects.current.sandPits as TilingSprite2d;
		sandPits.tilePosition.y = (distance * 275 * 0.75) % 166;
		sandPits.tileScale.y = 0.02;
		sandPits.alpha = 1;
		sandPits.proj.mapSprite(sandPits, [
			{
				x: 177 + left.current,
				y: 46,
			},
			{
				x: 187 + left.current,
				y: 46,
			},
			{
				x: x + 160,
				y: 166,
			},
			{
				x: x - 640,
				y: 166,
			},
		]);

		const meridian = objects.current.meridian as PIXI.Graphics;
		meridian.clear();

		meridian.beginFill(Palettes[timeDay].meridian);
		meridian.drawPolygon([182 + left.current, 46, x - 232, 166, x - 248, 166]);
		meridian.endFill();

		const meridianMask = objects.current.meridianMask as PIXI.Graphics;
		meridianMask.clear();

		meridianMask.beginFill(0xffffff);

		for (let i = 0, l = 14; i < l; ++i) {
			const d = Math.pow(((distance * 50 * 0.85) / 4 + i / l) % 1, 6);
			if (timeDay === 'night') meridianMask.drawRect(0, 56 + d * 120, 546, d * 15);
			else meridianMask.drawRect(0, 46 + d * 120, 546, d * 35);
		}
		meridianMask.endFill();

		const dStop = Math.pow(((distance * 20 * 0.85) / 4) % 3, 6);
		const busStop = objects.current.busStop as Sprite2d;
		busStop.position.x = (184 + left.current) * (1 - dStop) + dStop * (x + 145);
		busStop.position.y = 46 + dStop * 120;
		busStop.scale.set(dStop * 1.6);

		const dBanner = Math.pow((((distance + 1) * 20 * 0.85) / 4) % 3, 6);
		const banner = objects.current.banner as Sprite2d;
		banner.position.x = (184 + left.current) * (1 - dBanner) + dBanner * (x + 145);
		banner.position.y = 46 + dBanner * 120;
		banner.scale.set(dBanner * 1.6);
	});

	const { timeDay, objects } = useObjects(app);

	useRafCapped(() => {
		if (!busRef.current || !wheelRef.current || !speedoRef.current || !odometerRef.current) return;

		const t = distance * 50;
		const p = 1;

		speed.current = Math.min(speed.current + 0.05, 45);

		const line = Math.round(Math.max(speed.current, 0) / (45 / 13));

		if (line < 7) {
			speedoRef.current.src = lines[line];
			speedoRef.current.style.transform = '';
		} else if (line < 13) {
			speedoRef.current.src = lines[12 - line];
			speedoRef.current.style.transform = 'translate(0px, 2px) scale(1, -1)';
		} else {
			speedoRef.current.src = lines[1];
			speedoRef.current.style.transform = 'translate(-4px, 4px) scale(-1, -1)';
		}

		if (headlightsRef.current) {
			headlightsRef.current.style.animationDuration = 46.35 - speed.current + 's';
		}

		const prevDistance = distanceRep.value ?? 0;
		const prevDistanceStr = (Math.floor(prevDistance) + '').padStart(4, '0');

		distance = distance + Math.max(speed.current, 0) / 60 / 60 / 60;
		const distanceStr = (Math.floor(distance) + '').padStart(4, '0');

		if (active && speed.current > 0 && distanceRep.value !== undefined) {
			distanceRep.value = distance;
		}

		const r = Math.random();

		if (speed.current < 10) {
			steer.current = 1;
			wheelRef.current.src = Sprites[timeDay].wheel1;
			wheelRef.current.style.transform = '';
		} else if (r < 0.015) {
			steer.current = -4;
			wheelRef.current.src = Sprites[timeDay].wheel1;
			wheelRef.current.style.transform = 'translate(42px, 0) scale(-1, 1)';
		} else if (r < 0.02) {
			steer.current = 4;
			wheelRef.current.src = Sprites[timeDay].wheel2;
			wheelRef.current.style.transform = '';
		} else if (r < 0.05) {
			steer.current = 1;
			wheelRef.current.src = Sprites[timeDay].wheel1;
			wheelRef.current.style.transform = '';
		}

		if (left.current > 10) {
			steer.current = 1;
			wheelRef.current.src = Sprites[timeDay].wheel1;
			wheelRef.current.style.transform = '';
		} else if (left.current < -5) {
			steer.current = -4;
			wheelRef.current.src = Sprites[timeDay].wheel1;
			wheelRef.current.style.transform = 'translate(42px, 0) scale(-1, 1)';
		}

		left.current -= (steer.current * Math.max(speed.current, 0)) / 2400;

		busRef.current.style.transform = `translate(0, ${
			2 * Math.floor(3 * (2 * Math.abs(2 * (t / p - Math.floor(t / p + 0.5))) - 1))
		}px)`;

		(odometerRef.current.lastChild as HTMLElement).style.transform = `translate(0, -${
			Math.floor((((distance * 10) % 10) / 10) * 80) * 2
		}px)`;

		for (let i = 0; i < 4; ++i) {
			const digit = parseInt(distanceStr[i]);
			const prevDigit = parseInt(prevDistanceStr[i]);

			const el = odometerRef.current.children[i] as HTMLElement;

			el.style.transform = `translate(0, -${digit * 16}px)`;

			if (digit !== prevDigit) {
				el.animate(
					[
						{
							transform: `translate(0, -${prevDigit * 16}px)`,
						},
						{
							transform: `translate(0, -${(prevDigit + 1) * 16}px)`,
						},
					],
					{
						duration: 200,
					},
				);
			}
		}
	});

	useListenFor('donation', (donation: FormattedDonation) => {
		if (!busRef.current) return;

		const posX = Math.floor(Math.random() * 506) * 2 + 16;
		const posY = Math.floor(Math.random() * 86) * 2 + 30;

		const el = document.createElement('img');
		el.src = bug;
		el.style.transform = `translate(${posX}px, ${posY}px)`;

		busRef.current.prepend(el);

		setTimeout(() => {
			if (!busRef.current) return;

			el.src = splat;

			setTimeout(() => {
				busRef.current?.removeChild(el);
			}, 20000);
		}, 500);
	});

	return (
		<Container>
			<Canvas width={1092} height={332} ref={canvasRef} />
			<BusContainer ref={busRef}>
				{timeDay === 'night' && <Headlights ref={headlightsRef} src={headlights} />}
				<TotalText>
					$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
				</TotalText>
				<Bus src={Sprites[timeDay].bus} />
				<Tree src={tree} />
				<Speedo src={line1} ref={speedoRef} />
				<Odometer timeDay={timeDay} ref={odometerRef}>
					<Number src={Sprites[timeDay].numbersWhite} />
					<Number src={Sprites[timeDay].numbersWhite} />
					<Number src={Sprites[timeDay].numbersWhite} />
					<Number src={Sprites[timeDay].numbersWhite} />
					<Number src={numbersBlack} />
				</Odometer>
				<Wheel src={Sprites[timeDay].wheel1} ref={wheelRef} />
			</BusContainer>
		</Container>
	);
}

const HeadlightAnim = keyframes`
	0% {
		transform: translate(0, 0);
	}

	20% {
		transform: translate(2px, 4px);
	}

	40% {
		transform: translate(0, 8px);
	}

	60% {
		transform: translate(-2px, 4px);
	}

	80% {
		transform: translate(0, 0);
	}
`;

const Headlights = styled.img`
	opacity: 0.5;
	position: absolute;
	top: 170px;
	left: 260px;

	animation: ${HeadlightAnim} 1s steps(2, end) infinite;
`;

const TotalText = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	text-shadow: -1px 4px black;

	position: absolute;

	bottom: 50%;
	right: 20px;
`;

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	overflow: hidden;
	background: #42cfce;
`;

const Canvas = styled.canvas`
	position: absolute;
	width: 100% !important;
	height: 100% !important;
`;

const BusContainer = styled.div`
	position: absolute;
	top: -6px;
	left: 0;
	width: 1092px;
	height: 344px;

	img {
		position: absolute;
	}
`;

const Bus = styled.img`
	top: 0;
	left: 0;
`;

const Tree = styled.img`
	left: 430px;
	top: 63px;
`;

const Wheel = styled.img`
	top: 260px;
	left: 45px;
`;

const Speedo = styled.img`
	top: 324px;
	left: 191px;
	transform-origin: top right;
`;

const Odometer = styled.div<{ timeDay: 'night' | 'dawn' | 'day' | 'dusk' }>`
	position: absolute;
	top: 294px;
	left: 361px;

	width: 54px;
	height: 16px;

	background: linear-gradient(
		to right,
		black 0px,
		black 42px,
		${(p) => (p.timeDay === 'dawn' ? '#88aaaa' : p.timeDay === 'night' ? '#002244' : 'white')} 42px,
		${(p) => (p.timeDay === 'dawn' ? '#88aaaa' : p.timeDay === 'night' ? '#002244' : 'white')} 54px
	);

	overflow: hidden;

	img {
		position: relative;
	}
`;

const Number = styled.img`
	float: left;
	margin-top: 2px;
	margin-right: 2px;

	&:last-of-type {
		margin-left: 4px;
	}
`;
