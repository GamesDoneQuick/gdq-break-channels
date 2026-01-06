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

// Import sprite images
import characterRightImg from './images/character-right.png';
import pookaImg from './images/pooka.png';
import fygarImg from './images/fygar.png';
import carrotImg from './images/carrot.png';
import turnipImg from './images/turnip.png';
import mushroomImg from './images/mushroom.png';
import cucumberImg from './images/cucumber.png';
import eggplantImg from './images/eggplant.png';
import pepperImg from './images/pepper.png';
import pumpkinImg from './images/pumpkin.png';
import tomatoImg from './images/tomato.png';
import watermelonImg from './images/watermelon.png';
import pineappleImg from './images/pineapple.png';

interface Position {
	x: number;
	y: number;
}

interface Collectible {
	pos: Position;
	sprite: PIXI.Sprite;
	type: number;
}

interface Enemy {
	pos: Position;
	sprite: PIXI.Sprite;
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
		sprite: PIXI.Sprite | null;
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

	// Textures
	private characterTexture: PIXI.Texture;
	private pookaTexture: PIXI.Texture;
	private fygarTexture: PIXI.Texture;
	private vegetableTextures: PIXI.Texture[];

	constructor(canvas: HTMLCanvasElement) {
		this.app = new PIXI.Application({
			view: canvas,
			width: CHANNEL_WIDTH,
			height: CHANNEL_HEIGHT,
			backgroundColor: 0x5599ff, // Sky blue
			antialias: false,
		});

		// Load textures
		this.characterTexture = PIXI.Texture.from(characterRightImg);
		this.pookaTexture = PIXI.Texture.from(pookaImg);
		this.fygarTexture = PIXI.Texture.from(fygarImg);

		// Load all vegetable textures
		this.vegetableTextures = [
			PIXI.Texture.from(carrotImg),
			PIXI.Texture.from(turnipImg),
			PIXI.Texture.from(mushroomImg),
			PIXI.Texture.from(cucumberImg),
			PIXI.Texture.from(eggplantImg),
			PIXI.Texture.from(pepperImg),
			PIXI.Texture.from(pumpkinImg),
			PIXI.Texture.from(tomatoImg),
			PIXI.Texture.from(watermelonImg),
			PIXI.Texture.from(pineappleImg),
		];

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
			pos: { x: CHANNEL_WIDTH / 2, y: this.groundY - 32 },
			facingRight: true,
			sprite: null,
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

		// Destroy enemy sprite
		if (enemy.sprite && enemy.sprite.parent) {
			this.gameLayer.removeChild(enemy.sprite);
		}
		enemy.sprite.destroy();

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
				if (collectible.sprite && collectible.sprite.parent) {
					this.gameLayer.removeChild(collectible.sprite);
					collectible.sprite.destroy();
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
			const y = this.groundY - 24;

			// Randomly select a vegetable texture
			const textureIndex = Math.floor(Math.random() * this.vegetableTextures.length);
			const texture = this.vegetableTextures[textureIndex];

			const sprite = new PIXI.Sprite(texture);
			sprite.anchor.set(0.5, 0.5);
			sprite.scale.set(2, 2); // Double the sprite size
			sprite.x = x;
			sprite.y = y;

			this.gameLayer.addChild(sprite);
			this.collectibles.push({
				pos: { x, y },
				sprite: sprite,
				type: textureIndex
			});
		}
	}

