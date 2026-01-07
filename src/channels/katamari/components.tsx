import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

export const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	overflow: hidden;
`;

export const TotalEl = styled.div`
	font-family: gdqpixel, serif;
	font-size: 32px;
	color: white;
	position: absolute;
	left: 38%;
	top: 52%;
	transform: translate(0, -50%);
	filter: drop-shadow(2px 3px black);
`;

export const GoalAmount = styled.div`
	font-family: gdqpixel, serif;
	font-size: 20px;
	color: white;
	text-anchor: middle;
	dominant-baseline: middle;
	position: absolute;
	top: 82%;
	left: 63.5%;
	transform: translate(-50%, -50%) rotate(-25deg);
	filter: drop-shadow(1px 1px #9c4d43) drop-shadow(1px -1px #9c4d43) drop-shadow(-1px 1px #9c4d43)
		drop-shadow(-1px -1px #9c4d43);
`;

type FlowerOverlayProps = {
	size?: number;
	xOffset?: number;
	yOffset?: number;
	scale?: number;
	className?: string;
	children?: React.ReactNode;
};

const pulseSwayA = keyframes`
	0%   { transform: translate(0px, 0px) rotate(-1.5deg) scale(1.00); }
	25%  { transform: translate(1px, -2px) rotate(1.0deg) scale(1.02); }
	50%  { transform: translate(-1px, 1px) rotate(-0.5deg) scale(0.99); }
	75%  { transform: translate(1px, 2px) rotate(1.8deg) scale(1.03); }
	100% { transform: translate(0px, 0px) rotate(-1.5deg) scale(1.00); }
`;

const pulseSwayB = keyframes`
	0%   { transform: translate(0px, 0px) rotate(1.2deg) scale(1.00); }
	30%  { transform: translate(-2px, -1px) rotate(-1.0deg) scale(1.015); }
	60%  { transform: translate(2px, 2px) rotate(1.6deg) scale(1.03); }
	100% { transform: translate(0px, 0px) rotate(1.2deg) scale(1.00); }
`;

const pulseSwayC = keyframes`
	0%   { transform: translate(0px, 0px) rotate(0deg) scale(1.00); }
	20%  { transform: translate(1px, 1px) rotate(-1.6deg) scale(1.02); }
	55%  { transform: translate(-2px, 0px) rotate(1.2deg) scale(0.995); }
	85%  { transform: translate(1px, -2px) rotate(-0.8deg) scale(1.025); }
	100% { transform: translate(0px, 0px) rotate(0deg) scale(1.00); }
`;

export function KatamariTracker({
	size = 320,
	xOffset = 0,
	yOffset = 0,
	scale = 1,
	className,
	children,
}: FlowerOverlayProps) {
	const clamped = Math.max(0, Math.min(1, scale));
	const s = clamped <= 0 ? 0.001 : clamped;
	const cx = 160;
	const cy = 160;
	const bloomTransform = `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`;

	return (
		<FlowerRoot className={className} style={{ width: size, height: size, left: xOffset, top: yOffset }}>
			<FlowerSvg
				width="100%"
				height="100%"
				viewBox="-24 -24 368 368"
				preserveAspectRatio="xMinYMin meet"
				xmlns="http://www.w3.org/2000/svg">
				<defs>
					<marker
						id="arrow"
						viewBox="0 0 20 20"
						refX="5"
						refY="5"
						markerWidth="6"
						markerHeight="6"
						orient="auto-start-reverse"
						stroke="#5e5e5e"
						fill="#5e5e5e">
						<path d="M 0 0 L 10 5 L 0 10 z" />
					</marker>
				</defs>

				<g className="bloom" transform={bloomTransform}>
					<g className="ring ring--1">
						<path d={makeScallopPath({ cx: 160, cy: 160, r: 150, bumps: 24, bump: 18 })} fill="#E88A73" />
					</g>
					<g className="ring ring--2">
						<path d={makeScallopPath({ cx: 160, cy: 160, r: 122, bumps: 20, bump: 16 })} fill="#59C25B" />
					</g>
					<g className="ring ring--3">
						<path d={makeScallopPath({ cx: 160, cy: 160, r: 98, bumps: 18, bump: 14 })} fill="#E77A86" />
					</g>
					<g className="ring ring--4">
						<path d={makeScallopPath({ cx: 160, cy: 160, r: 78, bumps: 16, bump: 12 })} fill="#F3D34C" />
					</g>
					<g className="ring ring--5">
						<path d={makeScallopPath({ cx: 160, cy: 160, r: 60, bumps: 14, bump: 10 })} fill="#4AB3E2" />
					</g>
					<g className="ring ring--6">
						<path d={makeScallopPath({ cx: 160, cy: 160, r: 48, bumps: 12, bump: 10 })} fill="#6B63A8" />
					</g>
				</g>
				<path
					d={makeArc({ cx: 160, cy: 160, r: 140, startAngle: 90, endAngle: 405 })}
					fill="none"
					stroke="#5e5e5e"
					strokeWidth="4"
					markerEnd="url(#arrow)"
					markerStart="url(#arrow)"
					opacity=".6"
				/>
			</FlowerSvg>
			<FlowerContent>{children}</FlowerContent>
		</FlowerRoot>
	);
}

const FlowerRoot = styled.div`
	position: absolute;
	pointer-events: none;
`;

const FlowerSvg = styled.svg`
	display: block;
	width: 100%;
	height: 100%;

	.ring {
		transform-box: fill-box;
		transform-origin: center;
		will-change: transform;
	}

	.ring--1 {
		animation: ${pulseSwayA} 2.6s ease-in-out infinite;
	}
	.ring--2 {
		animation: ${pulseSwayB} 3.1s ease-in-out infinite;
		animation-delay: -0.4s;
	}
	.ring--3 {
		animation: ${pulseSwayC} 2.9s ease-in-out infinite;
		animation-delay: -1.1s;
	}
	.ring--4 {
		animation: ${pulseSwayA} 3.4s ease-in-out infinite;
		animation-delay: -0.8s;
	}
	.ring--5 {
		animation: ${pulseSwayB} 2.2s ease-in-out infinite;
		animation-delay: -0.6s;
	}
	.ring--6 {
		animation: ${pulseSwayC} 1.9s ease-in-out infinite;
		animation-delay: -0.9s;
	}
`;

const FlowerContent = styled.div`
	position: absolute;
	inset: 0; /* top/right/bottom/left: 0 */
	pointer-events: none;
`;

function makeScallopPath(opts: { cx: number; cy: number; r: number; bumps: number; bump: number }): string {
	const { cx, cy, r, bumps, bump } = opts;

	const points: { x: number; y: number; rr: number }[] = [];
	for (let i = 0; i < bumps; i++) {
		const t = (i / bumps) * Math.PI * 2;
		const rr = i % 2 === 0 ? r + bump : r;
		points.push({
			x: cx + Math.cos(t) * rr,
			y: cy + Math.sin(t) * rr,
			rr,
		});
	}

	let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} `;
	for (let i = 1; i <= points.length; i++) {
		const p = points[i % points.length];
		const arcR = Math.max(8, r * 0.18);
		d += `A ${arcR.toFixed(2)} ${arcR.toFixed(2)} 0 0 1 ${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
	}
	d += 'Z';
	return d;
}

function makeArc(opts: { cx: number; cy: number; r: number; startAngle: number; endAngle: number }): string {
	const { cx, cy, r, startAngle, endAngle } = opts;
	const startAngleR = (startAngle / 360) * Math.PI * 2;
	const endAngleR = (endAngle / 360) * Math.PI * 2;
	const x1 = cx + Math.cos(startAngleR) * r;
	const y1 = cy + Math.sin(startAngleR) * r;
	const x2 = cx + Math.cos(endAngleR) * r;
	const y2 = cy + Math.sin(endAngleR) * r;

	return `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`;
}
