import * as PIXI from 'pixi.js';
import {
	CHANNEL_WIDTH,
	CHANNEL_HEIGHT,
	MOVE_SPEED,
	ENEMY_MOVE_SPEED,
	MAX_COLLECTIBLES,
	MAX_ENEMIES,
	PUMP_DURATION,
	PUMP_RANGE,
	MAX_INFLATION,
	COLORS,
	DONATION_THRESHOLDS,
} from './constants';

interface Position {
	x: number;
	y: number;
}

interface Collectible {
	pos: Position;
	graphics: PIXI.Graphics;
	type: number;
}

interface Enemy {
	pos: Position;
	graphics: PIXI.Graphics;
	facingRight: boolean;
	moveTimer: number;
	type: 'pooka' | 'fygar';
	animFrame: number;
	inflating: boolean;
	inflationProgress: number;
}

interface PumpAction {
	targetEnemy: Enemy;
	startTime: number;
	active: boolean;
}

export class DigDugGame {
	public app: PIXI.Application;
	private character: {
		pos: Position;
		facingRight: boolean;
		graphics: PIXI.Graphics | null;
		pumping: boolean;
		animFrame: number;
		moveTimer: number;
	};
	private collectibles: Collectible[] = [];
	private enemies: Enemy[] = [];
	private gameLayer: PIXI.Container;
	private backgroundLayer: PIXI.Container;
	private effectsLayer: PIXI.Container;
	private currentPump: PumpAction | null = null;
	private groundY: number;

	constructor(canvas: HTMLCanvasElement) {
		this.app = new PIXI.Application({
			view: canvas,
			width: CHANNEL_WIDTH,
			height: CHANNEL_HEIGHT,
			backgroundColor: 0x5599ff, // Sky blue
			antialias: false,
		});

		// Create layers
		this.backgroundLayer = new PIXI.Container();
		this.gameLayer = new PIXI.Container();
		this.effectsLayer = new PIXI.Container();

		this.app.stage.addChild(this.backgroundLayer);
		this.app.stage.addChild(this.gameLayer);
		this.app.stage.addChild(this.effectsLayer);

		// Ground is at the middle of the channel
		this.groundY = CHANNEL_HEIGHT / 2;

		// Draw simple ground
		this.drawGround();

		// Initialize character standing on ground at center
		this.character = {
			pos: { x: CHANNEL_WIDTH / 2, y: this.groundY - 16 },
			facingRight: true,
			graphics: null,
			pumping: false,
			animFrame: 0,
			moveTimer: 0,
		};
	}

	private drawGround() {
		// Simple ground - brown rectangle for bottom half
		const ground = new PIXI.Graphics();
		ground.beginFill(COLORS.DIRT);
		ground.drawRect(0, this.groundY, CHANNEL_WIDTH, CHANNEL_HEIGHT - this.groundY);
		ground.endFill();

		// Draw ground line
		ground.lineStyle(2, 0x000000);
		ground.moveTo(0, this.groundY);
		ground.lineTo(CHANNEL_WIDTH, this.groundY);

		this.backgroundLayer.addChild(ground);
	}

	public update(deltaTime: number) {
		// Handle pumping action
		if (this.currentPump && this.currentPump.active) {
			this.updatePumpAction(deltaTime);
		} else {
			// Move character to collect vegetables
			if (!this.character.pumping) {
				this.moveCharacter(deltaTime);
			}

			// Character animation
			this.character.moveTimer += deltaTime;
			if (this.character.moveTimer >= 200) {
				this.character.moveTimer = 0;
				this.character.animFrame = (this.character.animFrame + 1) % 2;
			}
		}

		// Update enemies
		for (const enemy of this.enemies) {
			if (!enemy.inflating) {
				enemy.moveTimer += deltaTime;
				if (enemy.moveTimer >= ENEMY_MOVE_SPEED) {
					enemy.moveTimer = 0;
					this.moveEnemy(enemy);
					enemy.animFrame = (enemy.animFrame + 1) % 2;
				}
			}
		}

		this.checkCollectibleCollection();
		this.render();
	}

	private moveCharacter(deltaTime: number) {
		// Find nearest vegetable
		let nearestVeg: Collectible | null = null;
		let minDist = Infinity;

		for (const veg of this.collectibles) {
			const dist = Math.abs(veg.pos.x - this.character.pos.x);
			if (dist < minDist) {
				minDist = dist;
				nearestVeg = veg;
			}
		}

		const centerX = CHANNEL_WIDTH / 2;
		const moveSpeed = 1.5; // pixels per frame

		if (nearestVeg && minDist > 25) {
			// Walk toward vegetable
			if (nearestVeg.pos.x > this.character.pos.x) {
				this.character.pos.x += moveSpeed;
				this.character.facingRight = true;
			} else {
				this.character.pos.x -= moveSpeed;
				this.character.facingRight = false;
			}
		} else if (Math.abs(this.character.pos.x - centerX) > 5) {
			// Return to center when no vegetables
			if (this.character.pos.x > centerX) {
				this.character.pos.x -= moveSpeed;
				this.character.facingRight = false;
			} else {
				this.character.pos.x += moveSpeed;
				this.character.facingRight = true;
			}
		}
	}