	public spawnEnemy(count: number) {
		for (let i = 0; i < count && this.enemies.length < MAX_ENEMIES; i++) {
			let x;
			do {
				x = 50 + Math.random() * (CHANNEL_WIDTH - 100);
			} while (Math.abs(x - this.character.pos.x) < 150);

			const y = this.groundY - 32;

			const type: 'pooka' | 'fygar' = Math.random() < 0.5 ? 'pooka' : 'fygar';

			// Create sprite based on enemy type
			const texture = type === 'pooka' ? this.pookaTexture : this.fygarTexture;
			const sprite = new PIXI.Sprite(texture);
			sprite.anchor.set(0.5, 0.5);
			sprite.scale.set(2, 2); // Double the sprite size
			sprite.x = x;
			sprite.y = y;

			this.gameLayer.addChild(sprite);

			const enemy: Enemy = {
				pos: { x, y },
				sprite: sprite,
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

	public showDonationAmount(amount: number) {
		// Create flying text for donation amount
		const text = new PIXI.Text(`$${amount.toFixed(2)}`, {
			fontFamily: 'gdqpixel',
			fontSize: 32,
			fill: 0xffee44,
			stroke: 0x000000,
			strokeThickness: 4,
		});

		// Position at center of screen
		text.anchor.set(0.5, 0.5);
		text.x = CHANNEL_WIDTH / 2;
		text.y = CHANNEL_HEIGHT / 2;

		this.effectsLayer.addChild(text);

		const startY = text.y;
		const startTime = Date.now();
		const duration = 2000; // 2 seconds

		// Animate the text flying up and fading out
		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = elapsed / duration;

			if (progress >= 1) {
				// Animation complete, remove text
				if (text.parent) {
					this.effectsLayer.removeChild(text);
				}
				text.destroy();
				return;
			}

			// Move up and fade out
			text.y = startY - progress * 100;
			text.alpha = 1 - progress;

			requestAnimationFrame(animate);
		};

		animate();
	}

	public spawnForDonation(amount: number) {
		let collectibleCount = 1;
		let enemyCount = 0;
		let shouldPump = false;

		// Most donations just spawn 1 vegetable
		// Enemies only appear for larger donations ($100+)
		if (amount >= DONATION_THRESHOLDS.MEGA) {
			// $500+ : 3 vegetables, 2 enemies, pump one
			collectibleCount = 3;
			enemyCount = 2;
			shouldPump = true;
		} else if (amount >= DONATION_THRESHOLDS.HUGE) {
			// $100+ : 2 vegetables, 1 enemy, pump it
			collectibleCount = 2;
			enemyCount = 1;
			shouldPump = true;
		} else {
			// Under $100 : just 1 vegetable, no enemies
			collectibleCount = 1;
			enemyCount = 0;
			shouldPump = false;
		}

		this.spawnCollectible(collectibleCount);
		this.spawnEnemy(enemyCount);

		if (shouldPump && this.enemies.length > 0) {
			this.triggerPumpAction();
		}
	}

	private render() {
		// Render character
		if (this.character.sprite && this.character.sprite.parent) {
			this.gameLayer.removeChild(this.character.sprite);
			this.character.sprite.destroy();
		}

		// Create character sprite
		const charSprite = new PIXI.Sprite(this.characterTexture);
		charSprite.anchor.set(0.5, 0.5);
		charSprite.x = this.character.pos.x;
		charSprite.y = this.character.pos.y;

		// Double sprite size and flip horizontally when facing left
		charSprite.scale.x = this.character.facingRight ? 2 : -2;
		charSprite.scale.y = 2;

		this.character.sprite = charSprite;
		this.gameLayer.addChild(charSprite);

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

		// Update enemy sprites (position and scale)
		for (const enemy of this.enemies) {
			// Update position
			enemy.sprite.x = enemy.pos.x;
			enemy.sprite.y = enemy.pos.y;

			// Double base size, then scale based on inflation
			const baseScale = 2;
			const inflationScale = 1 + enemy.inflationProgress * (MAX_INFLATION - 1);
			const totalScale = baseScale * inflationScale;

			enemy.sprite.scale.set(totalScale, totalScale);

			// Flip based on direction
			enemy.sprite.scale.x = Math.abs(enemy.sprite.scale.x) * (enemy.facingRight ? 1 : -1);
		}
	}

	public destroy() {
		if (this.character.sprite) {
			if (this.character.sprite.parent) {
				this.gameLayer.removeChild(this.character.sprite);
			}
			this.character.sprite.destroy();
		}

		for (const collectible of this.collectibles) {
			if (collectible.sprite && collectible.sprite.parent) {
				this.gameLayer.removeChild(collectible.sprite);
				collectible.sprite.destroy();
			}
		}

		for (const enemy of this.enemies) {
			if (enemy.sprite && enemy.sprite.parent) {
				this.gameLayer.removeChild(enemy.sprite);
				enemy.sprite.destroy();
			}
		}

		this.app.destroy(true, { children: true });
	}
}
