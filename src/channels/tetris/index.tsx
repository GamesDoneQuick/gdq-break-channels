import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { TextMetrics } from 'pixi.js';
import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import { useIncrementNumber } from '@gdq/lib/hooks/useIncrementNumber';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import { useGameManager } from './hook';

import { BevelFilter } from '@pixi/filter-bevel';
import { OutlineFilter } from '@pixi/filter-outline';
import { DropShadowFilter } from '@pixi/filter-drop-shadow';

import background from './assets/background_1.png';
import tetrominos from './assets/tetrominos.png';
import frame from './assets/frame.png';
import donationText from './assets/text.png';
import { keyframes } from '@emotion/react';

registerChannel('Tetris', 5, Tetris, {
	handle: 'VodBox',
	position: 'bottomRight',
	site: 'SupportClass',
});

export function Tetris(_: ChannelProps) {
	const manager = useGameManager();

	const [total] = useReplicant<Total | null>('total', null);
	const number = useIncrementNumber(total?.raw ?? 0, 5);

	const bevelFilter = useRef<BevelFilter | null>(null);

	const textGroup = useRef<PIXI.Container | null>(null);
	const prefix = useRef<PIXI.Text | null>(null);
	const text = useRef<PIXI.Text[]>([]);

	const spritesheet = useRef<PIXI.Spritesheet | null>(null);

	const spriteContainer = useRef<PIXI.Container | null>(null);
	const tetrominoSprites = useRef<PIXI.Sprite[]>([]);
	const ghostSprites = useRef<PIXI.Sprite[]>([]);
	const upNextSprites = useRef<PIXI.Sprite[]>([]);

	useListenFor('donation', (donation: FormattedDonation) => {
		/**
		 * Respond to a donation.
		 */
		manager?.addPiece();
	});

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 320, transparent: true }, () => {
		if (
			!app.current ||
			!textGroup.current ||
			!prefix.current ||
			!text.current ||
			!bevelFilter.current ||
			!spriteContainer.current ||
			!spritesheet.current ||
			!spritesheet.current.baseTexture.valid
		)
			return;

		const dollarText = number.toLocaleString('en-US', { maximumFractionDigits: 0 });

		let x = 0;

		for (let i = 0, l = dollarText.length; i < l; ++i) {
			if (!text.current[i]) {
				text.current[i] = createText(dollarText[i], bevelFilter.current);
				textGroup.current.addChild(text.current[i]);
			} else if (text.current[i].text !== dollarText[i]) {
				text.current[i].text = dollarText[i];
				text.current[i].style.fill = GradientColors[dollarText[i]] ?? GradientColors['none'];
			}

			text.current[i].position.x = x;
			const textWidth = TextMetrics.measureText(
				text.current[i].text,
				text.current[i].style as PIXI.TextStyle,
			).width;

			x += textWidth;
		}

		textGroup.current.position.x = 725 - x / 2;

		let idx = 0;
		for (let y = 0, ly = manager.grid.rows; y < ly; ++y) {
			for (let x = 0, lx = manager.grid.columns; x < lx; ++x) {
				if (manager.grid.cells[y][x] === 0) continue;

				if (!tetrominoSprites.current[idx]) {
					tetrominoSprites.current[idx] = new PIXI.Sprite();
				}

				const sprite = tetrominoSprites.current[idx];
				if (sprite.parent !== spriteContainer.current) spriteContainer.current.addChild(sprite);

				if ((sprite.texture as any)?.mino !== manager.grid.cells[y][x]) {
					sprite.texture?.destroy();

					const texture = new PIXI.Texture(
						spritesheet.current.baseTexture,
						spritesheet.current.textures['mino-' + manager.grid.cells[y][x]].frame,
					);

					(texture as any).mino = manager.grid.cells[y][x];
					sprite.texture = texture;
				}

				sprite.position.set(x * 16, y * 16);

				idx += 1;
			}
		}

		const workX = manager.workingPiece?.column ?? 0;
		const workY = manager.workingPiece?.row ?? 0;
		let ghostIdx = 0;

		for (let y = 0, ly = manager.workingPiece?.cells.length ?? 0; y < ly; ++y) {
			for (let x = 0, lx = manager.workingPiece!.cells[y].length ?? 0; x < lx; ++x) {
				if (manager.workingPiece!.cells[y][x] === 0) continue;

				if (!tetrominoSprites.current[idx]) {
					const _sprite = new PIXI.Sprite();
					_sprite.width = 16;
					_sprite.height = 16;
					tetrominoSprites.current[idx] = _sprite;
				}

				const sprite = tetrominoSprites.current[idx];
				if (sprite.parent !== spriteContainer.current) spriteContainer.current.addChild(sprite);

				if ((sprite.texture as any)?.mino !== manager.workingPiece?.cells[y][x]) {
					sprite.texture?.destroy();

					const texture = new PIXI.Texture(
						spritesheet.current.baseTexture,
						spritesheet.current.textures['mino-' + manager.workingPiece?.cells[y][x]].frame,
					);

					(texture as any).mino = manager.workingPiece?.cells[y][x];
					sprite.texture = texture;
				}

				sprite.position.set((x + workX) * 16, (y + workY) * 16);

				idx += 1;
			}
		}

		const ghostPiece = manager.workingPiece?.clone();
		while (ghostPiece?.moveDown(manager.grid));

		const ghostX = ghostPiece?.column ?? 0;
		const ghostY = ghostPiece?.row ?? 0;

		for (let y = 0, ly = ghostPiece?.cells.length ?? 0; y < ly; ++y) {
			for (let x = 0, lx = ghostPiece?.cells[y].length ?? 0; x < lx; ++x) {
				if (ghostPiece!.cells[y][x] === 0) continue;

				if (!ghostSprites.current[ghostIdx]) {
					const _sprite = new PIXI.Sprite();
					_sprite.width = 16;
					_sprite.height = 16;
					_sprite.alpha = 0.5;
					ghostSprites.current[ghostIdx] = _sprite;
					app.current.stage.addChild(_sprite);
				}

				const sprite = ghostSprites.current[ghostIdx];

				if ((sprite.texture as any)?.mino !== ghostPiece?.cells[y][x]) {
					sprite.texture?.destroy();

					const texture = new PIXI.Texture(
						spritesheet.current.baseTexture,
						spritesheet.current.textures['mino-' + ghostPiece?.cells[y][x]].frame,
					);

					(texture as any).mino = ghostPiece?.cells[y][x];
					sprite.texture = texture;
				}

				sprite.position.set(
					spriteContainer.current.x + (x + ghostX) * 16,
					spriteContainer.current.y + (y + ghostY) * 16,
				);

				ghostIdx += 1;
			}
		}

		let upNextIdx = 0;
		for (let i = 0, l = manager.workingPieces.length; i < Math.min(14, l); ++i) {
			const piece = manager.workingPieces[i];

			const dx = Math.max(i - 3, 0) * 80;
			const dy = Math.min(i, 3) * 80;

			for (let y = 0, ly = piece?.cells.length ?? 0; y < ly; ++y) {
				for (let x = 0, lx = piece?.cells[y].length ?? 0; x < lx; ++x) {
					if (piece!.cells[y][x] === 0) continue;

					if (!upNextSprites.current[upNextIdx]) {
						const _sprite = new PIXI.Sprite();
						_sprite.width = 16;
						_sprite.height = 16;
						upNextSprites.current[upNextIdx] = _sprite;
						spriteContainer.current.addChild(_sprite);
					}

					const sprite = upNextSprites.current[upNextIdx];

					if ((sprite.texture as any)?.mino !== piece?.cells[y][x]) {
						sprite.texture?.destroy();

						const texture = new PIXI.Texture(
							spritesheet.current.baseTexture,
							spritesheet.current.textures['mino-' + piece?.cells[y][x]].frame,
						);

						(texture as any).mino = piece?.cells[y][x];
						sprite.texture = texture;
					}

					sprite.position.set(222 + dx + x * 16, 20 + dy + y * 16);

					upNextIdx += 1;
				}
			}
		}

		tetrominoSprites.current.splice(idx, tetrominoSprites.current.length - idx).forEach((sprite) => {
			spriteContainer.current!.removeChild(sprite);
			sprite.texture.destroy();
			sprite.destroy();
		});

		ghostSprites.current.splice(ghostIdx, ghostSprites.current.length - ghostIdx).forEach((sprite) => {
			app.current!.stage.removeChild(sprite);
			sprite.texture.destroy();
			sprite.destroy();
		});

		upNextSprites.current.splice(upNextIdx, upNextSprites.current.length - upNextIdx).forEach((sprite) => {
			spriteContainer.current!.removeChild(sprite);
			sprite.texture.destroy();
			sprite.destroy();
		});
	});

	useEffect(() => {
		if (!app.current) return;

		bevelFilter.current = new BevelFilter({
			thickness: 3.5,
			lightAlpha: 0.5,
			shadowAlpha: 0.5,
		});

		textGroup.current = new PIXI.Container();
		textGroup.current.position.x = 30;
		textGroup.current.position.y = 93;
		textGroup.current.filters = [
			new DropShadowFilter({
				distance: 2,
				rotation: 90,
				alpha: 1,
				blur: 4,
				quality: 10,
			}),
		];

		prefix.current = createText('$', bevelFilter.current, 32);
		prefix.current.filters = [bevelFilter.current];
		prefix.current.position.x = -30;
		prefix.current.position.y = 10;

		textGroup.current.addChild(prefix.current);

		spritesheet.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(tetrominos), TetrominoAtlas);
		spritesheet.current.parse();

		spriteContainer.current = new PIXI.Container();
		spriteContainer.current.position.set(80, 0);
		spriteContainer.current.filters = [new OutlineFilter(2, 0xdddddd)];

		app.current.stage.addChild(textGroup.current);
		app.current.stage.addChild(spriteContainer.current);

		return () => {
			bevelFilter.current?.destroy();
			bevelFilter.current = null;

			if (!prefix.current?.destroyed) prefix.current?.destroy(true);
			prefix.current = null;

			text.current.forEach((letter) => {
				if (!letter.destroyed) letter.destroy(true);
			});

			textGroup.current?.filters?.[0]?.destroy();
			if (!textGroup.current?.destroyed) textGroup.current!.destroy(true);
			textGroup.current = null;

			spriteContainer.current?.filters?.[0]?.destroy();
			if (!spriteContainer.current?.destroyed) spriteContainer.current?.destroy(true);
			spriteContainer.current = null;

			spritesheet.current?.destroy();
			spritesheet.current = null;
		};
	}, [app]);

	return (
		<Container>
			<Background src={background} />
			<Frame src={frame} />
			<Canvas ref={canvasRef} />
			<DonationText src={donationText} />
		</Container>
	);
}