	private updatePumpAction(deltaTime: number) {
		if (!this.currentPump || !this.currentPump.active) return;

		const elapsed = Date.now() - this.currentPump.startTime;
		const progress = Math.min(elapsed / PUMP_DURATION, 1);

		this.currentPump.targetEnemy.inflationProgress = progress;

		if (progress >= 1) {
			this.popEnemy(this.currentPump.targetEnemy);
			this.currentPump = null;
			this.character.pumping = false;
		}
	}

	private popEnemy(enemy: Enemy) {
		const index = this.enemies.indexOf(enemy);
		if (index > -1) {
			this.enemies.splice(index, 1);
		}

		// Destroy enemy graphics
		if (enemy.graphics && enemy.graphics.parent) {
			this.gameLayer.removeChild(enemy.graphics);
		}
		enemy.graphics.destroy();

		// Pop effect
		const effect = new PIXI.Graphics();
		effect.beginFill(0xffffff, 0.7);
		effect.drawCircle(enemy.pos.x, enemy.pos.y, 40);
		effect.endFill();

		this.effectsLayer.addChild(effect);

		setTimeout(() => {
			if (effect.parent) {
				this.effectsLayer.removeChild(effect);
				effect.destroy();
			}
		}, 300);
	}

	private moveEnemy(enemy: Enemy) {
		// Enemies walk back and forth on the ground
		const speed = 2;
		if (enemy.facingRight) {
			enemy.pos.x += speed;
			if (enemy.pos.x > CHANNEL_WIDTH - 30) {
				enemy.facingRight = false;
			}
		} else {
			enemy.pos.x -= speed;
			if (enemy.pos.x < 30) {
				enemy.facingRight = true;
			}
		}
	}

	private checkCollectibleCollection() {
		for (let i = this.collectibles.length - 1; i >= 0; i--) {
			const collectible = this.collectibles[i];
			const dist = Math.abs(collectible.pos.x - this.character.pos.x);

			// Collect if character is close
			if (dist < 25) {
				if (collectible.graphics && collectible.graphics.parent) {
					this.gameLayer.removeChild(collectible.graphics);
					collectible.graphics.destroy();
				}
				this.collectibles.splice(i, 1);
			}
		}
	}

	public triggerPumpAction() {
		let nearestEnemy: Enemy | null = null;
		let minDistance = PUMP_RANGE * 50;

		for (const enemy of this.enemies) {
			if (enemy.inflating) continue;

			const distance = Math.abs(enemy.pos.x - this.character.pos.x);
			if (distance < minDistance) {
				minDistance = distance;
				nearestEnemy = enemy;
			}
		}

		if (nearestEnemy) {
			this.character.pumping = true;
			nearestEnemy.inflating = true;
			nearestEnemy.inflationProgress = 0;

			// Face the enemy
			this.character.facingRight = nearestEnemy.pos.x > this.character.pos.x;

			this.currentPump = {
				targetEnemy: nearestEnemy,
				startTime: Date.now(),
				active: true,
			};
		}
	}

	public spawnCollectible(count: number) {
		for (let i = 0; i < count && this.collectibles.length < MAX_COLLECTIBLES; i++) {
			const x = 50 + Math.random() * (CHANNEL_WIDTH - 100);
			const y = this.groundY - 10;

			// Placeholder: colored circle
			const graphics = new PIXI.Graphics();
			const colors = [0xff4444, 0xff8844, 0xffdd44, 0xff88dd, 0x88ff44];
			const color = colors[i % colors.length];

			graphics.beginFill(color);
			graphics.drawCircle(0, 0, 8);
			graphics.endFill();
			graphics.x = x;
			graphics.y = y;

			this.gameLayer.addChild(graphics);
			this.collectibles.push({
				pos: { x, y },
				graphics: graphics,
				type: i % 5
			});
		}
	}

	public spawnEnemy(count: number) {
		for (let i = 0; i < count && this.enemies.length < MAX_ENEMIES; i++) {
			let x;
			do {
				x = 50 + Math.random() * (CHANNEL_WIDTH - 100);
			} while (Math.abs(x - this.character.pos.x) < 150);

			const y = this.groundY - 16;

			const type: 'pooka' | 'fygar' = Math.random() < 0.5 ? 'pooka' : 'fygar';

			// Placeholder: colored box
			const graphics = new PIXI.Graphics();

			const enemy: Enemy = {
				pos: { x, y },
				graphics: graphics,
				facingRight: Math.random() < 0.5,
				moveTimer: 0,
				type,
				animFrame: 0,
				inflating: false,
				inflationProgress: 0,
			};

			this.enemies.push(enemy);
		}
	}

