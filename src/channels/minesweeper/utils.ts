import { TileData } from './Tile';
import { GRID_COLUMNS, GRID_ROWS, REVEAL_CHANCE_DECAY } from './constants';

function random(min: number, max: number) {
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

export function createTileCluster(grid: TileData[][], startingTileId: string, revealChange: number) {
	const visitedTiles: string[] = [];
	const [rowIndex, tileIndex] = splitTileIndex(startingTileId);

	function visitTile(rowIndex: number, tileIndex: number, chance = revealChange) {
		const tile = grid[rowIndex]?.[tileIndex] as TileData | undefined;
		// stop tile from being revealed (and cascading further)
		// when the following conditions are met
		if (
			// not a valid tile
			!tile ||
			// the tile is a mine
			tile.isMine ||
			// has already been visisted
			visitedTiles.includes(tile.id) ||
			// or does not meet the reveal chance
			// note: we always want the first tile chosen to be revealed
			(visitedTiles.length > 0 && Math.random() > chance)
		) {
			return;
		}
		visitedTiles.push(tile.id);
		const adjacentTiles = getAdjacentTiles(rowIndex, tileIndex);
		adjacentTiles.forEach(([ajacentRowIndex, adjacentTileIndex]) =>
			visitTile(ajacentRowIndex, adjacentTileIndex, chance - REVEAL_CHANCE_DECAY),
		);
	}

	visitTile(rowIndex, tileIndex);

	return visitedTiles;
}
