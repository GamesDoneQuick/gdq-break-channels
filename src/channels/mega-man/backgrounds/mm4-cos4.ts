import {
	ScrollingBackground,
	ScrollingBackgroundRowComponent,
	ScrollingBackgroundFactory,
	ScrollingBackgroundComponent,
	ScrollingBackgroundRow,
} from '.';
import * as PIXI from 'pixi.js';
import sheetTexture from '../assets/bg-mm4cos4.png';
import sheetAtlas from '../assets/bg-mm4cos4.json';
import MEGA_MAN_CONSTS from '../config';

const factory: ScrollingBackgroundFactory = () => {
	const WIDTH = 273;
	const BGCOLOR = 0x000000;
	const TINTCOLOR = 0x888888;

	const bg = new ScrollingBackground(WIDTH, MEGA_MAN_CONSTS.MOVE_SPEED_FOREGROUND);

	const loadFunc = async () => {
		const spritesheet = new PIXI.Spritesheet(PIXI.BaseTexture.from(sheetTexture), sheetAtlas);
		await spritesheet.parse();

		class BackgroundMM4Cos4Color extends ScrollingBackgroundComponent {
			constructor() {
				super(new PIXI.Graphics());
				const background = this.container as PIXI.Graphics;
				background.beginFill(BGCOLOR);
				background.drawRect(0, 0, 273, 83);
				background.endFill();
			}
		}

		class BackgroundMM4Cos4GroundObject extends ScrollingBackgroundRowComponent {
			constructor() {
				super(new PIXI.Sprite(spritesheet.textures.groundA));
			}

			enter(): void {
				super.enter();
				const sprite = this.container as PIXI.Sprite;
				const randomIdx = Math.floor(Math.random() * 5);

				switch (randomIdx) {
					case 0:
						sprite.texture = spritesheet.textures.groundA;
						break;
					case 1:
						sprite.texture = spritesheet.textures.groundB;
						break;
					case 2:
						sprite.texture = spritesheet.textures.groundC;
						break;
					case 3:
						sprite.texture = spritesheet.textures.groundD;
						break;
					case 4:
						sprite.texture = spritesheet.textures.groundE;
						break;
				}
			}
		}

		class BackgroundMM4Cos4GroundBlock extends ScrollingBackgroundRowComponent {
			private left: PIXI.Sprite;
			private middle: PIXI.TilingSprite;
			private right: PIXI.Sprite;
			private decorations: PIXI.Container;

			constructor() {
				super(new PIXI.Container());
				this.left = new PIXI.Sprite(spritesheet.textures.groundF_left);
				this.middle = new PIXI.TilingSprite(spritesheet.textures.groundF_middle, 0, 32);
				this.middle.x = 16;
				this.right = new PIXI.Sprite(spritesheet.textures.groundF_right);
				this.decorations = new PIXI.Container();
				this.decorations.x = 16;
				this.container.addChild(this.left, this.middle, this.right, this.decorations);
			}

			enter(): void {
				super.enter();
				this.middle.width = Math.floor(Math.random() * 8 + 2) * 16;
				this.right.x = this.middle.width + 16;

				for (let x = 0; x < this.middle.width; x += 16) {
					if (Math.random() < 0.66) {
						continue;
					}

					const decoration = new PIXI.Sprite();
					decoration.x = x;

					if (Math.random() < 0.66) {
						// top
						if (x >= this.middle.width - 16 || Math.random() < 0.5) {
							decoration.texture = spritesheet.textures.groundF_alttopA;
						} else {
							decoration.texture = spritesheet.textures.groundF_alttopB;
							x += 16;
						}
					} else {
						// bottom
						decoration.y = 16;
						decoration.texture =
							Math.random() < 0.5
								? spritesheet.textures.groundF_altbotA
								: spritesheet.textures.groundF_altbotB;
					}

					this.decorations.addChild(decoration);
				}
			}

			leave(): void {
				super.leave();
				this.decorations.removeChildren();
			}
		}

		class BackgroundMM4Cos4Star extends ScrollingBackgroundRowComponent {
			constructor() {
				super(new PIXI.Sprite(spritesheet.textures.starA));
			}

			enter(): void {
				super.enter();
				const sprite = this.container as PIXI.Sprite;
				const randomIdx = Math.floor(Math.random() * 5.25);

				switch (randomIdx) {
					case 0:
						sprite.texture = spritesheet.textures.starA;
						break;
					case 1:
						sprite.texture = spritesheet.textures.starF;
						break;
					case 2:
						sprite.texture = spritesheet.textures.starC;
						break;
					case 3:
						sprite.texture = spritesheet.textures.starD;
						break;
					case 4:
						sprite.texture = spritesheet.textures.starE;
						break;
					default:
						sprite.texture = spritesheet.textures.starB;
						break;
				}
				sprite.y = Math.floor(Math.random() * 4) * 16;
			}
		}

		class BackgroundMM4Cos4Building extends ScrollingBackgroundRowComponent {
			constructor() {
				super(new PIXI.Sprite(spritesheet.textures.building));
				(this.container as PIXI.Sprite).tint = TINTCOLOR;
			}

			enter(): void {
				super.enter();
				this.container.y = Math.random() < 0.5 ? 0 : 16;
			}
		}

		class BackgroundMM4Cos4VPipe extends ScrollingBackgroundRowComponent {
			constructor() {
				super(new PIXI.Sprite(spritesheet.textures.vpipe));
				(this.container as PIXI.Sprite).tint = TINTCOLOR;
			}

			enter(): void {
				super.enter();
				this.container.y = Math.random() < 0.5 ? 0 : 16;
			}
		}

		class BackgroundMM4Cos4InsideBg extends ScrollingBackgroundRowComponent {
			private left: PIXI.TilingSprite;
			private middle: PIXI.TilingSprite;
			private right: PIXI.TilingSprite;

			constructor() {
				super(new PIXI.Container());
				this.left = new PIXI.TilingSprite(spritesheet.textures.insideenter, 16, 64);
				this.middle = new PIXI.TilingSprite(spritesheet.textures.insidebg, 0, 64);
				this.middle.x = 16;
				this.right = new PIXI.TilingSprite(spritesheet.textures.insideexit, 16, 64);
				this.container.addChild(this.left, this.middle, this.right);
			}

			enter(): void {
				super.enter();
				this.middle.width = Math.floor(Math.random() * 64 + 32) * 16;
				this.right.x = this.middle.width + 16;
			}
		}

		class BackgroundMM4Cos4Vent extends ScrollingBackgroundRowComponent {
			constructor() {
				super(new PIXI.Sprite(spritesheet.textures.insidevent));
				this.container.y = 16;
			}
		}

		class BackgroundMM4Cos4HPipe extends ScrollingBackgroundRowComponent {
			private left: PIXI.Sprite;
			private middle: PIXI.TilingSprite;
			private right: PIXI.Sprite;
			private ladder: PIXI.TilingSprite;

			constructor() {
				super(new PIXI.Container());
				this.left = new PIXI.Sprite(spritesheet.textures.hpipe_left);
				this.middle = new PIXI.TilingSprite(spritesheet.textures.hpipe_middle, 0, 16);
				this.middle.x = 16;
				this.right = new PIXI.Sprite(spritesheet.textures.hpipe_rightA);
				this.ladder = new PIXI.TilingSprite(spritesheet.textures.ladder, 16, 0);
				this.container.addChild(this.left, this.middle, this.right, this.ladder);

				this.left.tint = TINTCOLOR;
				this.middle.tint = TINTCOLOR;
				this.right.tint = TINTCOLOR;
				this.ladder.tint = TINTCOLOR;
			}

			enter(): void {
				super.enter();
				this.container.y = Math.random() < 0.5 ? 16 : 32;
				const sizeInTiles = Math.floor(Math.random() * 4 + 2);
				this.middle.width = sizeInTiles * 16;
				this.right.x = this.middle.width + 16;
				this.right.texture =
					Math.random() < 0.66 ? spritesheet.textures.hpipe_rightA : spritesheet.textures.hpipe_rightB;
				this.ladder.x = Math.floor(Math.random() * (sizeInTiles + 2)) * 16;
				this.ladder.height = Math.random() < 0.5 ? 0 : 64;
			}
		}

		const insideBgComponent = new BackgroundMM4Cos4InsideBg();

		class ScrollingBackgroundRowInsideOnly extends ScrollingBackgroundRow {
			canEnter(): boolean {
				const cont = insideBgComponent.getContainer();
				return insideBgComponent.isOnScreen() && cont.x < WIDTH - 64 && cont.x + cont.width > WIDTH + 64 + 128;
			}
		}

		bg.addComponent(new BackgroundMM4Cos4Color());
		bg.addRows(
			new ScrollingBackgroundRow(
				bg,
				0,
				0.1,
				[-24, 0],
				16,
				false,
				new Array(64).fill(0).map((_) => new BackgroundMM4Cos4Star()),
			),
			new ScrollingBackgroundRow(bg, 16, 0.6, [112, 400, WIDTH], 16, false, [
				new BackgroundMM4Cos4Building(),
				new BackgroundMM4Cos4Building(),
				new BackgroundMM4Cos4VPipe(),
				new BackgroundMM4Cos4VPipe(),
			]),
			new ScrollingBackgroundRow(bg, 0, 0.75, [1120, 1600, WIDTH * 4], 16, false, [insideBgComponent]),
			new ScrollingBackgroundRowInsideOnly(bg, 0, 0.75, [48, 128], 16, false, [
				new BackgroundMM4Cos4Vent(),
				new BackgroundMM4Cos4Vent(),
				new BackgroundMM4Cos4HPipe(),
				new BackgroundMM4Cos4HPipe(),
			]),
			new ScrollingBackgroundRow(
				bg,
				64,
				1,
				[0, 0],
				16,
				true,
				new Array(10)
					.fill(0)
					.map((_, i) => (i < 3 ? new BackgroundMM4Cos4GroundBlock() : new BackgroundMM4Cos4GroundObject())),
			),
		);
	};

	return [bg, loadFunc()];
};

export default factory;
