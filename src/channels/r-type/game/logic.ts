import { CONFIG } from '../config';
import { GameState, Player, Shot, Enemy } from './types';

export function createInitialState(): GameState {
	return {
		player: {
			x: CONFIG.PLAYER_START_X,
			y: CONFIG.PLAYER_START_Y,
			vx: 0,
			vy: 0,
			width: CONFIG.PLAYER_WIDTH,
			height: CONFIG.PLAYER_HEIGHT,
			dead: false,
			deathFrame: 0,
		},
		shots: [],
		enemies: [],
		keys: {},
		controlsEnabled: false,
		lastShotTime: 0,
		nextEnemySpawn: CONFIG.ENEMY_SPAWN_INTERVAL,
		pendingEnemyWaves: 0,
		nextShotId: 0,
		nextEnemyId: 0,
		bgOffset: 0,
		playerRespawnTimer: 0,
		playerInvincibilityTimer: 0,
		autoMoveDirection: Math.random() < 0.5 ? -1 : 1,
		autoMoveTimer: 1600,
		autoMoveDuration: 1600,
		autoMoveTargetY: null,
		autoShootInterval: 220,
	};
}

export function updateGameState(state: GameState, deltaTime: number): GameState {
	const newState = { ...state };

	// Update background scroll
	newState.bgOffset += (CONFIG.BG_SCROLL_SPEED * deltaTime) / (1000 / 60);

	// Update player
	if (!newState.player.dead) {
		newState.playerInvincibilityTimer = Math.max(0, newState.playerInvincibilityTimer - deltaTime);
		updatePlayer(newState, deltaTime);
		handlePlayerShooting(newState, deltaTime);
	} else {
		// Handle death animation and respawn
		newState.player.deathFrame++;
		
		// If death animation is complete, start respawn timer
		if (newState.player.deathFrame >= CONFIG.DEATH_ANIMATION_FRAMES) {
			newState.playerRespawnTimer += deltaTime;
			
			// Respawn after 1 second (1000ms)
			if (newState.playerRespawnTimer >= 1000) {
				newState.player.x = CONFIG.PLAYER_START_X;
				newState.player.y = CONFIG.PLAYER_START_Y;
				newState.player.vx = 0;
				newState.player.vy = 0;
				newState.player.dead = false;
				newState.player.deathFrame = 0;
				newState.playerRespawnTimer = 0;
				newState.playerInvincibilityTimer = CONFIG.RESPAWN_INVINCIBILITY_MS;
			}
		}
	}

	// Update shots
	newState.shots = newState.shots.filter((shot) => {
		shot.x += CONFIG.SHOT_SPEED;
		return shot.x < CONFIG.WIDTH;
	});

	// Spawn enemies only when a donation event has queued a wave.
	if (newState.pendingEnemyWaves > 0) {
		spawnEnemy(newState);
		newState.pendingEnemyWaves--;
	}

	// Update enemies
	newState.enemies = newState.enemies.map((enemy) => {
		if (!enemy.dead) {
			enemy.x += enemy.vx;
			// Sinusoidal vertical movement mirroring R-Type-main S_EnemyAI per type:
			// type 2: amplitude 10, factor 20 → scaled to 55/80
			// type 3: amplitude 20, factor 30 → scaled to 90/120
			const amp = enemy.enemyType === 3 ? CONFIG.ENEMY3_SINE_AMPLITUDE : CONFIG.ENEMY2_SINE_AMPLITUDE;
			const period = enemy.enemyType === 3 ? CONFIG.ENEMY3_SINE_PERIOD : CONFIG.ENEMY2_SINE_PERIOD;
			enemy.y = enemy.spawnY + amp * Math.sin(enemy.x / period);
		} else {
			enemy.deathFrame++;
		}
		return enemy;
	});

	// Remove off-screen and fully dead entities
	newState.shots = newState.shots.filter((shot) => shot.x < CONFIG.WIDTH);
	newState.enemies = newState.enemies.filter(
		(enemy) => enemy.x + enemy.width > 0 && enemy.deathFrame < CONFIG.DEATH_ANIMATION_FRAMES,
	);

	// Collision detection
	checkCollisions(newState);

	return newState;
}

