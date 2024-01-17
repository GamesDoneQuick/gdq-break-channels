/* eslint-disable react-refresh/only-export-components */
import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import { useEffect, useRef } from 'react';
import { CRTFilter } from '@pixi/filter-crt';
import * as PIXI from 'pixi.js';
import logoFile from './gdq.svg';

registerChannel('DVD', 42, DVDChannel, {
	position: 'bottomLeft',
	site: 'Twitch',
	handle: 'squiddotmid',
});

type DVDLogo = {
	sprite: PIXI.Sprite;
	xVel: number;
	yVel: number;
	rainbow: boolean;
	hue: number;
};

function DVDChannel(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const logos = useRef<DVDLogo[]>([]);
	const logoContainer = useRef<PIXI.Container | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const crtFilter = useRef<CRTFilter | null>(null);
	const backdrop = useRef<PIXI.Graphics | null>(null);

	//const confettiRef = useRef<ConfettiGenerator | null>();

	const logoSpeed = 2;

	const windowWidth = 1092;
	const windowHeight = 332;

	function spawnLogo() {
		if (!logoContainer.current) return;

		const newLogo = PIXI.Sprite.from(logoFile);

		// place logo at a random position within the middle of the window
		newLogo.x = (Math.random() * windowWidth) / 2 + windowWidth / 4;
		newLogo.y = (Math.random() * windowHeight) / 2 + windowHeight / 4;

		const logoData = {
			sprite: newLogo,
			xVel: logoSpeed * (Math.random() < 0.5 ? -1 : 1),
			yVel: logoSpeed * (Math.random() < 0.5 ? -1 : 1),
			rainbow: false,
			hue: 0,
		};

		newLogo.tint = randomColor();
		logos.current.push(logoData);

		logoContainer.current.addChild(newLogo);
	}

	useListenFor('donation', (donation: FormattedDonation) => {
		/**
		 * Respond to a donation.
		 */
		spawnLogo();
	});

	const [app, canvasRef] = usePIXICanvas({ width: windowWidth, height: windowHeight }, () => {
		if (!logoContainer.current) return null;

		logos.current.forEach((logo) => {
			logo.sprite.x += logo.xVel;
			logo.sprite.y += logo.yVel;
			let bounces = 0;

			if (logo.sprite.x <= 0 || logo.sprite.x >= windowWidth - logo.sprite.width) {
				logo.xVel *= -1;
				bounces += 1;
			}
			if (logo.sprite.y <= 0 || logo.sprite.y >= windowHeight - logo.sprite.height) {
				logo.yVel *= -1;
				bounces += 1;
			}

			if (bounces == 1) {
				logo.sprite.tint = randomColor();
			}
			if (bounces == 2) {
				logo.rainbow = true;
			}

			if (logo.rainbow) {
				logo.hue = (logo.hue + 2) % 360;
				const color = HSVtoRGB(logo.hue / 360, 1, 1);
				logo.sprite.tint = color;
			}
		});
	});

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

		backdrop.current.beginFill(0x222222);
		backdrop.current.drawRect(0, 0, windowWidth, windowHeight);
		app.current.stage.addChild(backdrop.current);

		logoContainer.current = new PIXI.Container();

		app.current.stage.addChild(logoContainer.current);

		spawnLogo();
	}, [app, crtFilter]);

	function randomColor() {
		return HSVtoRGB(Math.random(), 0.8, 0.8);
	}

	// Adapted from https://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
	function HSVtoRGB(h: number, s: number, v: number) {
		let r = 0;
		let g = 0;
		let b = 0;

		const i = Math.floor(h * 6);
		const f = h * 6 - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);

		switch (i % 6) {
			case 0:
				(r = v), (g = t), (b = p);
				break;
			case 1:
				(r = q), (g = v), (b = p);
				break;
			case 2:
				(r = p), (g = v), (b = t);
				break;
			case 3:
				(r = p), (g = q), (b = v);
				break;
			case 4:
				(r = t), (g = p), (b = v);
				break;
			case 5:
				(r = v), (g = p), (b = q);
				break;
		}
		return (Math.round(r * 255) << 16) + (Math.round(g * 255) << 8) + Math.round(b * 255);
	}

	return (
		<Container ref={containerRef}>
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
	color: white;

	position: absolute;

	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	-webkit-text-stroke-width: 2px;
	-webkit-text-stroke-color: black;
`;

const Canvas = styled.canvas`
	position: absolute;
	width: 100% !important;
	height: 100% !important;
`;
