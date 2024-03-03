import {
	REVEAL_DONATION_CAP,
	GRID_COLUMNS,
	GRID_ROWS,
	MAX_REVEALED_TILES,
	MIN_REVEAL_DONATION,
	MIN_REVEALED_TILES,
	mineNumberTiles,
} from './constants';
import type { TileData } from './types';

export function random(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min;
}

export function randomFromArray<T>(arr: T[]) {
	const randomIndex = random(0, arr.length);
	return arr[randomIndex];
}

export function splitTileIndex(indexStr: string) {
	return indexStr.split(':').map((index) => Number(index));
}

export function isTileInbounds(rowIndex: number, tileIndex: number) {
	return rowIndex >= 0 && rowIndex < GRID_ROWS && tileIndex >= 0 && tileIndex < GRID_COLUMNS;
}

function getAdjacentTiles(rowIndex: number, tileIndex: number) {
	return [
		[rowIndex - 1, tileIndex],
		[rowIndex, tileIndex - 1],
		[rowIndex, tileIndex + 1],
		[rowIndex + 1, tileIndex],
	];
}

function getSurroundingTiles(rowIndex: number, tileIndex: number) {
	return [
		[rowIndex - 1, tileIndex - 1],
		[rowIndex - 1, tileIndex],
		[rowIndex - 1, tileIndex + 1],
		[rowIndex, tileIndex - 1],
		[rowIndex, tileIndex + 1],
		[rowIndex + 1, tileIndex - 1],
		[rowIndex + 1, tileIndex],
		[rowIndex + 1, tileIndex + 1],
	];
}

export function getMineCount(grid: TileData[][], tileId: string) {
	const [rowIndex, tileIndex] = splitTileIndex(tileId);
	const surroundingTiles = getSurroundingTiles(rowIndex, tileIndex);
	const surroundingMineCount = surroundingTiles.reduce((mineCount, [r, t]) => {
		if (!isTileInbounds(r, t)) {
			return mineCount;
		}
		return mineCount + (grid[r][t].isMine ? 1 : 0);
	}, 0);
	return surroundingMineCount;
}

export function createTileCluster(grid: TileData[][], startingTileId: string) {
	const visitedTiles: TileData[] = [];
	const [rowIndex, tileIndex] = splitTileIndex(startingTileId);

	function visitTile(rowIndex: number, tileIndex: number) {
		const tile = grid[rowIndex]?.[tileIndex] as TileData | undefined;
		// stop tile from being revealed (and cascading further)
		// when the following conditions are met
		if (
			// not a valid tile
			!tile ||
			// the tile is a mine
			tile.isMine ||
			// has already been visisted
			visitedTiles.find((visitedTile) => visitedTile.id === tile.id)
		) {
			return;
		}

		const mineCount = getMineCount(grid, tile.id);
		visitedTiles.push({
			...tile,
			tileType: mineNumberTiles[mineCount],
		});

		// stop revealing once we hit a number tile
		if (mineCount > 0) {
			return;
		}

		const adjacentTiles = getAdjacentTiles(rowIndex, tileIndex);
		adjacentTiles.forEach(([ajacentRowIndex, adjacentTileIndex]) => visitTile(ajacentRowIndex, adjacentTileIndex));
	}

	visitTile(rowIndex, tileIndex);

	return visitedTiles;
}

export function getTileRevealThreshold(donationAmount: number) {
	// cap the maximum donation amount
	const amount = Math.min(donationAmount, REVEAL_DONATION_CAP);
	// transforms donation range from $(MIN_DONATION_TO_REVEAL) - $(DONATION_REVEAL_CAP)
	// to (MIN_REVEALED_TILES) to (MAX_REVEALED_TILES) revealed tile range
	const scale = (MAX_REVEALED_TILES - MIN_REVEALED_TILES) / (REVEAL_DONATION_CAP - MIN_REVEAL_DONATION);
	// find donation position in the new scale
	return Math.ceil(amount * scale + MIN_REVEALED_TILES);
}