function updatePlayer(state: GameState, deltaTime: number): void {
	const player = state.player;

	if (state.controlsEnabled) {
		// Vertical movement
		if (state.keys['w'] || state.keys['W']) {
			player.vy = -CONFIG.PLAYER_SPEED;
		} else if (state.keys['s'] || state.keys['S']) {
			player.vy = CONFIG.PLAYER_SPEED;
		} else {
			player.vy = 0;
		}

		// Horizontal movement (can move left/right freely too)
		if (state.keys['a'] || state.keys['A']) {
			player.vx = -CONFIG.PLAYER_SPEED;
		} else if (state.keys['d'] || state.keys['D']) {
			player.vx = CONFIG.PLAYER_SPEED;
		} else {
			player.vx = 0;
		}
	} else {
		const hasActiveEnemies = hasLivingEnemies(state);
		updateAttractMode(state, deltaTime, hasActiveEnemies);
		player.vx = 0;
		if (!hasActiveEnemies) {
			if (state.autoMoveTargetY !== null) {
				const relaxedSpeed = CONFIG.PLAYER_SPEED * CONFIG.ATTRACT_RELAXED_SPEED_MULTIPLIER;
				const directionToTarget = state.autoMoveTargetY > player.y ? 1 : -1;
				state.autoMoveDirection = directionToTarget;
				player.vy = directionToTarget * relaxedSpeed;
			} else {
				state.autoMoveDirection = 0;
				player.vy = 0;
			}
		} else {
			player.vy = state.autoMoveDirection * CONFIG.PLAYER_SPEED;
		}
	}

	player.x += player.vx;
	player.y += player.vy;

	// Bounds checking
	const playerDrawHeight = player.height * 2;
	player.x = Math.max(0, Math.min(player.x, CONFIG.WIDTH - player.width));
	player.y = Math.max(
		CONFIG.PLAYER_VERTICAL_WALL_PADDING,
		Math.min(player.y, CONFIG.HEIGHT - playerDrawHeight - CONFIG.PLAYER_VERTICAL_WALL_PADDING),
	);

	// Relaxed attract mode: stop exactly at planned target and pause.
	if (!state.controlsEnabled && !hasLivingEnemies(state) && state.autoMoveTargetY !== null) {
		const remaining = state.autoMoveTargetY - player.y;
		if (Math.abs(remaining) <= Math.abs(player.vy)) {
			player.y = state.autoMoveTargetY;
			player.vy = 0;
			state.autoMoveDirection = 0;
			state.autoMoveTargetY = null;
			state.autoMoveDuration = CONFIG.ATTRACT_RELAXED_IDLE_MIN_MS + Math.random() * (CONFIG.ATTRACT_RELAXED_IDLE_MAX_MS - CONFIG.ATTRACT_RELAXED_IDLE_MIN_MS);
			state.autoMoveTimer = state.autoMoveDuration;
		}
	}
}

function handlePlayerShooting(state: GameState, deltaTime: number): void {
	state.lastShotTime += deltaTime;

	const canShootManually = (state.keys[' '] || state.keys['space']) && state.lastShotTime >= CONFIG.SHOT_COOLDOWN;
	const canShootAuto = !state.controlsEnabled && hasLivingEnemies(state) && state.lastShotTime >= state.autoShootInterval;

	if (canShootManually || canShootAuto) {
		const shot: Shot = {
			x: state.player.x + state.player.width,
			y: state.player.y + (state.player.height * 2) / 2 - CONFIG.SHOT_HEIGHT / 2,
			width: CONFIG.SHOT_WIDTH,
			height: CONFIG.SHOT_HEIGHT,
			id: state.nextShotId++,
		};
		state.shots.push(shot);
		state.lastShotTime = 0;
		if (!state.controlsEnabled) {
			state.autoShootInterval = 160 + Math.random() * 260;
		}
	}
}

