/**
 * @author Dillon Pentz <dillon@vodbox.io>
 */

import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useEffect, useRef } from 'react';
import { useRafLoop } from 'react-use';
import styled from '@emotion/styled';
import { useListenFor, useReplicant } from 'use-nodecg';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import * as PIXI from 'pixi.js';
import { TilingSprite2d } from 'pixi-projection';

import bus from './images/bus.png';
import tree from './images/tree.gif';
import wheel1 from './images/wheel1.png';
import wheel2 from './images/wheel2.png';
import line1 from './images/line1.png';
import line2 from './images/line2.png';
import line3 from './images/line3.png';
import line4 from './images/line4.png';
import line5 from './images/line5.png';
import line6 from './images/line6.png';
import line7 from './images/line7.png';

import numbersBlack from './images/numbers_black.png';
import numbersWhite from './images/numbers_white.png';

import sand from './images/sand_texture.png';
import lightSand from './images/light_sand_texture.png';
import mask from './images/sand_banks_mask.png';

import bug from './images/bug.png';
import splat from './images/splat.png';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { useActive } from '@gdq/lib/hooks/useActive';

registerChannel('Desert Bus', 16, DesertBus, {
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
	const wheelRef = useRef<HTMLImageElement>(null);
	const speedoRef = useRef<HTMLImageElement>(null);
	const odometerRef = useRef<HTMLDivElement>(null);

	const speed = useRef<number>(firstBus.value ? 45 : -10);
	const left = useRef<number>(10);
	const steer = useRef<number>(1);
	const objects = useRef<Record<string, PIXI.DisplayObject> | null>(null);
	const textures = useRef<Record<string, PIXI.Texture> | null>(null);

	firstBus.value = true;

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		if (!objects.current) return;

		frame.current = (frame.current + 1) % 3;
		if (frame.current !== 0) return;

		const background = objects.current.background as PIXI.Graphics;
		background.clear();

		background.beginFill(0x42cfce);
		background.drawRect(0, 0, 546, 166);
		background.endFill();

		background.beginFill(0x8cefce);
		background.drawRect(0, 43, 546, 1);
		background.endFill();

		background.beginFill(0xceaa8c);
		background.drawRect(0, 44, 546, 1);
		background.endFill();

		background.beginFill(0xce8a21);
		background.drawRect(0, 46, 546, 120);
		background.endFill();

		const x = 442 + left.current * 20;

		const desert = objects.current.desert as TilingSprite2d;
		desert.tilePosition.y = distance * 500;
		desert.tileScale.x = 0.5;
		desert.tileScale.y = 0.1;
		desert.proj.mapSprite(desert, [
			{
				x: 182 + left.current - 100,
				y: 46,
			},
			{
				x: 182 + left.current + 100,
				y: 46,
			},
			{
				x: x + 2300,
				y: 166,
			},
			{
				x: x - 2680,
				y: 166,
			},
		]);

		const road = objects.current.road as PIXI.Graphics;
		road.clear();

		road.beginFill(0x636563);
		road.drawPolygon([182 + left.current, 46, x + 10, 166, x - 490, 166]);
		road.endFill();

		const sandPitsMask = objects.current.sandPitsMask;
		sandPitsMask.transform.setFromMatrix(
			new PIXI.Matrix(0.85, 0, left.current * 0.155 + 0.2, 1, left.current - 158, 46),
		);

		const sandPits = objects.current.sandPits as TilingSprite2d;
		sandPits.tilePosition.y = distance * 330;
		sandPits.tileScale.y = 0.04;
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

		meridian.beginFill(0xefcf42);
		meridian.drawPolygon([182 + left.current, 46, x - 230, 166, x - 250, 166]);
		meridian.endFill();

		const meridianMask = objects.current.meridianMask as PIXI.Graphics;
		meridianMask.clear();

		meridianMask.beginFill(0xffffff);

		for (let i = 0, l = 14; i < l; ++i) {
			const d = Math.pow(((distance * 60) / 4 + i / l) % 1, 6);
			meridianMask.drawRect(0, 46 + d * 120, 546, d * 35);
		}
		meridianMask.endFill();
	});

	useEffect(() => {
		if (!app) return;

		textures.current = {
			sandMask: PIXI.Texture.from(mask),
			sand: PIXI.Texture.from(sand),
			lightSand: PIXI.Texture.from(lightSand),
		};

		objects.current = {
			background: new PIXI.Graphics(),
			desert: new TilingSprite2d(textures.current.lightSand, 546, 166),
			road: new PIXI.Graphics(),
			sandPitsMask: new PIXI.Sprite(textures.current.sandMask),
			sandPits: new TilingSprite2d(textures.current.sand, 546, 166),
			lights: new PIXI.Graphics(),
			meridianMask: new PIXI.Graphics(),
			meridian: new PIXI.Graphics(),
		};

		//(objects.current.sandPits as TilingSprite2d).convertTo2s();

		const container = new PIXI.Container();
		const filter = new PIXI.filters.AlphaFilter(1);
		filter.resolution = 0.5;

		container.filters = [filter];

		container.addChild(objects.current.background);
		container.addChild(objects.current.desert);
		container.addChild(objects.current.road);
		container.addChild(objects.current.sandPits);
		container.addChild(objects.current.sandPitsMask);
		container.addChild(objects.current.lights);
		container.addChild(objects.current.meridian);
		container.addChild(objects.current.meridianMask);

		objects.current.sandPits.mask = objects.current.sandPitsMask as PIXI.Graphics;
		objects.current.meridian.mask = objects.current.meridianMask as PIXI.Graphics;

		app.current?.stage.addChild(container);

		container.setTransform(0, 0, 2, 2);

		return () => {
			for (const key in objects.current) {
				const obj = objects.current[key];
				if (!obj.destroyed) obj.destroy(true);
			}
			for (const key in textures.current) {
				const tex = textures.current[key];
				tex.destroy(true);
			}

			filter.destroy();
			if (!container.destroyed) container.destroy(true);
		};
	}, [app]);

	useRafLoop(() => {
		if (!busRef.current || !wheelRef.current || !speedoRef.current || !odometerRef.current) return;

		const t = distance * 60;
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
			wheelRef.current.src = wheel1;
			wheelRef.current.style.transform = '';
		} else if (r < 0.015) {
			steer.current = -4;
			wheelRef.current.src = wheel1;
			wheelRef.current.style.transform = 'translate(42px, 0) scale(-1, 1)';
		} else if (r < 0.02) {
			steer.current = 4;
			wheelRef.current.src = wheel2;
			wheelRef.current.style.transform = '';
		} else if (r < 0.05) {
			steer.current = 1;
			wheelRef.current.src = wheel1;
			wheelRef.current.style.transform = '';
		}

		if (left.current > 10) {
			steer.current = 1;
			wheelRef.current.src = wheel1;
			wheelRef.current.style.transform = '';
		} else if (left.current < -5) {
			steer.current = -4;
			wheelRef.current.src = wheel1;
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
				<TotalText>
					$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
				</TotalText>
				<Bus src={bus} />
				<Tree src={tree} />
				<Speedo src={line1} ref={speedoRef} />
				<Odometer ref={odometerRef}>
					<Number src={numbersWhite} />
					<Number src={numbersWhite} />
					<Number src={numbersWhite} />
					<Number src={numbersWhite} />
					<Number src={numbersBlack} />
				</Odometer>
				<Wheel src={wheel1} ref={wheelRef} />
			</BusContainer>
		</Container>
	);
}

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

const Odometer = styled.div`
	position: absolute;
	top: 294px;
	left: 361px;

	width: 54px;
	height: 16px;

	background: linear-gradient(to right, black 0px, black 42px, white 42px, white 54px);

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
