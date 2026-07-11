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
		lastShotTime: 0,
		nextEnemySpawn: CONFIG.ENEMY_SPAWN_INTERVAL,
		nextShotId: 0,
		nextEnemyId: 0,
		bgOffset: 0,
		playerRespawnTimer: 0,
	};
}

export function updateGameState(state: GameState, deltaTime: number): GameState {
	const newState = { ...state };

	// Update background scroll
	newState.bgOffset += (CONFIG.BG_SCROLL_SPEED * deltaTime) / (1000 / 60);

	// Update player
	if (!newState.player.dead) {
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
			}
		}
	}

	// Update shots
	newState.shots = newState.shots.filter((shot) => {
		shot.x += CONFIG.SHOT_SPEED;
		return shot.x < CONFIG.WIDTH;
	});

	// Spawn enemies (always spawn, regardless of player state)
	newState.nextEnemySpawn -= deltaTime;
	if (newState.nextEnemySpawn <= 0) {
		spawnEnemy(newState);
		newState.nextEnemySpawn = CONFIG.ENEMY_SPAWN_INTERVAL;
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

	player.x += player.vx;
	player.y += player.vy;

	// Bounds checking
	player.x = Math.max(0, Math.min(player.x, CONFIG.WIDTH - player.width));
	player.y = Math.max(0, Math.min(player.y, CONFIG.HEIGHT - player.height));
}

function handlePlayerShooting(state: GameState, deltaTime: number): void {
	state.lastShotTime += deltaTime;

	if ((state.keys[' '] || state.keys['space']) && state.lastShotTime >= CONFIG.SHOT_COOLDOWN) {
		const shot: Shot = {
			x: state.player.x + state.player.width,
			y: state.player.y + (state.player.height * 2) / 2 - CONFIG.SHOT_HEIGHT / 2,
			width: CONFIG.SHOT_WIDTH,
			height: CONFIG.SHOT_HEIGHT,
			id: state.nextShotId++,
		};
		state.shots.push(shot);
		state.lastShotTime = 0;
	}
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
	if (!state.player.dead) {
		for (const enemy of state.enemies) {
			if (!enemy.dead && rectanglesCollide(state.player, enemy)) {
				state.player.dead = true;
				state.player.deathFrame = 0;
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
