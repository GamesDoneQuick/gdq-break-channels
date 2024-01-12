import { css } from '@emotion/react';
import { TILE_DIMENSION } from './constants';

import tiles from './assets/tiles.png';

export type TileData = {
	id: string;
	tileType: readonly [number, number];
	isMine: boolean;
};

export function Tile({ tileType }: TileData) {
	const [x, y] = tileType;

	return (
		<div
			css={css`
				width: 16px;
				height: 16px;
				background: url(${tiles}) no-repeat;
				background-position: -${x * TILE_DIMENSION}px -${y * TILE_DIMENSION}px;
			`}
		/>
	);
}
