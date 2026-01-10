import React, { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { clamp01, lerp } from './utilities';
import { useRafLoop } from 'react-use';

export type Flyer = {
	id: string;
	src: string;
	amountText: string;
	durationMs: number;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	stick: boolean;
	arrived?: boolean;
	scale: number;
};

export type Stuck = {
	id: string;
	src: string;
	angleDeg: number;
	radiusPx: number;
	scale?: number;
};

export type DonationFlyersProps = {
	flyers: Flyer[];
	stuck: Stuck[];
	targetX: number;
	targetY: number;
	onFlyerArrive: (flyer: Flyer, orbitAngleDeg: number) => void;
};

const ORBIT_PERIOD_MS = 1600;

export function DonationFlyers({ flyers, stuck, targetX, targetY, onFlyerArrive }: DonationFlyersProps) {
	const [now, setNow] = useState(() => Date.now());
	useRafLoop(() => setNow(Date.now()));

	const loadedIdsRef = useRef<Set<string>>(new Set());
	const startAtRef = useRef<Map<string, number>>(new Map());
	const arrivedIdsRef = useRef<Set<string>>(new Set());
	const orbitStartMsRef = useRef<number>(Date.now());

	const orbitAngleDeg = (((now - orbitStartMsRef.current) % ORBIT_PERIOD_MS) / ORBIT_PERIOD_MS) * 360;

	const markLoaded = (id: string) => {
		if (!loadedIdsRef.current.has(id)) {
			loadedIdsRef.current.add(id);
			startAtRef.current.set(id, Date.now());
			setNow(Date.now());
		}
	};

	return (
		<Layer>
			{flyers.map((f) => {
				const loaded = loadedIdsRef.current.has(f.id);
				const startMs = startAtRef.current.get(f.id);
				const t = loaded && startMs != null ? clamp01((now - startMs) / f.durationMs) : 0;

				const x = lerp(f.startX, f.endX, t);
				const y = lerp(f.startY, f.endY, t);

				if (t >= 1 && !arrivedIdsRef.current.has(f.id)) {
					arrivedIdsRef.current.add(f.id);
					queueMicrotask(() => onFlyerArrive(f, orbitAngleDeg));
				}

				return (
					<FlyerRoot key={f.id} style={{ left: x, top: y, ['--flyer-scale' as any]: f.scale }}>
						{!f.stick && (
							<AmountText style={{ visibility: f.arrived ? 'hidden' : 'visible' }}>
								{/*{f.amountText}*/}
							</AmountText>
						)}
						<FlyerImg
							src={f.src}
							draggable={false}
							style={{ transform: `scale(${f.scale})`, opacity: loaded ? 1 : 0 }}
							onLoad={() => markLoaded(f.id)}
							onError={() => markLoaded(f.id)}
						/>
					</FlyerRoot>
				);
			})}

			{stuck.length > 0 && (
				<OrbitRoot style={{ left: targetX, top: targetY }}>
					<OrbitSpin style={{ transform: `rotate(${orbitAngleDeg}deg)` }}>
						{stuck.map((s) => (
							<StuckItem
								key={s.id}
								style={{ transform: `rotate(${s.angleDeg}deg) translate(${s.radiusPx}px)` }}>
								<StuckImg
									src={s.src}
									draggable={false}
									style={s.scale != null ? { transform: `scale(${s.scale})` } : undefined}
								/>
							</StuckItem>
						))}
					</OrbitSpin>
				</OrbitRoot>
			)}
		</Layer>
	);
}

const Layer = styled.div`
	position: absolute;
	inset: 0;
	pointer-events: none;
`;

const FlyerRoot = styled.div`
	position: absolute;
	transform: translate(-50%, -50%);
	display: grid;
	place-items: center;
	will-change: left, top;
`;

const AmountText = styled.div`
	position: absolute;
	left: 50%;
	top: calc(-10px - (64px * var(--flyer-scale)) / 2);
	transform: translateX(-50%);
	white-space: nowrap;
	font-size: 20px;
	font-weight: 700;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
	font-family: gdqpixel, serif;
`;

const FlyerImg = styled.img`
	width: 64px;
	height: 64px;
	object-fit: contain;
	transition: opacity 120ms linear;
`;

const OrbitRoot = styled.div`
	position: absolute;
	width: 0;
	height: 0;
	transform: translate(-50%, -50%);
`;

const OrbitSpin = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	transform-origin: 0 0;
	will-change: transform;
`;

const StuckItem = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	transform-origin: 0 0;
`;

const StuckImg = styled.img`
	width: 64px;
	height: 64px;
	object-fit: contain;
`;
