import type { AnimatedSprite, Sprite } from 'pixi.js';

export enum MegaManDonationState {
	WAITING,
	STARTED,
	FIRED,
	HIT,
}

export type MegaManEnemyDescription = {
	animNames: string[];
	isGrounded: boolean;
	mustJump: boolean;
	yOffset?: number;
	dropYOffset?: number;
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
