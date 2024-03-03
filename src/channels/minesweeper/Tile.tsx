import { css } from '@emotion/react';

import { TILE_DIMENSION } from './constants';
import type { TileData } from './types';

import tiles from './assets/tiles.png';

const SPRITES_PER_ROW = 8;
const SPRITESHEET_ROWS = 2;

export function Tile({ tileType }: TileData) {
	const [x, y] = tileType;

	return (
		<div
			css={css`
				width: ${TILE_DIMENSION}px;
				height: ${TILE_DIMENSION}px;
				background: url(${tiles}) no-repeat;
				background-position: -${x * TILE_DIMENSION}px -${y * TILE_DIMENSION}px;
				background-size: ${TILE_DIMENSION * SPRITES_PER_ROW}px ${TILE_DIMENSION * SPRITESHEET_ROWS}px;
			`}
		/>
	);
}
