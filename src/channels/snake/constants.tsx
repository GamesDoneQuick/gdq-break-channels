// Snake Channel Constants

export const CHANNEL_WIDTH = 1092;
export const CHANNEL_HEIGHT = 332;

// Grid configuration
export const GRID_SIZE = 11;
export const GRID_COLS = Math.floor(CHANNEL_WIDTH / GRID_SIZE);
export const GRID_ROWS = Math.floor(CHANNEL_HEIGHT / GRID_SIZE);

// Donation thresholds for food spawning
export const DONATION_THRESHOLDS = {
	SMALL: 1,
	MEDIUM: 10,
	LARGE: 50,
	HUGE: 100,
	MEGA: 500,
};

export const INITIAL_LENGTH = 5;
export const MOVE_SPEED = 150;
export const MAX_SNAKE_LENGTH = 200;

export const MAX_FOOD = 50;
export const MAX_FOOD_SPAWN_ATTEMPTS = 100;

export const MILESTONE_INCREMENT = 5000;
export const MILESTONE_BANNER_DURATION = 3500;

export const POSITION_HISTORY_MAX = 20;
export const STUCK_DETECTION_WINDOW = 10;
export const MIN_UNIQUE_POSITIONS = 4;
export const STUCK_THRESHOLD_SOFT = 3;
export const STUCK_THRESHOLD_HARD = 8;
export const STUCK_THRESHOLD_BEFORE_SEEKING = 5;
export const MIN_SNAKE_LENGTH_FOR_SPACE_CHECK = 15;
export const MIN_REQUIRED_SPACE_MULTIPLIER = 0.2;
export const MIN_REQUIRED_SPACE_MIN = 5;
export const MIN_AVAILABLE_SPACE_FOR_FOOD_SEEKING = 20;
export const PARALLEL_CHECK_START_SEGMENT = 3;
export const PARALLEL_CHECK_MAX_SEGMENTS = 20;
export const SPACE_CHECK_BFS_LIMIT = 50;
export const TAIL_IGNORE_MULTIPLIER = 0.5;

export const SCORE_SPACE_WEIGHT = 1000;
export const SCORE_PARALLEL_PENALTY = 5000;
export const SCORE_FOOD_BASE = 1000;
export const SCORE_FOOD_DISTANCE_WEIGHT = 5;
export const SCORE_NO_FOOD_RANDOMNESS = 500;
export const SCORE_STUCK_RANDOMNESS = 5000;

export const COLORS = {
	BACKGROUND: 0xc7d23c,
	SNAKE: 0x404040,
	FOOD: 0x404040,
	GRID_LINE: 0xb8c934,
	TEXT_GREEN: 0x43523d,
};

export enum Direction {
	UP = 0,
	RIGHT = 1,
	DOWN = 2,
	LEFT = 3,
}
