import * as PIXI from 'pixi.js';
import { Color } from './game/model';

export const BALL_RADIUS = 5;
export const BLOCK_HEIGHT = 10;
export const BLOCK_WIDTH = 50;
export const PADDLE_WIDTH = 80;
export const PADDLE_HEIGHT = 10;

export const BALL_TEMPLATE = new PIXI.Graphics();
BALL_TEMPLATE.beginFill(Color.WHITE);
BALL_TEMPLATE.drawRect(-BALL_RADIUS, -BALL_RADIUS, BALL_RADIUS * 2, BALL_RADIUS * 2);

export const BLOCK_TEMPLATES = new Map(Object.values(Color).map((color) => [color, blockTemplate(color as Color)]));
export const PADDLE_TEMPLATE = new PIXI.Graphics();

PADDLE_TEMPLATE.beginFill(Color.WHITE);
PADDLE_TEMPLATE.drawRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);

function blockTemplate(color: number): PIXI.Graphics {
	const template = new PIXI.Graphics();
	template.beginFill(color);
	template.drawRect(0, 0, BLOCK_WIDTH, BLOCK_HEIGHT);

	return template;
}

export const AI_SAMPLE_MS = 50;