function updateAttractMode(state: GameState, deltaTime: number, hasActiveEnemies: boolean): void {
	if (!hasActiveEnemies) {
		// In relaxed mode, timer is only for idle; movement ends when target Y is reached.
		if (state.autoMoveTargetY !== null) {
			return;
		}

		state.autoMoveTimer -= deltaTime;
		if (state.autoMoveTimer <= 0) {
			const targetY = chooseRelaxedTargetY(state);
			if (targetY !== null) {
				state.autoMoveTargetY = targetY;
				state.autoMoveDirection = targetY > state.player.y ? 1 : -1;
				state.autoMoveDuration = 0;
				state.autoMoveTimer = 0;
			} else {
				state.autoMoveDirection = 0;
				state.autoMoveDuration = CONFIG.ATTRACT_RELAXED_IDLE_MIN_MS + Math.random() * (CONFIG.ATTRACT_RELAXED_IDLE_MAX_MS - CONFIG.ATTRACT_RELAXED_IDLE_MIN_MS);
				state.autoMoveTimer = state.autoMoveDuration;
			}
		}
		return;
	}

	state.autoMoveTimer -= deltaTime;

	if (state.autoMoveTimer <= 0) {
		if (hasActiveEnemies) {
			const shouldIdle = Math.random() < 0.28;
			if (shouldIdle) {
				state.autoMoveDirection = 0;
				state.autoMoveDuration = CONFIG.ATTRACT_IDLE_MIN_MS + Math.random() * (CONFIG.ATTRACT_IDLE_MAX_MS - CONFIG.ATTRACT_IDLE_MIN_MS);
			} else {
				state.autoMoveDirection = Math.random() < 0.5 ? -1 : 1;
				state.autoMoveDuration = CONFIG.ATTRACT_MOVE_MIN_MS + Math.random() * (CONFIG.ATTRACT_MOVE_MAX_MS - CONFIG.ATTRACT_MOVE_MIN_MS);
			}
		} else {
			state.autoMoveDirection = 0;
			state.autoMoveDuration = CONFIG.ATTRACT_RELAXED_IDLE_MIN_MS + Math.random() * (CONFIG.ATTRACT_RELAXED_IDLE_MAX_MS - CONFIG.ATTRACT_RELAXED_IDLE_MIN_MS);
		}
		state.autoMoveTimer = state.autoMoveDuration;
	}

	const topLimit = CONFIG.PLAYER_VERTICAL_WALL_PADDING;
	const bottomLimit = CONFIG.HEIGHT - state.player.height * 2 - CONFIG.PLAYER_VERTICAL_WALL_PADDING;
	if (state.player.y <= topLimit) {
		if (hasActiveEnemies) {
			state.autoMoveDirection = 1;
			state.autoMoveTimer = Math.min(state.autoMoveTimer, 300);
		} else {
			state.autoMoveDirection = 0;
			state.autoMoveTargetY = null;
			state.autoMoveDuration = CONFIG.ATTRACT_RELAXED_IDLE_MIN_MS + Math.random() * (CONFIG.ATTRACT_RELAXED_IDLE_MAX_MS - CONFIG.ATTRACT_RELAXED_IDLE_MIN_MS);
			state.autoMoveTimer = state.autoMoveDuration;
		}
	}
	if (state.player.y >= bottomLimit) {
		if (hasActiveEnemies) {
			state.autoMoveDirection = -1;
			state.autoMoveTimer = Math.min(state.autoMoveTimer, 300);
		} else {
			state.autoMoveDirection = 0;
			state.autoMoveTargetY = null;
			state.autoMoveDuration = CONFIG.ATTRACT_RELAXED_IDLE_MIN_MS + Math.random() * (CONFIG.ATTRACT_RELAXED_IDLE_MAX_MS - CONFIG.ATTRACT_RELAXED_IDLE_MIN_MS);
			state.autoMoveTimer = state.autoMoveDuration;
		}
	}
}

