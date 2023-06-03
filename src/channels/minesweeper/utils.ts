import { TileData } from './Tile';
import { GRID_COLUMNS, GRID_ROWS } from './constants';

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
	const visitedTiles = [startingTileId];
	const [rowIndex, tileIndex] = splitTileIndex(startingTileId);
	const adjacentTiles = getAdjacentTiles(rowIndex, tileIndex).filter(([ri, ti]) => isTileInbounds(ri, ti));

	function visitTile({ id, isMine }: TileData, chance = revealChange) {
		const [ri, ti] = splitTileIndex(id);
		if (
			//
			isMine ||
			visitedTiles.includes(id) ||
			Math.random() > chance
		) {
			return;
		}
		visitedTiles.push(id);
		const adjacentTiles = getAdjacentTiles(ri, ti).filter(([ri, ti]) => isTileInbounds(ri, ti));
		adjacentTiles.forEach((tile) => visitTile(grid[tile[0]][tile[1]], chance - 0.05));
	}

	adjacentTiles.forEach((tile) => visitTile(grid[tile[0]][tile[1]]));

	return visitedTiles;
}
