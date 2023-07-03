import {
	ScrollingBackground,
	ScrollingBackgroundRowComponent,
	ScrollingBackgroundFactory,
	ScrollingBackgroundComponent,
	ScrollingBackgroundRow,
} from '.';
import * as PIXI from 'pixi.js';
import sheetTexture from '../assets/bg-mm3gemini.png';
import sheetAtlas from '../assets/bg-mm3gemini.json';
import MEGA_MAN_CONSTS from '../config';

const factory: ScrollingBackgroundFactory = () => {
	const WIDTH = 273;
	const BGCOLOR = 0x000000;
	const NETBGCOLOR = 0x141210;
	const TINTCOLOR = 0x888888;

	const bg = new ScrollingBackground(WIDTH, MEGA_MAN_CONSTS.MOVE_SPEED_FOREGROUND);

	const loadFunc = async () => {
		const spritesheet = new PIXI.Spritesheet(PIXI.BaseTexture.from(sheetTexture), sheetAtlas);
		await spritesheet.parse();

		class BackgroundMM3GeminiColor extends ScrollingBackgroundComponent {
			constructor() {
				super(new PIXI.Graphics());
				const background = this.container as PIXI.Graphics;
				background.beginFill(BGCOLOR);
				background.drawRect(0, 0, 273, 83);
				background.endFill();
			}
		}

		class BackgroundMM3GeminiGround extends ScrollingBackgroundComponent {
			constructor() {
				super(new PIXI.TilingSprite(spritesheet.textures.ground, WIDTH, 19));
				this.container.y = 65;
			}

			tick(moveSpeed: number): void {
				(this.container as PIXI.TilingSprite).tilePosition.x -= moveSpeed;
			}
		}

		class BackgroundMM3GeminiStar extends ScrollingBackgroundRowComponent {
			constructor() {
				super(new PIXI.AnimatedSprite(spritesheet.animations.starA));
				(this.container as PIXI.AnimatedSprite).animationSpeed = 1 / 8;
			}

			enter(): void {
				super.enter();
				const sprite = this.container as PIXI.AnimatedSprite;
				sprite.textures =
					Math.random() < 0.33
						? spritesheet.animations.starA
						: Math.random() < 0.5
						? spritesheet.animations.starB
						: [spritesheet.textures.starC];
				sprite.play();
				sprite.y = Math.floor(Math.random() * 4) * 16;
			}
		}

		class BackgroundMM3GeminiBackCrystal extends ScrollingBackgroundRowComponent {
			private crystals: PIXI.TilingSprite[];

			constructor() {
				super(new PIXI.Container());
				this.crystals = [
					new PIXI.TilingSprite(spritesheet.textures.ground, 32, 32),
					new PIXI.TilingSprite(spritesheet.textures.ground, 32, 32),
					new PIXI.TilingSprite(spritesheet.textures.ground, 32, 32),
				];

				for (const crystal of this.crystals) {
					crystal.width = 32;
					crystal.tint = TINTCOLOR;
				}
				this.container.addChild(...this.crystals);
			}

			enter(): void {
				super.enter();

				let x = 0;
				for (const crystal of this.crystals) {
					crystal.x = x;
					x += Math.random() < 0.5 ? 16 : 32;
					crystal.y = Math.random() < 0.5 ? 0 : 16;
					crystal.height = 31 - crystal.y;
				}
			}
		}

		class BackgroundMM3GeminiFrontCrystal extends ScrollingBackgroundRowComponent {
			constructor() {
				super(new PIXI.Sprite(spritesheet.textures.crystal));
			}
		}

		class BackgroundMM3GeminiGate extends ScrollingBackgroundRowComponent {
			constructor() {
				super(new PIXI.Sprite(spritesheet.textures.gate));
				(this.container as PIXI.Sprite).tint = TINTCOLOR;
			}
		}

		class BackgroundMM3GeminiNet extends ScrollingBackgroundRowComponent {
			private net: PIXI.TilingSprite;
			private frameCounter: number = 0;
			private frameIdx: number = 0;
			private canMove: boolean = false;
			private bg: PIXI.Graphics;
			private mask: PIXI.Graphics;

			constructor() {
				super(new PIXI.Container());

				this.bg = new PIXI.Graphics();
				this.net = new PIXI.TilingSprite(spritesheet.textures.net1, 0, 64);
				this.mask = new PIXI.Graphics();
				this.net.mask = this.mask;

				this.container.addChild(this.bg, this.mask, this.net);
			}

			enter(): void {
				super.enter();
				this.canMove = false;
			}

			tick(moveSpeed: number): void {
				if (!this.canMove) {
					return;
				}

				super.tick(moveSpeed);
				this.frameCounter++;
				if (this.frameCounter >= 10) {
					this.frameIdx++;
					if (this.frameIdx === 1) {
						this.net.texture = spritesheet.textures.net2;
					} else if (this.frameIdx === 2) {
						this.net.texture = spritesheet.textures.net3;
					} else {
						this.net.texture = spritesheet.textures.net1;
						this.frameIdx = 0;
					}
					this.frameCounter = 0;
				}
			}

			blocksEnter(blocksX: number, blocksWidth: number): void {
				this.canMove = true;
				this.container.x = blocksX;
				this.net.width = Math.ceil((blocksWidth * 0.875 - 64) / 16) * 16;
				this.bg.clear();
				this.mask.clear();

				this.bg.beginFill(NETBGCOLOR);
				this.bg.drawRect(0, 0, this.net.width, 64);
				this.bg.drawRect(-5, 0, 3, 64);
				this.bg.drawRect(-9, 0, 2, 64);
				this.bg.drawRect(-12, 0, 1, 64);
				this.bg.drawRect(this.net.width + 2, 0, 3, 64);
				this.bg.drawRect(this.net.width + 7, 0, 2, 64);
				this.bg.drawRect(this.net.width + 11, 0, 1, 64);
				this.bg.endFill();

				this.mask.beginFill(0xffffff);
				let nextX = 0;
				while (nextX < this.net.width - 48) {
					this.createStrand(nextX);
					nextX += Math.floor(Math.random() * 3 + 3) * 16;
				}
				this.mask.endFill();
			}

			createStrand(x: number) {
				const fromTop = Math.random() < 0.5;
				let left = x;
				let right = x + Math.floor(Math.random() * 2 + 2) * 16;

				for (let y = 0; y < 4; y++) {
					this.mask.drawRect(left, fromTop ? y * 16 : (3 - y) * 16, right - left, 16);

					const prevRight = right;
					right += Math.floor(Math.random() * 3) * 16;
					left = Math.min(
						prevRight - 16,
						right - 16,
						Math.max(right - 48, left + Math.floor(Math.random() * 3) * 16),
					);
				}
			}
		}

		class BackgroundMM3GeminiBlocks extends ScrollingBackgroundRowComponent {
			private netComponent: BackgroundMM3GeminiNet;
			private blocks: PIXI.TilingSprite;
			private blinkCounter: number = 0;

			constructor(netComponent: BackgroundMM3GeminiNet) {
				super(new PIXI.Container());
				this.netComponent = netComponent;
				this.blocks = new PIXI.TilingSprite(spritesheet.textures.blocks, 0, 32);
				this.container.addChild(this.blocks);
			}

			enter(): void {
				super.enter();
				const blocksWidth = (Math.floor(Math.random() * 32) + 16) * 32;
				this.blocks.width = blocksWidth;
				this.netComponent.blocksEnter(this.container.x, blocksWidth);
			}

			tick(moveSpeed: number): void {
				super.tick(moveSpeed);
				this.blinkCounter++;
				if (this.blinkCounter >= 30) {
					this.blocks.tilePosition.x -= 32;
					if (this.blocks.tilePosition.x < 0) {
						this.blocks.tilePosition.x = 64;
					}
					this.blinkCounter = 0;
				}
			}
		}

		class ScrollingBackgroundRowWithBlockers extends ScrollingBackgroundRow {
			private blockers: ScrollingBackgroundRowComponent[];

			constructor(
				blockers: ScrollingBackgroundRowComponent[],
				parent: ScrollingBackground,
				y: number,
				moveSpeedFactor: number,
				gap: [number, number] | [number, number, number],
				tileSize: number,
				randomOrder: boolean,
				initialComponents: ScrollingBackgroundRowComponent[] = [],
			) {
				super(parent, y, moveSpeedFactor, gap, tileSize, randomOrder, initialComponents);
				this.blockers = blockers;
			}

			canEnter(): boolean {
				return this.blockers && this.blockers.every((c) => !c.isOnScreen());
			}
		}

		const gateComponent = new BackgroundMM3GeminiGate();
		const crystalComponentA = new BackgroundMM3GeminiBackCrystal();
		const crystalComponentB = new BackgroundMM3GeminiBackCrystal();
		const netComponent = new BackgroundMM3GeminiNet();
		const blocksComponent = new BackgroundMM3GeminiBlocks(netComponent);

		bg.addComponent(new BackgroundMM3GeminiColor());
		bg.addRows(
			new ScrollingBackgroundRow(
				bg,
				0,
				0.1,
				[-16, 0],
				16,
				false,
				new Array(48).fill(0).map((_) => new BackgroundMM3GeminiStar()),
			),
			new ScrollingBackgroundRowWithBlockers([blocksComponent], bg, 33, 0.6, [160, 400, WIDTH], 16, true, [
				gateComponent,
				crystalComponentA,
				crystalComponentB,
			]),
			new ScrollingBackgroundRow(bg, 0, 0.875, [0, 0, WIDTH], 16, false, [netComponent]),
		);
		bg.addComponent(new BackgroundMM3GeminiGround());
		bg.addRows(
			new ScrollingBackgroundRowWithBlockers([blocksComponent], bg, 72, 1, [128, 196, WIDTH], 16, false, [
				new BackgroundMM3GeminiFrontCrystal(),
				new BackgroundMM3GeminiFrontCrystal(),
				new BackgroundMM3GeminiFrontCrystal(),
			]),
			new ScrollingBackgroundRowWithBlockers(
				[gateComponent, crystalComponentA, crystalComponentB],
				bg,
				65,
				1,
				[1120, 1600, WIDTH * 4],
				16,
				false,
				[blocksComponent],
			),
		);
	};

	return [bg, loadFunc()];
};

export default factory;
