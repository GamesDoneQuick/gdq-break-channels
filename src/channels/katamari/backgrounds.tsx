import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

export type BackgroundLayer = {
	src: string;
	opacity?: number;
	blendMode?: React.CSSProperties['mixBlendMode'];
	size?: React.CSSProperties['backgroundSize'];
	position?: React.CSSProperties['backgroundPosition'];
	repeat?: React.CSSProperties['backgroundRepeat'];
	speedSec?: number;
	direction?: 'left' | 'right';
	distancePx?: number;
};

export type BackgroundScene = {
	id: string;
	layers: BackgroundLayer[];
};

export type ParallaxBackgroundProps = {
	className?: string;
	backgrounds?: BackgroundScene[];
	selectedIndex?: number;
};

function resolvePreset(props: ParallaxBackgroundProps): BackgroundScene | undefined {
	const { backgrounds, selectedIndex } = props;
	if (!backgrounds || backgrounds.length === 0) return undefined;

	if (typeof selectedIndex === 'number') {
		const idx = ((selectedIndex % backgrounds.length) + backgrounds.length) % backgrounds.length;
		return backgrounds[idx];
	}

	// Default: first preset
	return backgrounds[0];
}

const scrollLeft = keyframes`
	from { background-position-x: 0px; }
	to   { background-position-x: calc(-1 * var(--bg-dist)); }
`;

const scrollRight = keyframes`
	from { background-position-x: 0px; }
	to   { background-position-x: var(--bg-dist); }
`;

export function ParallaxBackground(props: ParallaxBackgroundProps) {
	const { className } = props;

	const resolved = resolvePreset(props);
	if (!resolved) return null;

	const layers = resolved.layers.slice(0, 9);

	return (
		<Root className={className} data-preset={resolved.id}>
			{layers.map((layer, i) => {
				const speedSec = layer.speedSec ?? 24;
				const direction = layer.direction ?? 'left';
				const distancePx = layer.distancePx ?? 320;

				return (
					<Layer
						key={`${resolved.id}:${i}`}
						data-dir={direction}
						style={{
							backgroundImage: `url(${layer.src})`,
							opacity: layer.opacity ?? 1,
							mixBlendMode: layer.blendMode ?? 'normal',
							backgroundSize: layer.size ?? 'cover',
							backgroundPosition: layer.position ?? 'center',
							backgroundRepeat: layer.repeat ?? 'no-repeat',
							['--bg-dist' as any]: `${distancePx}px`,
							animationDuration: `${speedSec}s`,
							zIndex: i,
						}}
					/>
				);
			})}
		</Root>
	);
}

const Root = styled.div`
	position: absolute;
	inset: 0;
	overflow: hidden;
	pointer-events: none;
	z-index: 0;
`;

const Layer = styled.div`
	position: absolute;
	inset: 0;
	will-change: background-position;
	animation-timing-function: linear;
	animation-iteration-count: infinite;
	&[data-dir='left'] {
		animation-name: ${scrollLeft};
	}
	&[data-dir='right'] {
		animation-name: ${scrollRight};
	}
`;
