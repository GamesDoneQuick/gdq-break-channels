/**
 * @author Ian Krieger <iandkrieger@gmail.com>
 */

import { registerChannel } from '..';
import type { Total } from '@gdq/types/tracker';

import styled from '@emotion/styled';
import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { useListenFor, useReplicant } from 'use-nodecg';

import background from './background.png';

import clouds1 from './clouds1.png';

import boat1 from './boat1.png';
import boat2 from './boat2.png';
import boat3 from './boat3.png';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import React from 'react';

registerChannel('Stardew Valley', 8, StardewValley, {
	handle: 'IanKrieger',
	position: 'bottomLeft',
	site: 'GitHub',
});

const defaultStyle: CSSProperties = {
	position: 'absolute',
	top: 0,
	left: 0,
	transition: 'transform 1s linear',
	backgroundPosition: '0 0',
	animationDelay: '-0.25s',
};

const boats = [
	{ img: boat1, style: { width: '30px', height: '30px', left: 550 } },
	{ img: boat2, style: { width: '30px', height: '30px', left: 550 } },
	{ img: boat3, style: { width: '30px', height: '20px', left: 550 } },
];

const clouds = [
	{ img: clouds1, style: { width: '140px', height: '120px', zIndex: 1000, top: 0, left: -100 } },
	{ img: clouds1, style: { width: '140px', height: '120px', zIndex: 2000, top: 75, left: -300 } },
	{ img: clouds1, style: { width: '140px', height: '120px', zIndex: 3000, top: 150, left: -100 } },
	{ img: clouds1, style: { width: '140px', height: '120px', zIndex: 4000, top: 225, left: -300 } },

	{ img: clouds1, style: { width: '140px', height: '120px', zIndex: 1000, top: 0, left: -500 } },
	{ img: clouds1, style: { width: '140px', height: '120px', zIndex: 2000, top: 75, left: -700 } },
	{ img: clouds1, style: { width: '140px', height: '120px', zIndex: 3000, top: 150, left: -500 } },
	{ img: clouds1, style: { width: '140px', height: '120px', zIndex: 4000, top: 225, left: -700 } },
];

interface Props {
	background: string;
	style: CSSProperties;
	opposite?: boolean;
	resetOnHide?: boolean;
	wait?: number;
}

const Sprite = ({ style, background, opposite = false, resetOnHide = false, wait = 0 }: Props) => {
	const defPosition = Number(style?.left ?? 0);
	const [position, setPosition] = useState(defPosition);
	const [visible, setVisible] = useState(false);
	const [intervalId, setIntervalId] = useState<NodeJS.Timer>();

	const startAnimation = () => {
		return setInterval(() => {
			if (opposite) {
				setPosition((prevPosition) => prevPosition - 15);
			} else {
				setPosition((prevPosition) => prevPosition + 15);
			}
		}, randomInt(700, 500));
	};

	useEffect(() => {
		const intervalId = startAnimation();
		const timeoutId = setTimeout(() => {
			setVisible(true);
			setIntervalId(intervalId);
		}, wait);

		return () => {
			clearTimeout(timeoutId);
			clearInterval(intervalId);
		};
	}, []);

	useEffect(() => {
		if (position <= -610 || position >= Math.abs(defPosition) + 1092) {
			clearInterval(intervalId);
			setVisible(false);

			if (resetOnHide) {
				const timeoutId = setTimeout(() => {
					setPosition(defPosition);
					setVisible(true);
					setIntervalId(startAnimation());
				}, randomInt(10_000, 5_000));

				return () => {
					clearTimeout(timeoutId);
				};
			}
		}
	}, [position]);

	if (!visible) {
		return null;
	}

	return (
		<div
			style={{
				transform: `translateX(${position}px)`,
				backgroundImage: `url("${background}")`,
				...defaultStyle,
				...style,
			}}
		/>
	);
};

function randomElement<T>(arr: T[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(max: number, min: number) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

export function StardewValley() {
	const [total] = useReplicant<Total | null>('total', null);

	const boatsRef = useRef<ReactNode[]>([]);
	const lastBoatRef = useRef(110);

	useListenFor('donation', () => {
		if (!boatsRef) return;

		const randomBoat = randomElement(boats);

		const bStyle = {
			top: lastBoatRef.current,
			...randomBoat.style,
		};
		const boat = (
			<Sprite
				key={Date.now() + Math.random() * 100}
				background={randomBoat.img}
				opposite={true}
				style={bStyle}
				wait={randomInt(1000, 500)}
			/>
		);
		lastBoatRef.current = lastBoatRef.current >= 275 ? 110 : lastBoatRef.current + 35;

		boatsRef.current.push(boat);
	});

	return (
		<Container>
			{clouds.map((c, idx) => (
				<Sprite key={idx} background={c.img} style={c.style} resetOnHide={true} wait={randomInt(7500, 3000)} />
			))}
			{boatsRef.current.filter((s) => s != null).map((s) => s)}
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
	background: url('${background}');
	background-position: center;
	padding: 0;
	margin: 0;
`;

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	position: absolute;

	left: 50%;
	top: 85%;
	transform: translate(-50%, -50%);
`;