function chooseRelaxedTargetY(state: GameState): number | null {
	const topLimit = CONFIG.PLAYER_VERTICAL_WALL_PADDING;
	const bottomLimit = CONFIG.HEIGHT - state.player.height * 2 - CONFIG.PLAYER_VERTICAL_WALL_PADDING;
	const currentY = Math.max(topLimit, Math.min(state.player.y, bottomLimit));
	const range = bottomLimit - topLimit;
	if (range <= 0) {
		return null;
	}

	const distTop = currentY - topLimit;
	const distBottom = bottomLimit - currentY;
	const halfRange = Math.max(1, range / 2);
	const topPressure = 1 - Math.min(1, distTop / halfRange);
	const bottomPressure = 1 - Math.min(1, distBottom / halfRange);
	const probMoveDown = Math.min(0.9, Math.max(0.1, 0.5 + (topPressure - bottomPressure) * 0.35));
	const preferredDir: -1 | 1 = Math.random() < probMoveDown ? 1 : -1;

	const minTravel = CONFIG.ATTRACT_RELAXED_TRAVEL_MIN_PX;
	const maxTravel = CONFIG.ATTRACT_RELAXED_TRAVEL_MAX_PX;
	const desiredTravel = minTravel + Math.random() * (maxTravel - minTravel);

	const maxUpTravel = Math.max(0, distTop);
	const maxDownTravel = Math.max(0, distBottom);
	const availableInPreferred = preferredDir === -1 ? maxUpTravel : maxDownTravel;
	const fallbackDir: -1 | 1 = preferredDir === -1 ? 1 : -1;
	const availableInFallback = fallbackDir === -1 ? maxUpTravel : maxDownTravel;

	let dir: -1 | 1 = preferredDir;
	let available = availableInPreferred;
	if (available < 8 && availableInFallback > availableInPreferred) {
		dir = fallbackDir;
		available = availableInFallback;
	}
	if (available < 8) {
		return null;
	}

	const travel = Math.min(available - 2, desiredTravel);
	if (travel <= 0) {
		return null;
	}

	return currentY + dir * travel;
}

function hasLivingEnemies(state: GameState): boolean {
	return state.enemies.some((enemy) => !enemy.dead);
}

function spawnEnemy(state: GameState): void {
	// Randomly pick type 2 or 3 (matching R-Type-main's random enemy type selection)
	const enemyType: 2 | 3 = Math.random() < 0.5 ? 2 : 3;
	const enemyW = enemyType === 3 ? CONFIG.ENEMY3_WIDTH : CONFIG.ENEMY_WIDTH;
	const enemyH = enemyType === 3 ? CONFIG.ENEMY3_HEIGHT : CONFIG.ENEMY_HEIGHT;

	// Restrict spawn y to the middle 50% of the screen so sine excursions stay mostly on-screen
	const yMin = CONFIG.HEIGHT * CONFIG.ENEMY_SPAWN_Y_MIN_FRAC;
	const yMax = CONFIG.HEIGHT * CONFIG.ENEMY_SPAWN_Y_MAX_FRAC - enemyH;
	const y = yMin + Math.random() * (yMax - yMin);

	// Spawn a batch staggered along x; type 3 has its own batch size constant
	const batchSize = enemyType === 3 ? CONFIG.ENEMY3_BATCH_SIZE : CONFIG.ENEMY_BATCH_SIZE;
	for (let i = 0; i < batchSize; i++) {
		const spawnX = CONFIG.WIDTH + i * CONFIG.ENEMY_BATCH_SPACING;
		const enemy: Enemy = {
			x: spawnX,
			y,
			vx: -CONFIG.ENEMY_SPEED * CONFIG.ENEMY_SPEED_MULTIPLIER,
			vy: 0,
			width: enemyW,
			height: enemyH,
			dead: false,
			deathFrame: 0,
			id: state.nextEnemyId++,
			spawnY: y,
			enemyType,
		};
		state.enemies.push(enemy);
	}
}

function checkCollisions(state: GameState): void {
	// Shot-enemy collisions
	for (let i = state.shots.length - 1; i >= 0; i--) {
		const shot = state.shots[i];
		for (let j = state.enemies.length - 1; j >= 0; j--) {
			const enemy = state.enemies[j];
			if (!enemy.dead && rectanglesCollide(shot, enemy)) {
				state.shots.splice(i, 1);
				enemy.dead = true;
				enemy.deathFrame = 0;
				break;
			}
		}
	}

	// Player-enemy collisions
	if (!state.player.dead && state.playerInvincibilityTimer <= 0) {
		for (const enemy of state.enemies) {
			if (!enemy.dead && rectanglesCollide(state.player, enemy)) {
				state.player.dead = true;
				state.player.deathFrame = 0;
				state.playerInvincibilityTimer = 0;
			}
		}
	}
}

function rectanglesCollide(
	a: { x: number; y: number; width: number; height: number },
	b: { x: number; y: number; width: number; height: number },
): boolean {
	return (
		a.x < b.x + b.width &&
		a.x + a.width > b.x &&
		a.y < b.y + b.height &&
		a.y + a.height > b.y
	);
}
