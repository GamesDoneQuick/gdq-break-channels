import { ISpritesheetData } from 'pixi.js';

export const atlas: ISpritesheetData = {
	frames: {
		ship: {
			frame: { x: 492, y: 297, w: 32, h: 32 },
			spriteSourceSize: { x: 0, y: 0 },
			sourceSize: { w: 32, h: 32 },
		},
		missile: {
			frame: { x: 294, y: 231, w: 32, h: 32 },
			spriteSourceSize: { x: 0, y: 0 },
			sourceSize: { w: 32, h: 32 },
		},
		enemyBee: {
			frame: { x: 327, y: 462, w: 32, h: 32 },
			spriteSourceSize: { x: 0, y: 0 },
			sourceSize: { w: 32, h: 32 },
		},
		enemyButterfly: {
			frame: { x: 360, y: 462, w: 32, h: 32 },
			spriteSourceSize: { x: 0, y: 0 },
			sourceSize: { w: 32, h: 32 },
		},
		enemyBoss: {
			frame: { x: 459, y: 66, w: 32, h: 32 },
			spriteSourceSize: { x: 0, y: 0 },
			sourceSize: { w: 32, h: 32 },
		},
		destroy1: {
			frame: { x: 162, y: 0, w: 64, h: 64 },
			spriteSourceSize: { x: 0, y: 0 },
			sourceSize: { w: 64, h: 64 },
		},
		destroy2: {
			frame: { x: 97, y: 130, w: 64, h: 64 },
			spriteSourceSize: { x: 0, y: 0 },
			sourceSize: { w: 64, h: 64 },
		},
		destroy3: {
			frame: { x: 97, y: 195, w: 64, h: 64 },
			spriteSourceSize: { x: 0, y: 0 },
			sourceSize: { w: 64, h: 64 },
		},
		destroy4: {
			frame: { x: 97, y: 260, w: 64, h: 64 },
			spriteSourceSize: { x: 0, y: 0 },
			sourceSize: { w: 64, h: 64 },
		},
		destroy5: {
			frame: { x: 97, y: 390, w: 64, h: 64 },
			spriteSourceSize: { x: 0, y: 0 },
			sourceSize: { w: 64, h: 64 },
		},
	},
	meta: {
		scale: '1',
	},
	animations: {
		destroy: ['destroy1', 'destroy2', 'destroy3', 'destroy4', 'destroy5'],
	},
};
