// Dig Dug Channel Constants

export const CHANNEL_WIDTH = 1092;
export const CHANNEL_HEIGHT = 332;

// Grid configuration - larger grid for bigger sprites
export const GRID_SIZE = 22;
export const GRID_COLS = Math.floor(CHANNEL_WIDTH / GRID_SIZE);
export const GRID_ROWS = Math.floor(CHANNEL_HEIGHT / GRID_SIZE);

// Donation thresholds for spawning
export const DONATION_THRESHOLDS = {
	SMALL: 1,
	MEDIUM: 10,
	LARGE: 50,
	HUGE: 100,
	MEGA: 500,
};

// Character settings
export const MOVE_SPEED = 200; // milliseconds between moves
export const INITIAL_POSITION = {
	x: Math.floor(GRID_COLS / 2),
	y: 2, // Start near top
};
export const CHARACTER_SIZE = 20; // pixels
export const ENEMY_SIZE = 18; // pixels

// Pump/inflate mechanic
export const PUMP_DURATION = 1500; // milliseconds to fully inflate
export const PUMP_LINE_SPEED = 300; // pixels per second
export const MAX_INFLATION = 3; // multiplier for max size
export const PUMP_RANGE = 8; // max grid cells away to pump

// Spawn limits
export const MAX_COLLECTIBLES = 30;
export const MAX_ENEMIES = 10;
export const MAX_SPAWN_ATTEMPTS = 100;

// Enemy settings
export const ENEMY_MOVE_SPEED = 300; // milliseconds between moves
export const ENEMY_RESPAWN_DELAY = 3000; // milliseconds before new enemy spawns

// Visual settings
export const COLORS = {
	BACKGROUND: 0x1a1a1a, // Black for dug tunnels
	DIRT: 0x8b6f47, // Brown dirt
	DIRT_DARK: 0x654321, // Darker brown for variation
	CHARACTER: 0x4287f5, // Blue digger
	CHARACTER_ACCENT: 0xff4444, // Red accent
	COLLECTIBLE_RED: 0xff4444,
	COLLECTIBLE_ORANGE: 0xff8844,
	COLLECTIBLE_YELLOW: 0xffdd44,
	COLLECTIBLE_PINK: 0xff88dd,
	ENEMY_GREEN: 0x44ff88,
	ENEMY_PURPLE: 0xaa44ff,
	TEXT_BROWN: 0x654321,
	UI_BACKGROUND: 0x8b6f47,
};

export enum Direction {
	UP = 0,
	RIGHT = 1,
	DOWN = 2,
	LEFT = 3,
}

// Collectible types for visual variety
export const COLLECTIBLE_TYPES = [
	{ color: COLORS.COLLECTIBLE_RED, name: 'cherry' },
	{ color: COLORS.COLLECTIBLE_ORANGE, name: 'orange' },
	{ color: COLORS.COLLECTIBLE_YELLOW, name: 'banana' },
	{ color: COLORS.COLLECTIBLE_PINK, name: 'strawberry' },
];
