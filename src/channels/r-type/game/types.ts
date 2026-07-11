export interface Player {
	x: number;
	y: number;
	vx: number;
	vy: number;
	width: number;
	height: number;
	dead: boolean;
	deathFrame: number;
}

export interface Shot {
	x: number;
	y: number;
	width: number;
	height: number;
	chargeLevel: 1 | 2 | 3 | 4 | 5;
	id: number;
}

export interface Enemy {
	x: number;
	y: number;
	vx: number;
	vy: number;
	width: number;
	height: number;
	dead: boolean;
	deathFrame: number;
	id: number;
	spawnY: number;
	enemyType: 2 | 3;
}

export interface GameState {
	player: Player;
	shots: Shot[];
	enemies: Enemy[];
	keys: Record<string, boolean>;
	controlsEnabled: boolean;
	lastShotTime: number;
	nextEnemySpawn: number;
	pendingEnemyWaves: number;
	nextShotId: number;
	nextEnemyId: number;
	bgOffset: number;
	playerRespawnTimer: number;
	playerInvincibilityTimer: number;
	autoMoveDirection: -1 | 0 | 1;
	autoMoveTimer: number;
	autoMoveDuration: number;
	autoMoveTimerX: number;
	autoMoveDurationX: number;
	autoMoveTargetY: number | null;
	autoMoveTargetX: number | null;
	autoShootInterval: number;
	chargeTimeMs: number;
	wasFireHeld: boolean;
}
