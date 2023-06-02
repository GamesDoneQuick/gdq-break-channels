import type { AnimatedSprite, Sprite, TilingSprite } from 'pixi.js';

export type MegaManCloudRow = {
	initialDist: boolean;
	minNextX: number;
	clouds: { left: Sprite; middle: TilingSprite; right: Sprite }[];
};

export enum MegaManDonationState {
	WAITING,
	STARTED,
	FIRED,
	HIT,
}

export type MegaManEnemyDescription = {
	animName: string;
	isGrounded: boolean;
	mustJump: boolean;
};

export const MegaManEnemyList: { [enemy: string]: MegaManEnemyDescription } = {
	METTOOL: { animName: 'enemy_mettool', isGrounded: true, mustJump: false },
	SCWORM: { animName: 'enemy_scworm', isGrounded: true, mustJump: false },
	BLOCKY: { animName: 'enemy_blocky', isGrounded: true, mustJump: true },
	BATTON: { animName: 'enemy_batton', isGrounded: false, mustJump: true },
	TELLY: { animName: 'enemy_telly', isGrounded: false, mustJump: true },
};

export type MegaManDonationQueueEntry = {
	state: MegaManDonationState;
	newTotal: number;
	enemy: MegaManEnemyDescription;
	bigPickup: boolean;
	sprEnemy?: AnimatedSprite;
	sprBullet?: Sprite;
	sprDestroy?: AnimatedSprite;
	sprPickup?: AnimatedSprite;
	sprPickupYSpeed?: number;
};
