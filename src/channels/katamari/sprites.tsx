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
	xOffset?: number;
	yOffset?: number;
	className?: string;
	style?: React.CSSProperties;
	playing?: boolean;
	pixelated?: boolean;
	startFrame?: number;
};

function getFrameXY(index: number, cols: number) {
	return {
		x: -(index % cols),
		y: -Math.floor(index / cols),
	};
}

function makeGridSpriteKeyframes(cols: number, frames: number) {
	const parts: string[] = [];
	for (let i = 0; i < frames; i++) {
		const pct = (i / frames) * 100;
		const { x, y } = getFrameXY(i, cols);
		parts.push(`${pct.toFixed(4)}% { --sx: ${x}; --sy: ${y}; }`);
	}
	parts.push(`100% { --sx: 0; --sy: 0; }`);
	return keyframes`${css(parts.join('\n'))}`;
}

const Root = styled.div`
	position: absolute;
	overflow: hidden;
	pointer-events: none;
`;

type SheetStyleProps = {
	$tileW: number;
	$tileH: number;
	$scale: number;
	$cols: number;
	$rows: number;
	$frames: number;
	$durationSec: number;
};

const Sheet = styled.div<SheetStyleProps>`
	position: absolute;
	inset: 0;
	background-repeat: no-repeat;
	background-size: ${({ $tileW, $tileH, $scale, $cols, $rows }) =>
		`${$tileW * $cols * $scale}px ${$tileH * $rows * $scale}px`};
	image-rendering: auto;

	&[data-pixelated='true'] {
		image-rendering: pixelated;
	}

	background-position: calc(var(--sx, 0) * ${({ $tileW, $scale }) => $tileW * $scale}px)
		calc(var(--sy, 0) * ${({ $tileH, $scale }) => $tileH * $scale}px);

	animation-duration: ${({ $durationSec }) => `${$durationSec}s`};
	animation-timing-function: steps(${({ $frames }) => $frames});
	animation-iteration-count: infinite;
	animation-name: ${({ $cols, $frames }) =>
		css`
			${makeGridSpriteKeyframes($cols, $frames)}
		`};

	&[data-playing='false'] {
		animation-name: none;
	}
`;

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
	const maxFrames = columns * rows;
	const totalFrames = Math.min(frameCount ?? maxFrames, maxFrames);
	const durationSec = fps !== 0 ? totalFrames / fps : 6000;

	const clampedStart = Math.max(0, Math.min(totalFrames - 1, startFrame));
	const { x: startX, y: startY } = getFrameXY(clampedStart, columns);
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
			}}>
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
