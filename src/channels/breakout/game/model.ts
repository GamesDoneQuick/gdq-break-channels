export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

export interface Bounds extends Position, Size {}

export interface Segment {
	start: Position;
	end: Position;
}

export interface Velocity {
	angle: number; // in radians
	amplitude: number;
}

export interface Ball extends Position, Velocity {}

export interface Block extends Bounds {
	readonly color: Color;
	readonly destroyable: boolean;
	destroyed: boolean;
	readonly collisionBuffer: number;
}
export interface Paddle extends Block {
	velocity: number;
}

export enum Color {
	RED = 0xff0000,
	ORANGE = 0xff7f00,
	YELLOW = 0xffff00,
	GREEN = 0x00ff00,
	BLUE = 0x0000ff,
	INDIGO = 0x4b0082,
	VIOLET = 0x9400d3,
	WHITE = 0xcfcfcf,
	LIGHT_GRAY = 0x181818,
}

export function toCss(color: Color): string {
	const red = (color >> 16) & 0xff;
	const green = (color >> 8) & 0xff;
	const blue = color & 0xff;

	return `rgb(${red} ${green} ${blue})`;
}

export enum Side {
	TOP = 'top',
	RIGHT = 'right',
	BOTTOM = 'bottom',
	LEFT = 'left',
}

export enum Move {
	NONE = 'none',
	LEFT = 'left',
	RIGHT = 'right',
}