function createText(letter: string, filter: PIXI.Filter, size = 64): PIXI.Text {
	const text = new PIXI.Text(letter, {
		fontFamily: 'gdqpixel',
		fontSize: size,
		fill: GradientColors[letter] ?? GradientColors['none'],
		fillGradientType: PIXI.TEXT_GRADIENT.LINEAR_VERTICAL,
		padding: 10,
	});
	text.filters = [filter];
	return text;
}

const DonationText = styled.img`
	width: 500px;
	height: 100px;
	object-fit: contain;
	position: absolute;
	left: 475px;
	top: 160px;

	animation: slow-flash 2s infinite;
	animation-timing-function: step-end;

	@keyframes slow-flash {
		0% {
			opacity: 1;
		}

		70% {
			opacity: 0;
		}
	}
`;

const Canvas = styled.canvas`
	position: absolute;
	width: 100% !important;
	height: 100% !important;
`;

const Frame = styled.img`
	position: absolute;
	left: 64px;
	top: 0;
`;

const Rotate = keyframes`
	0% {
		transform: scale(1) rotate(0);
		animation-timing-function: linear;
	}

	50% {
		transform: scale(1.8) rotate(180deg);
		animation-timing-function: linear;
	}

	100% {
		transform: scale(1) rotate(360deg);
		animation-timing-function: linear;
	}
`;

