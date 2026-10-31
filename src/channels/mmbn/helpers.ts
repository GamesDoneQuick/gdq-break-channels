import { useEffect, useState } from 'react';
import { BattleChipDef, BossDef, BackgroundDef, SpriteTilePosition } from './types';
import MMBN_CONSTS from './config';

//typewrites the text just like the game
export function useTypewriter(text: string, msPerChar: number) {
	const [count, setCount] = useState(0);

	useEffect(() => {
		setCount(0);
		if (!text) return;

		const id = window.setInterval(() => {
			setCount((c) => {
				if (c >= text.length) {
					window.clearInterval(id);
					return c;
				}
				return c + 1;
			});
		}, msPerChar);

		return () => window.clearInterval(id);
	}, [text, msPerChar]);

	return {
		typed: text.slice(0, count),
		done: text.length > 0 && count >= text.length,
	};
}

function findAdjacentTile(
	current: SpriteTilePosition,
	dx: number,
	dy: number,
): SpriteTilePosition | null {
	const [cx, cy] = MMBN_CONSTS.MM_EXE_TILE_POSITION[current];
	const target = (Object.entries(MMBN_CONSTS.MM_EXE_TILE_POSITION) as [SpriteTilePosition, [number, number]][]).find(
		([, [x, y]]) => x === cx + dx && y === cy + dy,
	);
	return target ? target[0] : null;
}

export function bossTileAtOffset(
	current: SpriteTilePosition,
	dx: number,
	dy: number,
): SpriteTilePosition | null {
	const [cx, cy] = MMBN_CONSTS.BOSS_TILE_POSITION[current];
	const target = (Object.entries(MMBN_CONSTS.BOSS_TILE_POSITION) as [SpriteTilePosition, [number, number]][]).find(
		([, [x, y]]) => x === cx + dx * MMBN_CONSTS.MM_EXE_TILE_DX && y === cy + dy * MMBN_CONSTS.MM_EXE_TILE_DY,
	);
	return target ? target[0] : null;
}

export function randomBackground(): BackgroundDef {
	return MMBN_CONSTS.BACKGROUNDS[Math.floor(Math.random() * MMBN_CONSTS.BACKGROUNDS.length)];
}

export function randomBoss(): BossDef {
	return MMBN_CONSTS.BOSSES[Math.floor(Math.random() * MMBN_CONSTS.BOSSES.length)];
}

export function tileRow(tile: SpriteTilePosition): number {
	const [, y] = MMBN_CONSTS.MM_EXE_TILE_POSITION[tile];
	return Math.round((y - MMBN_CONSTS.MM_EXE_TILE_POSITION['top-middle'][1]) / MMBN_CONSTS.MM_EXE_TILE_DY);
}

export function tileCol(tile: SpriteTilePosition): number {
	const [x] = MMBN_CONSTS.MM_EXE_TILE_POSITION[tile];
	return Math.round((x - MMBN_CONSTS.MM_EXE_TILE_POSITION['left'][0]) / MMBN_CONSTS.MM_EXE_TILE_DX);
}

export function bossTileCol(tile: SpriteTilePosition): number {
	const [x] = MMBN_CONSTS.BOSS_TILE_POSITION[tile];
	return Math.round((x - MMBN_CONSTS.BOSS_TILE_POSITION['left'][0]) / MMBN_CONSTS.MM_EXE_TILE_DX);
}

export function adjacentTiles(current: SpriteTilePosition): SpriteTilePosition[] {
	const result: SpriteTilePosition[] = [];
	for (const [dx, dy] of [
		[0, -MMBN_CONSTS.MM_EXE_TILE_DY],
		[0, MMBN_CONSTS.MM_EXE_TILE_DY],
		[-MMBN_CONSTS.MM_EXE_TILE_DX, 0],
		[MMBN_CONSTS.MM_EXE_TILE_DX, 0],
	] as [number, number][]) {
		const next = findAdjacentTile(current, dx, dy);
		if (next) result.push(next);
	}
	return result;
}

export function randomChip(): BattleChipDef {
	return MMBN_CONSTS.BATTLECHIPS[Math.floor(Math.random() * MMBN_CONSTS.BATTLECHIPS.length)];
}

//shuffles the dialog pairs so they don't always play in the same order (except for lan and megaman, who always play on channel mount)
export function shuffle<T>(items: T[]): T[] {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

export function bossInChipZone(
	chip: BattleChipDef,
	mmTile: SpriteTilePosition,
	bossTile: SpriteTilePosition,
): boolean {
	const mmRow = tileRow(mmTile);
	const mmCol = tileCol(mmTile);
	const [bossX, bossY] = MMBN_CONSTS.BOSS_TILE_POSITION[bossTile];
	const bossRow = Math.round((bossY - MMBN_CONSTS.BOSS_TILE_POSITION['top-middle'][1]) / MMBN_CONSTS.MM_EXE_TILE_DY);
	const bossLocalCol = Math.round((bossX - MMBN_CONSTS.BOSS_TILE_POSITION['left'][0]) / MMBN_CONSTS.MM_EXE_TILE_DX);
	const dx = bossLocalCol + 3 - mmCol;
	const dy = bossRow - mmRow;
	return chip.hitZone.some(([zx, zy]) => zx === dx && zy === dy);
}

export function weightedRandomTile(
	tiles: SpriteTilePosition[],
	weight: (tile: SpriteTilePosition) => number,
): SpriteTilePosition | null {
	if (tiles.length === 0) return null;
	const weights = tiles.map(weight);
	const total = weights.reduce((a, b) => a + b, 0);
	if (total <= 0) return tiles[Math.floor(Math.random() * tiles.length)];
	let roll = Math.random() * total;
	for (let i = 0; i < tiles.length; i++) {
		roll -= weights[i];
		if (roll <= 0) return tiles[i];
	}
	return tiles[tiles.length - 1];
}
