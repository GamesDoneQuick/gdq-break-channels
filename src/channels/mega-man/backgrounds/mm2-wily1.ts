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

const factory: ScrollingBackgroundFactory = () => {
	const WIDTH = 273;
	const bg = new ScrollingBackground(WIDTH, 1);

	const loadFunc = async () => {
		const spritesheet = new PIXI.Spritesheet(PIXI.BaseTexture.from(sheetTexture), sheetAtlas);
		await spritesheet.parse();

		class BackgroundMM2Wily1Color extends ScrollingBackgroundComponent {
			constructor() {
				super(new PIXI.Graphics());
				const background = this.container as PIXI.Graphics;
				background.beginFill(0x183c5c);
				background.drawRect(0, 0, 273, 83);
				background.endFill();
			}
		}

		class BackgroundMM2Wily1Cloud extends ScrollingBackgroundRowComponent {
			private readonly left: PIXI.Sprite;
			private readonly middle: PIXI.TilingSprite;
			private readonly right: PIXI.Sprite;
			private currentWidth: number = 112;

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
				this.currentWidth = this.middle.width + 32;
			}

			width(): number {
				return this.currentWidth;
			}
		}

		class BackgroundMM2Wily1Building extends ScrollingBackgroundRowComponent {
			constructor() {
				super(new PIXI.Sprite(spritesheet.textures.building));
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
			new ScrollingBackgroundRow(bg, -8, 0.25, [0, 80], 16, false, [
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
			]),
			new ScrollingBackgroundRow(bg, 8, 0.25, [32, 128], 16, false, [
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
			]),
			new ScrollingBackgroundRow(bg, 24, 0.25, [128, 192], 16, false, [
				new BackgroundMM2Wily1Cloud(),
				new BackgroundMM2Wily1Cloud(),
			]),
			new ScrollingBackgroundRow(bg, 0, 0.5, [512, 1024, WIDTH], 16, false, [new BackgroundMM2Wily1Building()]),
		);
		bg.addComponent(new BackgroundMM2Wily1Ground());
	};

	return [bg, loadFunc()];
};

export default factory;