const Background = styled.img`
	position: absolute;
	width: 1200px;
	height: 1200px;
	left: -54px;
	top: -434px;
	object-fit: cover;
	filter: brightness(0.5);
	transform-origin: center center;
	animation: ${Rotate} 120s infinite;
`;

const Container = styled.div`
	position: absolute;
	width: 100%;
	top: 6px;
	height: 320px;
	padding: 0;
	margin: 0;
	overflow: hidden;
	background: black;
`;

const TetrominoAtlas: PIXI.ISpritesheetData = {
	frames: {
		'mino-1': {
			frame: { x: 32, y: 0, w: 16, h: 16 },
			sourceSize: { w: 16, h: 16 },
			spriteSourceSize: { x: 16, y: 16 },
		},
		'mino-2': {
			frame: { x: 48, y: 0, w: 16, h: 16 },
			sourceSize: { w: 16, h: 16 },
			spriteSourceSize: { x: 16, y: 16 },
		},
		'mino-3': {
			frame: { x: 0, y: 16, w: 16, h: 16 },
			sourceSize: { w: 16, h: 16 },
			spriteSourceSize: { x: 16, y: 16 },
		},
		'mino-4': {
			frame: { x: 16, y: 16, w: 16, h: 16 },
			sourceSize: { w: 16, h: 16 },
			spriteSourceSize: { x: 16, y: 16 },
		},
		'mino-5': {
			frame: { x: 32, y: 16, w: 16, h: 16 },
			sourceSize: { w: 16, h: 16 },
			spriteSourceSize: { x: 16, y: 16 },
		},
		'mino-6': {
			frame: { x: 48, y: 16, w: 16, h: 16 },
			sourceSize: { w: 16, h: 16 },
			spriteSourceSize: { x: 16, y: 16 },
		},
		'mino-7': {
			frame: { x: 16, y: 0, w: 16, h: 16 },
			sourceSize: { w: 16, h: 16 },
			spriteSourceSize: { x: 16, y: 16 },
		},
	},
	meta: { scale: '1' },
};

const GradientColors: Record<string, [string, string]> = {
	none: ['#D8D6D2', '#676665'],
	'0': ['#1ACEE4', '#0379A9'],
	'1': ['#FF7E11', '#C30200'],
	'2': ['#71e218', '#3c8008'],
	'3': ['#E3D919', '#9B7514'],
	'4': ['#F411FF', '#9900A4'],
	'5': ['#0D54F2', '#1304AE'],
	'6': ['#ffa414', '#ca6002'],
	'7': ['#6314ff', '#4502ca'],
	'8': ['#147aff', '#0270ca'],
	'9': ['#14ffa5', '#02ca4f'],
};
