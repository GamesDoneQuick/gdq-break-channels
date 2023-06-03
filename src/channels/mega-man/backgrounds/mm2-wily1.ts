import {
	ScrollingBackground,
	ScrollingBackgroundRowComponent,
	ScrollingBackgroundFactory,
	ScrollingBackgroundComponent,
	ScrollingBackgroundRow,
} from '.';
import * as PIXI from 'pixi.js';
import sheetTexture from '../assets/bg-mm2wily1.png';
import sheetAtlas from '../assets/bg-mm2wily1.json';
import { MEGA_MAN_CONSTS } from '..';

const factory: ScrollingBackgroundFactory = () => {
	const WIDTH = 273;
	const BGCOLOR = 0x183c5c;
	const TINTCOLOR = 0xd0d8de;

	const bg = new ScrollingBackground(WIDTH, MEGA_MAN_CONSTS.MOVE_SPEED_FOREGROUND);

	const loadFunc = async () => {
		const spritesheet = new PIXI.Spritesheet(PIXI.BaseTexture.from(sheetTexture), sheetAtlas);
		await spritesheet.parse();

		class BackgroundMM2Wily1Color extends ScrollingBackgroundComponent {
			constructor() {
				super(new PIXI.Graphics());
				const background = this.container as PIXI.Graphics;
				background.beginFill(BGCOLOR);
				background.drawRect(0, 0, 273, 83);
				background.endFill();
			}
		}

		class BackgroundMM2Wily1Cloud extends ScrollingBackgroundRowComponent {
			private readonly left: PIXI.Sprite;
			private readonly middle: PIXI.TilingSprite;
			private readonly right: PIXI.Sprite;

			constructor() {
				super(new PIXI.Container());
				this.left = new PIXI.Sprite(spritesheet.textures.cloud_left);
				this.middle = new PIXI.TilingSprite(spritesheet.textures.cloud_middle, 0, 16);
				this.middle.x = 16;
				this.right = new PIXI.Sprite(spritesheet.textures.cloud_right);
				this.container.addChild(this.left, this.middle, this.right);
			}

			destroy(): void {
				this.left.destroy(true);
				this.middle.destroy(true);
				this.right.destroy(true);
				this.container.destroy(true);
			}

			enter(): void {
				super.enter();
				this.middle.width = Math.floor(Math.random() * 5) * 16;
				this.right.x = this.middle.width + 16;
			}
		}

		const BARREL_COUNT = 10;
		class BackgroundMM2Wily1Fence extends ScrollingBackgroundRowComponent {
			private fence: PIXI.TilingSprite;
			private barrels: PIXI.TilingSprite[];

			constructor() {
				super(new PIXI.Container());
				this.fence = new PIXI.TilingSprite(spritesheet.textures.fence, 0, 48);
				this.fence.tint = TINTCOLOR;
				this.barrels = new Array(BARREL_COUNT);
				for (let i = 0; i < BARREL_COUNT; i++) {
					this.barrels[i] = new PIXI.TilingSprite(spritesheet.textures.barrel, 16, 16);
					this.barrels[i].tint = TINTCOLOR;
				}
				this.container.addChild(this.fence, ...this.barrels);
			}

			enter(): void {
				super.enter();
				const tileWidth = Math.floor(Math.random() * 64) + 32;
				console.log(tileWidth);
				this.fence.width = tileWidth * 16;

				for (let i = 0; i < BARREL_COUNT; i++) {
					this.barrels[i].x = (Math.floor(Math.random() * (tileWidth - 5)) + 2) * 16;
					this.barrels[i].height = Math.random() < 0.66 ? 16 : 32;
					this.barrels[i].width = this.barrels[i].height === 32 || Math.random() < 0.66 ? 16 : 32;
					this.barrels[i].y = 48 - this.barrels[i].height;
				}
			}
		}

		class BackgroundMM2Wily1BuildingA extends ScrollingBackgroundRowComponent {
			constructor() {
				super(new PIXI.Sprite(spritesheet.textures.buildingA));
				(this.container as PIXI.Sprite).tint = TINTCOLOR;
			}
		}

		class BackgroundMM2Wily1BuildingB extends ScrollingBackgroundRowComponent {
			constructor() {
				super(new PIXI.Sprite(spritesheet.textures.buildingB));
				(this.container as PIXI.Sprite).tint = TINTCOLOR;
				this.container.y = 8;
			}
		}

		class BackgroundMM2Wily1Ground extends ScrollingBackgroundComponent {
			constructor() {
				super(new PIXI.TilingSprite(spritesheet.textures.ground, WIDTH, 19));
				this.container.y = 64;
			}

			tick(moveSpeed: number): void {
				(this.container as PIXI.TilingSprite).tilePosition.x -= moveSpeed;
			}
		}

		bg.addComponent(new BackgroundMM2Wily1Color());
		bg.addRows(
			new ScrollingBackgroundRow(bg, -8, 0.25, [0, 32], 16, false, [
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
			]),
			new ScrollingBackgroundRow(bg, 8, 0.25, [16, 80], 16, false, [
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
			]),
			new ScrollingBackgroundRow(bg, 24, 0.25, [64, 128], 16, false, [
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
			]),
			new ScrollingBackgroundRow(bg, 0, 0.5, [256, 512, WIDTH], 16, true, [
				new BackgroundMM2Wily1BuildingA(),
				new BackgroundMM2Wily1BuildingB(),
			]),
			new ScrollingBackgroundRow(bg, 16, 0.75, [800, 1120, WIDTH * 2], 16, false, [
				new BackgroundMM2Wily1Fence(),
			]),
		);
		bg.addComponent(new BackgroundMM2Wily1Ground());
	};

	return [bg, loadFunc()];
};

export default factory;
