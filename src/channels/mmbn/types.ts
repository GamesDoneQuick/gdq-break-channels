export type SpriteTilePosition =
	| 'center'
	| 'left'
	| 'right'
	| 'top-middle'
	| 'top-left'
	| 'top-right'
	| 'bottom-middle'
	| 'bottom-left'
	| 'bottom-right';

export type BgScrollDirection =
	| 'up'
	| 'down'
	| 'left'
	| 'right'
	| 'up-left'
	| 'up-right'
	| 'down-left'
	| 'down-right';

export type Speaker =
	| 'lan'
	| 'megaman'
	| 'chaud'
	| 'protoman'
	| 'mayl'
	| 'roll'
	| 'dex'
	| 'gutsman'
	| 'yai'
	| 'glide'
	| 'yuichiro'
	| 'bass';

export interface DialogLine {
	speaker: Speaker;
	text: string;
}

export type DialogSet = DialogLine[];

export interface BackgroundDef {
	name: string;
	src: string;
	direction: BgScrollDirection;
	//tileSize should equal the size of the background, especially if it's a square
	tileSize: number;
}

export interface BossDef {
	name: string;
	health: number;
	idleAnim: string;
	moveAnim: string;
	deathAnim: string;
	anchor: [number, number];
	animationSpeed: number;
}

export interface BattleChipDef {
	name: string;
	damage: number;
	//base animation to use for the chip
	useAnim: string;
	//texture of the chip sprite
	texture: string;
	//basically the range of the chip. Widesword is [[1, 0], [1, 1], [1, -1]]
	//step sword is [[3, 0], [3, 1], [3, -1]]
	hitZone: [number, number][];
	//optional, if there's a projectile. Can be a static texture, like mini_bomb.png
	projectileAnim?: string;
	animationAnchor: [number, number];
	animationSpeed: number;
	animationOffset?: [number, number];
	//this triggers the teleport, a.k.a. step for chips like stepsword
	preUseOffset?: [number, number];
	//for chips like the swords. They play the sword slash animation and a secondary
	//sword trail animation. Saves space with the sprite atlas (and saved me time making the sprites lol)
	secondaryAnim?: string;
	secondaryAnimOffset?: [number, number];
	secondaryAnimAnchor?: [number, number];
	impactJitter?: number;
	secondaryAnimSpeed?: number;
	projectileRange?: number;
	projectileArc?: number;
	projectileDuration?: number;
	impactAnimation?: string;
	//for chips like double bomb, that throw 2 bombs per chip trigger
	repeat?: number;
	//chips like single bomb, double bomb, etc, that land and hit one tile up and down from where thy land as well
	blastRadius?: [number, number][];
	//if a chip is short range, the boss will be more likely to move to the farthest left column
	//useful for the swords, and for guts punches when I eventually add them
	shortRange: boolean;
}
