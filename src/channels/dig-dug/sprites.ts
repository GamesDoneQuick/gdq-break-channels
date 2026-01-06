import * as PIXI from 'pixi.js';
import spriteSheetUrl from './images/dd_arcade.png';

// Arcade sprite sheet - 16x16 sprites on dark red background
// Sprites appear to be in rows, starting from top-left
export const SPRITE_COORDS = {
	// Character walking right (top row, left side)
	CHARACTER_RIGHT_1: { x: 0, y: 0, width: 16, height: 16 },
	CHARACTER_RIGHT_2: { x: 16, y: 0, width: 16, height: 16 },

	// Character walking left (flipped from right)
	CHARACTER_LEFT_1: { x: 0, y: 0, width: 16, height: 16 },
	CHARACTER_LEFT_2: { x: 16, y: 0, width: 16, height: 16 },

	// Character pumping (top rows, other poses)
	CHARACTER_PUMP_RIGHT: { x: 32, y: 0, width: 16, height: 16 },
	CHARACTER_PUMP_LEFT: { x: 32, y: 0, width: 16, height: 16 },

	// Pooka enemy (orange/red - around row 3-4)
	POOKA_1: { x: 0, y: 48, width: 16, height: 16 },
	POOKA_2: { x: 16, y: 48, width: 16, height: 16 },

	// Pooka inflating
	POOKA_INFLATE_1: { x: 32, y: 48, width: 16, height: 16 },
	POOKA_INFLATE_2: { x: 48, y: 48, width: 16, height: 16 },
	POOKA_INFLATE_3: { x: 64, y: 48, width: 16, height: 16 },

	// Fygar enemy (green dragon - around row 5-6)
	FYGAR_1: { x: 0, y: 80, width: 16, height: 16 },
	FYGAR_2: { x: 16, y: 80, width: 16, height: 16 },

	// Fygar inflating
	FYGAR_INFLATE_1: { x: 32, y: 80, width: 16, height: 16 },
	FYGAR_INFLATE_2: { x: 48, y: 80, width: 16, height: 16 },
	FYGAR_INFLATE_3: { x: 64, y: 80, width: 16, height: 16 },

	// Vegetables (bottom section)
	CARROT: { x: 64, y: 192, width: 16, height: 16 },
	TURNIP: { x: 80, y: 192, width: 16, height: 16 },
	MUSHROOM: { x: 96, y: 192, width: 16, height: 16 },
	CUCUMBER: { x: 64, y: 208, width: 16, height: 16 },
	EGGPLANT: { x: 80, y: 208, width: 16, height: 16 },
};

export type SpriteKey = keyof typeof SPRITE_COORDS;

export class SpriteManager {
	private baseTexture: PIXI.BaseTexture | null = null;
	private textures: Map<SpriteKey, PIXI.Texture> = new Map();
	private loaded = false;

	async load(): Promise<void> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				this.baseTexture = new PIXI.BaseTexture(img);
				this.extractTextures();
				this.loaded = true;
				resolve();
			};
			img.onerror = () => {
				reject(new Error('Failed to load sprite sheet'));
			};
			img.src = spriteSheetUrl;
		});
	}

	private extractTextures() {
		if (!this.baseTexture) return;

		for (const [key, coords] of Object.entries(SPRITE_COORDS)) {
			const rectangle = new PIXI.Rectangle(coords.x, coords.y, coords.width, coords.height);
			const texture = new PIXI.Texture(this.baseTexture, rectangle);
			this.textures.set(key as SpriteKey, texture);
		}
	}

	getTexture(key: SpriteKey): PIXI.Texture | undefined {
		return this.textures.get(key);
	}

	isLoaded(): boolean {
		return this.loaded;
	}

	createSprite(key: SpriteKey): PIXI.Sprite | null {
		const texture = this.getTexture(key);
		if (!texture) return null;
		return new PIXI.Sprite(texture);
	}

	// Get animation frames for character walking (left/right only for side view)
	getCharacterWalkFrames(direction: 'left' | 'right'): PIXI.Texture[] {
		const frames: PIXI.Texture[] = [];
		const key1 = `CHARACTER_${direction.toUpperCase()}_1` as SpriteKey;
		const key2 = `CHARACTER_${direction.toUpperCase()}_2` as SpriteKey;

		const tex1 = this.getTexture(key1);
		const tex2 = this.getTexture(key2);

		if (tex1) frames.push(tex1);
		if (tex2) frames.push(tex2);

		return frames;
	}

	// Get appropriate enemy sprite based on type and animation frame
	getEnemyTexture(type: 'pooka' | 'fygar', frame: number): PIXI.Texture | undefined {
		const prefix = type === 'pooka' ? 'POOKA' : 'FYGAR';
		const key = `${prefix}_${(frame % 2) + 1}` as SpriteKey;
		return this.getTexture(key);
	}

	// Get enemy inflation sprite based on progress (0-1)
	getEnemyInflateTexture(type: 'pooka' | 'fygar', progress: number): PIXI.Texture | undefined {
		const prefix = type === 'pooka' ? 'POOKA' : 'FYGAR';
		let stage = 1;

		if (progress > 0.66) {
			stage = 3;
		} else if (progress > 0.33) {
			stage = 2;
		}

		// If just starting inflation, show normal sprite
		if (progress < 0.1) {
			return this.getEnemyTexture(type, 1);
		}

		const key = `${prefix}_INFLATE_${stage}` as SpriteKey;
		return this.getTexture(key);
	}

	// Get random collectible texture
	getCollectibleTexture(index: number): PIXI.Texture | undefined {
		const collectibles: SpriteKey[] = ['CARROT', 'TURNIP', 'MUSHROOM', 'CUCUMBER', 'EGGPLANT'];
		const key = collectibles[index % collectibles.length];
		return this.getTexture(key);
	}
}
