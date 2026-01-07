// sprites.tsx (only showing the GridSprite pieces that change)
import React from 'react';
import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/react';

export type GridSpriteProps = {
	src: string;

	tileWidth: number;
	tileHeight: number;

	columns: number;
	rows: number;
	frameCount?: number;

	fps?: number;

	scale?: number;

	// NEW: positioning (absolute)
	xOffset?: number;
	yOffset?: number;

	className?: string;
	style?: React.CSSProperties;

	playing?: boolean;
	pixelated?: boolean;
	startFrame?: number;
};

function makeGridSpriteKeyframes(cols: number, frames: number) {
	const parts: string[] = [];

	for (let i = 0; i < frames; i++) {
		const pct = (i / frames) * 100;
		const x = -(i % cols);
		const y = -Math.floor(i / cols);
		parts.push(`${pct.toFixed(4)}% { --sx: ${x}; --sy: ${y}; }`);
	}

	parts.push(`100% { --sx: 0; --sy: 0; }`);
	return keyframes`${css(parts.join('\n'))}`;
}

export function GridSprite({
							   src,
							   tileWidth,
							   tileHeight,
							   columns,
							   rows,
							   frameCount,
							   fps = 12,
							   scale = 1,
							   xOffset = 0,
							   yOffset = 0,
							   className,
							   style,
							   playing = true,
							   pixelated = true,
							   startFrame = 0,
						   }: GridSpriteProps) {
	const totalFrames = frameCount ?? columns * rows;

	const clampedStart = Math.max(0, Math.min(totalFrames - 1, startFrame));
	const startX = -(clampedStart % columns);
	const startY = -Math.floor(clampedStart / columns);

	const durationSec = totalFrames / fps;

	// Rendered (on-screen) frame size
	const frameW = tileWidth * scale;
	const frameH = tileHeight * scale;

	return (
		<Root
			className={className}
			style={{
				width: frameW,
				height: frameH,
				left: xOffset,
				top: yOffset,
				...style,
			}}
		>
			<Sheet
				aria-hidden="true"
				data-playing={playing}
				data-pixelated={pixelated}
				style={{
					backgroundImage: `url(${src})`,
					['--sx' as any]: startX,
					['--sy' as any]: startY,
				}}
				$tileW={tileWidth}
				$tileH={tileHeight}
				$scale={scale}
				$cols={columns}
				$rows={rows}
				$frames={totalFrames}
				$durationSec={durationSec}
			/>
		</Root>
	);
}

const Root = styled.div`
	position: absolute; /* NEW: makes xOffset/yOffset work */
	overflow: hidden;   /* ensures we crop to one frame */
	pointer-events: none;
`;

const Sheet = styled.div<{
	$tileW: number;
	$tileH: number;
	$scale: number;
	$cols: number;
	$rows: number;
	$frames: number;
	$durationSec: number;
}>`
	position: absolute;
	inset: 0;

	background-repeat: no-repeat;

	/* Scale the entire sheet to match the scaled tile viewport */
	background-size: ${({ $tileW, $tileH, $scale, $cols, $rows }) =>
		`${$tileW * $cols * $scale}px ${$tileH * $rows * $scale}px`};

	/* Pixel-art friendly */
	image-rendering: auto;
	&[data-pixelated='true'] {
		image-rendering: pixelated;
	}

	/* Offset in scaled pixels so one frame fills the viewport */
	background-position: calc(var(--sx, 0) * ${({ $tileW, $scale }) => $tileW * $scale}px)
	calc(var(--sy, 0) * ${({ $tileH, $scale }) => $tileH * $scale}px);

	animation-duration: ${({ $durationSec }) => `${$durationSec}s`};
	animation-timing-function: steps(${({ $frames }) => $frames});
	animation-iteration-count: infinite;
	animation-name: ${({ $cols, $frames }) => css`${makeGridSpriteKeyframes($cols, $frames)}`};

	&[data-playing='false'] {
		animation-name: none;
	}
`;
