import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useEffect, useRef } from 'react';
import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';

import * as PIXI from 'pixi.js';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import { CRTFilter } from '@pixi/filter-crt';

const SPEED_DECAY = 0.995;
const ACCELERATION = 10;

registerChannel('DVD Screen Saver', 4, DVDSS, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'wporter82',
});

function DVDSS(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const totalRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const crtFilter = useRef<CRTFilter | null>(null);
	const bg = useRef<PIXI.Graphics | null>(null);
	const totalSprite = useRef<PIXI.Text | null>(null);

	var randX = randRange(0, 900);
	var randY = randRange(10, 300);

	const pos = useRef({x:randX, y:randY});
	const vel = useRef({x:randVel(), y:randVel()});

	var color = useRef(getRandomColor());

	const frameCount = useRef(0);

	const [pixiApp, canvasRef] = usePIXICanvas({width: 1092, height: 332}, () =>{
		if (!canvasRef.current) return;
		if (!containerRef.current) return;
		if (!totalSprite.current) return;

		frameCount.current++;
	
		if (pos.current.y > 332 - totalSprite.current.height + 10) {
			vel.current.y = -Math.abs(vel.current.y);
			color.current = getRandomColor();
		}
		if (pos.current.y < 0) {
			vel.current.y = Math.abs(vel.current.y);
			color.current = getRandomColor();
		}
		if (pos.current.x > 1092 - totalSprite.current.width + 10) {
			vel.current.x = -Math.abs(vel.current.x);
			color.current = getRandomColor();
		}
		if (pos.current.x < 0) {
			vel.current.x = Math.abs(vel.current.x);
			color.current = getRandomColor();
		}

		if (Math.abs(vel.current.x) > 1)
			vel.current.x *= SPEED_DECAY;
		if (Math.abs(vel.current.y) > 1)
			vel.current.y *= SPEED_DECAY;

		if (Math.abs(vel.current.x) < 1)
			vel.current.x = 1 * Math.sign(vel.current.x);
		if (Math.abs(vel.current.y) < 1)
			vel.current.y = 1 * Math.sign(vel.current.y);

		pos.current.x += vel.current.x;
		pos.current.y += vel.current.y;

		if (totalSprite.current) {
			totalSprite.current.x = pos.current.x;
			totalSprite.current.y = pos.current.y;
			totalSprite.current.style.fill = color.current;

			if (totalRef.current) {
				totalSprite.current.text = totalRef.current.innerText;
			}
		}
	});

	useEffect(() => {
		if (!pixiApp.current || crtFilter.current) return;

		crtFilter.current = new CRTFilter({
			vignetting: 0.25,
			time: 0,
			lineWidth: 1,
			lineContrast: 0.5,
			noise: 0.1,
		});

		totalSprite.current = new PIXI.Text("$0",{fontFamily: "monkeyisland", fontSize: "46px", fill: "#ff00ff"});

		pixiApp.current.stage.filters = [crtFilter.current];
		bg.current = new PIXI.Graphics();

		bg.current.beginFill(0x2a2a2a);
		bg.current.drawRect(0, 0, 1092, 332);
		pixiApp.current.stage.addChild(bg.current);

		pixiApp.current.stage.addChild(totalSprite.current);

	}, [pixiApp, crtFilter]);

	useListenFor('donation', (donation: FormattedDonation) => {
		// Bounce around a little faster when 10k threshold is passed
		const prevTotal = donation.rawNewTotal - donation.rawAmount;
		if (prevTotal != 0) {
			if (Math.floor(prevTotal / 10000) < Math.floor(donation.rawNewTotal / 10000)) {
				vel.current.x *= ACCELERATION;
				vel.current.y *= ACCELERATION;
			}
		}
	});

	return (
		<Container ref={containerRef}>
			<PIXICanvas ref={canvasRef} />
			<TotalEl ref={totalRef}>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalEl>
		</Container>
	);
}

const getRandomColor = (): string => {
	return `hsl(${randRange(0,365)}, ${randRange(50,100)}%, ${randRange(50,80)}%)`;
}

const randRange = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
}

const randVel = (): number => {
	return (Math.random() < 0.5) ? 1 : -1;
}

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	background-color: #fafafa;
`;

const PIXICanvas = styled.canvas`
	position: absolute;
`;

const TotalEl = styled.div`
	display: none;
`;
