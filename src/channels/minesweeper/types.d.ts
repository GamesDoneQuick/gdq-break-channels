import { FACE_ORDER } from './constants';

export type FaceType = (typeof FACE_ORDER)[number];

export type TileData = {
	id: string;
	tileType: readonly [number, number];
	isMine: boolean;
};

export type GridState = {
	grid: TileData[][];
	mines: string[];
	nonMines: string[];
};