	public spawnForDonation(amount: number) {
		let collectibleCount = 1;
		let enemyCount = 0;
		let shouldPump = false;

		if (amount >= DONATION_THRESHOLDS.MEGA) {
			collectibleCount = 10;
			enemyCount = 3;
			shouldPump = true;
		} else if (amount >= DONATION_THRESHOLDS.HUGE) {
			collectibleCount = 7;
			enemyCount = 2;
			shouldPump = true;
		} else if (amount >= DONATION_THRESHOLDS.LARGE) {
			collectibleCount = 4;
			enemyCount = 1;
			shouldPump = true;
		} else if (amount >= DONATION_THRESHOLDS.MEDIUM) {
			collectibleCount = 2;
			enemyCount = 0;
			shouldPump = true;
		} else {
			shouldPump = Math.random() < 0.3;
		}

		this.spawnCollectible(collectibleCount);
		this.spawnEnemy(enemyCount);

		if (shouldPump && this.enemies.length > 0) {
			this.triggerPumpAction();
		}
	}

	private render() {
		// Render character
		if (this.character.graphics && this.character.graphics.parent) {
			this.gameLayer.removeChild(this.character.graphics);
			this.character.graphics.destroy();
		}

		// Placeholder: Blue box for character
		const charGraphics = new PIXI.Graphics();
		charGraphics.beginFill(0x4444ff);
		charGraphics.drawRect(-12, -24, 24, 32); // Tall box
		charGraphics.endFill();

		// Direction indicator
		charGraphics.beginFill(0xff4444);
		if (this.character.facingRight) {
			charGraphics.drawRect(12, -8, 6, 4);
		} else {
			charGraphics.drawRect(-18, -8, 6, 4);
		}
		charGraphics.endFill();

		// Label
		const style = new PIXI.TextStyle({ fontSize: 8, fill: 0xffffff });
		const text = new PIXI.Text('DIG DUG', style);
		text.x = -15;
		text.y = -16;
		charGraphics.addChild(text);

		charGraphics.x = this.character.pos.x;
		charGraphics.y = this.character.pos.y;

		this.character.graphics = charGraphics;
		this.gameLayer.addChild(charGraphics);

		// Render pump line
		if (this.currentPump && this.currentPump.active) {
			const target = this.currentPump.targetEnemy;

			const pumpLine = new PIXI.Graphics();
			pumpLine.lineStyle(3, COLORS.CHARACTER_ACCENT);
			pumpLine.moveTo(this.character.pos.x, this.character.pos.y);
			pumpLine.lineTo(target.pos.x, target.pos.y);
			this.effectsLayer.addChild(pumpLine);

			setTimeout(() => {
				if (pumpLine.parent) {
					this.effectsLayer.removeChild(pumpLine);
					pumpLine.destroy();
				}
			}, 50);
		}

		// Render enemies
		for (const enemy of this.enemies) {
			if (enemy.graphics && enemy.graphics.parent) {
				this.gameLayer.removeChild(enemy.graphics);
			}
			enemy.graphics.destroy();

			const enemyGraphics = new PIXI.Graphics();

			// Color based on type
			const color = enemy.type === 'pooka' ? 0xff8844 : 0x44ff88;
			enemyGraphics.beginFill(color);

			// Scale based on inflation
			const baseSize = 16;
			const scale = 1 + enemy.inflationProgress * (MAX_INFLATION - 1);
			const size = baseSize * scale;

			enemyGraphics.drawRect(-size / 2, -size / 2, size, size);
			enemyGraphics.endFill();

			// Label
			const style = new PIXI.TextStyle({ fontSize: 6, fill: 0x000000 });
			const text = new PIXI.Text(enemy.type === 'pooka' ? 'POOKA' : 'FYGAR', style);
			text.x = -size / 2 + 2;
			text.y = -size / 2 + 2;
			enemyGraphics.addChild(text);

			enemyGraphics.x = enemy.pos.x;
			enemyGraphics.y = enemy.pos.y;

			enemy.graphics = enemyGraphics;
			this.gameLayer.addChild(enemyGraphics);
		}
	}

	public destroy() {
		if (this.character.graphics) {
			if (this.character.graphics.parent) {
				this.gameLayer.removeChild(this.character.graphics);
			}
			this.character.graphics.destroy();
		}

		for (const collectible of this.collectibles) {
			if (collectible.graphics && collectible.graphics.parent) {
				this.gameLayer.removeChild(collectible.graphics);
				collectible.graphics.destroy();
			}
		}

		for (const enemy of this.enemies) {
			if (enemy.graphics && enemy.graphics.parent) {
				this.gameLayer.removeChild(enemy.graphics);
				enemy.graphics.destroy();
			}
		}

		this.app.destroy(true, { children: true });
	}
}
