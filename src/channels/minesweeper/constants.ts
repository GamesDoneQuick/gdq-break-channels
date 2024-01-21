import type { TileData } from './types';

export const FACE_DIMENSION = 36;
export const FACE_ORDER = ['smile', 'smile_pressed', 'open_mouth', 'sunglasses', 'heart_eyes'] as const;

export const MINE_CHANCE = 0.17;

export const GRID_ROWS = 16;
export const GRID_COLUMNS = 66;

export const TILE_DIMENSION = 16.24;

export const TILE_MAP = {
	HIDDEN: [0, 0],
	ONE: [0, 1],
	TWO: [1, 1],
	THREE: [2, 1],
	FOUR: [3, 1],
	FIVE: [4, 1],
	SIX: [5, 1],
	SEVEN: [6, 1],
	EIGHT: [7, 1],
	EMPTY: [1, 0],
	FLAGGED: [2, 0],
	QUESTION_MARK: [3, 0],
} satisfies Record<string, TileData['tileType']>;

export const mineNumberTiles = [
	TILE_MAP.EMPTY,
	TILE_MAP.ONE,
	TILE_MAP.TWO,
	TILE_MAP.THREE,
	TILE_MAP.FOUR,
	TILE_MAP.FIVE,
	TILE_MAP.SIX,
	TILE_MAP.SEVEN,
	TILE_MAP.EIGHT,
];

export const MIN_REVEAL_DONATION = 25;
/** maximum donation amount for determining reveal threshold */
export const REVEAL_DONATION_CAP = 500;
export const MIN_REVEALED_TILES = 1;
export const MAX_REVEALED_TILES = 15;
