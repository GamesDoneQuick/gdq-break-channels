import type { AnimatedSprite, Sprite, Text } from 'pixi.js';

export enum GalagaEnemyState {
	SPAWNING,
	TRAVELLING,
	PARKED,
	DESTROYED,
}

export type GalagaEnemySpawn = {
	enemy: string;
	sprite: Sprite;
	state: GalagaEnemyState;
	column: number;
	targetted: boolean;
	missile: Sprite | null;
	sprDestroy: AnimatedSprite | null;
	donoText: Text | null;
	donoAmt: number;
};
