import * as PIXI from 'pixi.js';
import {
	CHANNEL_WIDTH,
	CHANNEL_HEIGHT,
	GRID_SIZE,
	GRID_COLS,
	GRID_ROWS,
	INITIAL_LENGTH,
	MOVE_SPEED,
	MAX_SNAKE_LENGTH,
	MAX_FOOD,
	MAX_FOOD_SPAWN_ATTEMPTS,
	MILESTONE_BANNER_DURATION,
	COLORS,
	Direction,
	DONATION_THRESHOLDS,
	POSITION_HISTORY_MAX,
	STUCK_DETECTION_WINDOW,
	MIN_UNIQUE_POSITIONS,
	STUCK_THRESHOLD_SOFT,
	STUCK_THRESHOLD_HARD,
	STUCK_THRESHOLD_BEFORE_SEEKING,
	MIN_SNAKE_LENGTH_FOR_SPACE_CHECK,
	MIN_REQUIRED_SPACE_MULTIPLIER,
	MIN_REQUIRED_SPACE_MIN,
	MIN_AVAILABLE_SPACE_FOR_FOOD_SEEKING,
	PARALLEL_CHECK_START_SEGMENT,
	PARALLEL_CHECK_MAX_SEGMENTS,
	SPACE_CHECK_BFS_LIMIT,
	TAIL_IGNORE_MULTIPLIER,
	SCORE_SPACE_WEIGHT,
	SCORE_PARALLEL_PENALTY,
	SCORE_FOOD_BASE,
	SCORE_FOOD_DISTANCE_WEIGHT,
	SCORE_NO_FOOD_RANDOMNESS,
	SCORE_STUCK_RANDOMNESS,
} from './constants';

interface Position {
	x: number;
	y: number;
}

interface Food {
	pos: Position;
	graphics: PIXI.Graphics;
}

export class SnakeGame {
	public app: PIXI.Application;
	private snake: Position[] = [];
	private snakePositionSet: Set<string> = new Set();
	private snakeGraphics: PIXI.Graphics[] = [];
	private direction: Direction = Direction.RIGHT;
	private nextDirection: Direction = Direction.RIGHT;
	private food: Food[] = [];
	private gameLayer: PIXI.Container;
	private uiLayer: PIXI.Container;
	private moveTimer = 0;
	private milestoneActive = false;
	private positionHistory: string[] = [];
	private stuckCounter = 0;

	constructor(canvas: HTMLCanvasElement) {
		this.app = new PIXI.Application({
			view: canvas,
			width: CHANNEL_WIDTH,
			height: CHANNEL_HEIGHT,
			backgroundColor: COLORS.BACKGROUND,
			antialias: false,
		});

		// Create layers
		this.gameLayer = new PIXI.Container();
		this.uiLayer = new PIXI.Container();
		this.uiLayer.sortableChildren = true;

		this.app.stage.addChild(this.gameLayer);
		this.app.stage.addChild(this.uiLayer);

		this.initializeSnake();
		this.drawGrid();
	}

	private initializeSnake() {
		const startX = Math.floor(GRID_COLS / 2);
		const startY = Math.floor(GRID_ROWS / 2);

		this.snake = [];
		this.snakePositionSet.clear();
		for (let i = 0; i < INITIAL_LENGTH; i++) {
			const pos = { x: startX - i, y: startY };
			this.snake.push(pos);
			this.snakePositionSet.add(`${pos.x},${pos.y}`);
		}
	}

	private positionKey(pos: Position): string {
		return `${pos.x},${pos.y}`;
	}

	private isSnakeAtPosition(pos: Position): boolean {
		return this.snakePositionSet.has(this.positionKey(pos));
	}

	private resetSnake() {
		// Reset snake to initial size and position
		this.initializeSnake();

		// Reset direction to right
		this.direction = Direction.RIGHT;
		this.nextDirection = Direction.RIGHT;

		// Clear tracking data
		this.positionHistory = [];
		this.stuckCounter = 0;
	}

	private drawGrid() {
		const graphics = new PIXI.Graphics();
		graphics.lineStyle(1, COLORS.GRID_LINE, 0.3);

		// Draw vertical lines
		for (let x = 0; x <= GRID_COLS; x++) {
			graphics.moveTo(x * GRID_SIZE, 0);
			graphics.lineTo(x * GRID_SIZE, CHANNEL_HEIGHT);
		}

		// Draw horizontal lines
		for (let y = 0; y <= GRID_ROWS; y++) {
			graphics.moveTo(0, y * GRID_SIZE);
			graphics.lineTo(CHANNEL_WIDTH, y * GRID_SIZE);
		}

		this.gameLayer.addChild(graphics);
	}

	public update(deltaTime: number) {
		if (this.milestoneActive) return;

		this.moveTimer += deltaTime;

		if (this.moveTimer >= MOVE_SPEED) {
			this.moveTimer = 0;
			this.moveSnake();
		}

		this.render();
	}

	private moveSnake() {
		this.direction = this.nextDirection;

		const head = this.snake[0];
		const newHead = this.getPositionInDirection(head, this.direction);

		if (newHead.x < 0 || newHead.x >= GRID_COLS || newHead.y < 0 || newHead.y >= GRID_ROWS) {
			return;
		}

		if (this.isSnakeAtPosition(newHead)) {
			this.resetSnake();
			return;
		}

		// Track position history to detect loops
		const posKey = `${newHead.x},${newHead.y}`;
		this.positionHistory.push(posKey);
		if (this.positionHistory.length > POSITION_HISTORY_MAX) {
			this.positionHistory.shift();
		}

		const recentPositions = this.positionHistory.slice(-STUCK_DETECTION_WINDOW);
		const uniquePositions = new Set(recentPositions).size;
		if (uniquePositions < MIN_UNIQUE_POSITIONS && this.positionHistory.length >= STUCK_DETECTION_WINDOW) {
			this.stuckCounter += 1;
		} else {
			this.stuckCounter = 0;
		}

		this.snake.unshift(newHead);
		this.snakePositionSet.add(this.positionKey(newHead));

		const eatenFoodIndex = this.food.findIndex((f) => f.pos.x === newHead.x && f.pos.y === newHead.y);

		if (eatenFoodIndex !== -1) {
			const eatenFood = this.food[eatenFoodIndex];
			this.gameLayer.removeChild(eatenFood.graphics);
			eatenFood.graphics.destroy();
			this.food.splice(eatenFoodIndex, 1);
			this.stuckCounter = 0;
			this.positionHistory = [];
		} else {
			const tail = this.snake.pop();
			if (tail) {
				this.snakePositionSet.delete(this.positionKey(tail));
			}
		}

		// Enforce max length
		if (this.snake.length > MAX_SNAKE_LENGTH) {
			const removedSegments = this.snake.slice(MAX_SNAKE_LENGTH);
			this.snake = this.snake.slice(0, MAX_SNAKE_LENGTH);
			for (const segment of removedSegments) {
				this.snakePositionSet.delete(this.positionKey(segment));
			}
		}
	}

	public setDirection(newDirection: Direction) {
		const opposite = (this.direction + 2) % 4;
		if (newDirection !== opposite) {
			this.nextDirection = newDirection;
		}
	}

	// Find the best direction to move toward food
	public getSmartDirection(): Direction | null {
		const head = this.snake[0];

		const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
		const validDirections: Array<{ dir: Direction; score: number }> = [];

		const hasFood = this.food.length > 0;

		for (const dir of directions) {
			const opposite = (this.direction + 2) % 4;
			if (dir === opposite) continue;

			const testPos = this.getPositionInDirection(head, dir);

			if (!this.isPositionValid(testPos)) continue;

			const availableSpace = this.countAvailableSpace(testPos);

			const minRequiredSpace = Math.min(
				MIN_REQUIRED_SPACE_MIN,
				Math.floor(this.snake.length * MIN_REQUIRED_SPACE_MULTIPLIER),
			);
			if (availableSpace < minRequiredSpace && this.snake.length > MIN_SNAKE_LENGTH_FOR_SPACE_CHECK) continue;

			let score = 0;

			score += availableSpace * SCORE_SPACE_WEIGHT;

			let parallelSegments = 0;
			for (
				let i = PARALLEL_CHECK_START_SEGMENT;
				i < Math.min(this.snake.length, PARALLEL_CHECK_MAX_SEGMENTS);
				i += 1
			) {
				const segment = this.snake[i];
				const isAdjacent =
					(Math.abs(testPos.x - segment.x) === 1 && testPos.y === segment.y) ||
					(Math.abs(testPos.y - segment.y) === 1 && testPos.x === segment.x);
				if (isAdjacent) {
					parallelSegments += 1;
				}
			}
			score -= parallelSegments * SCORE_PARALLEL_PENALTY;

			if (
				hasFood &&
				this.stuckCounter < STUCK_THRESHOLD_BEFORE_SEEKING &&
				availableSpace > MIN_AVAILABLE_SPACE_FOR_FOOD_SEEKING
			) {
				let minDistance = this.getManhattanDistance(testPos, this.food[0].pos);

				for (const food of this.food) {
					const distance = this.getManhattanDistance(testPos, food.pos);
					if (distance < minDistance) {
						minDistance = distance;
					}
				}

				score += SCORE_FOOD_BASE - minDistance * SCORE_FOOD_DISTANCE_WEIGHT;
			} else if (!hasFood) {
				score += Math.random() * SCORE_NO_FOOD_RANDOMNESS;
			}

			if (this.stuckCounter >= STUCK_THRESHOLD_SOFT) {
				score += Math.random() * SCORE_STUCK_RANDOMNESS;
			}

			validDirections.push({ dir, score });
		}

		if (validDirections.length === 0) return null;

		validDirections.sort((a, b) => b.score - a.score);

		if (this.stuckCounter >= STUCK_THRESHOLD_HARD) {
			this.stuckCounter = 0;
			this.positionHistory = [];
			const randomIndex = Math.floor(Math.random() * validDirections.length);
			return validDirections[randomIndex].dir;
		}

		return validDirections[0].dir;
	}

	private countAvailableSpace(startPos: Position): number {
		const visited = new Set<string>();
		const queue: Position[] = [startPos];
		let count = 0;

		const tailIgnoreLength = Math.floor(this.snake.length * TAIL_IGNORE_MULTIPLIER);

		while (queue.length > 0 && count < SPACE_CHECK_BFS_LIMIT) {
			const pos = queue.shift();
			if (!pos) break;

			const key = `${pos.x},${pos.y}`;
			if (visited.has(key)) continue;
			visited.add(key);

			if (pos.x < 0 || pos.x >= GRID_COLS || pos.y < 0 || pos.y >= GRID_ROWS) {
				continue;
			}

			if (this.isSnakeAtPosition(pos)) {
				let blockedByTail = false;
				for (let i = this.snake.length - tailIgnoreLength; i < this.snake.length; i += 1) {
					const segment = this.snake[i];
					if (segment.x === pos.x && segment.y === pos.y) {
						blockedByTail = true;
						break;
					}
				}
				if (!blockedByTail) continue;
			}

			count += 1;

			queue.push({ x: pos.x + 1, y: pos.y });
			queue.push({ x: pos.x - 1, y: pos.y });
			queue.push({ x: pos.x, y: pos.y + 1 });
			queue.push({ x: pos.x, y: pos.y - 1 });
		}

		return count;
	}

	private getManhattanDistance(pos1: Position, pos2: Position): number {
		return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
	}

	private getPositionInDirection(pos: Position, dir: Direction): Position {
		switch (dir) {
			case Direction.UP:
				return { x: pos.x, y: pos.y - 1 };
			case Direction.DOWN:
				return { x: pos.x, y: pos.y + 1 };
			case Direction.LEFT:
				return { x: pos.x - 1, y: pos.y };
			case Direction.RIGHT:
				return { x: pos.x + 1, y: pos.y };
		}
	}

	private isPositionValid(pos: Position): boolean {
		if (pos.x < 0 || pos.x >= GRID_COLS || pos.y < 0 || pos.y >= GRID_ROWS) {
			return false;
		}

		return !this.isSnakeAtPosition(pos);
	}

	public spawnFood(count: number) {
		for (let i = 0; i < count && this.food.length < MAX_FOOD; i++) {
			let pos: Position;
			let attempts = 0;
			do {
				pos = {
					x: Math.floor(Math.random() * GRID_COLS),
					y: Math.floor(Math.random() * GRID_ROWS),
				};
				attempts += 1;
			} while (
				attempts < MAX_FOOD_SPAWN_ATTEMPTS &&
				(this.isSnakeAtPosition(pos) || this.food.some((f) => f.pos.x === pos.x && f.pos.y === pos.y))
			);

			if (attempts >= MAX_FOOD_SPAWN_ATTEMPTS) continue;

			const graphics = new PIXI.Graphics();
			const cx = Math.floor(pos.x * GRID_SIZE + GRID_SIZE / 2);
			const cy = Math.floor(pos.y * GRID_SIZE + GRID_SIZE / 2);
			const squareSize = 3;
			const spacing = 3;

			graphics.beginFill(COLORS.FOOD);
			graphics.drawRect(cx - squareSize / 2, cy - spacing - squareSize / 2, squareSize, squareSize);
			graphics.drawRect(cx + spacing - squareSize / 2, cy - squareSize / 2, squareSize, squareSize);
			graphics.drawRect(cx - squareSize / 2, cy + spacing - squareSize / 2, squareSize, squareSize);
			graphics.drawRect(cx - spacing - squareSize / 2, cy - squareSize / 2, squareSize, squareSize);
			graphics.endFill();

			this.gameLayer.addChild(graphics);
			this.food.push({ pos, graphics });
		}
	}

	public spawnFoodForDonation(amount: number) {
		let count = 1;

		if (amount >= DONATION_THRESHOLDS.MEGA) {
			count = 20;
		} else if (amount >= DONATION_THRESHOLDS.HUGE) {
			count = 10;
		} else if (amount >= DONATION_THRESHOLDS.LARGE) {
			count = 5;
		} else if (amount >= DONATION_THRESHOLDS.MEDIUM) {
			count = 3;
		}

		this.spawnFood(count);
	}

	public triggerMilestoneAnimation(milestoneAmount: number): void {
		this.milestoneActive = true;

		const banner = this.createMilestoneBanner(milestoneAmount);
		this.uiLayer.addChild(banner);

		// Reset snake to small size after banner duration
		setTimeout(() => {
			this.uiLayer.removeChild(banner);
			banner.destroy();
			this.milestoneActive = false;
			// Reset the snake to initial small size
			this.resetSnake();
		}, MILESTONE_BANNER_DURATION);
	}

	private createMilestoneBanner(amount: number): PIXI.Container {
		const container = new PIXI.Container();
		container.zIndex = 1000;

		const bannerWidth = 600;
		const bannerHeight = 100;

		// Background
		const bg = new PIXI.Graphics();
		bg.beginFill(COLORS.TEXT_GREEN);
		bg.drawRect(0, 0, bannerWidth, bannerHeight);
		bg.endFill();

		bg.beginFill(COLORS.BACKGROUND);
		bg.drawRect(6, 6, bannerWidth - 12, bannerHeight - 12);
		bg.endFill();

		container.addChild(bg);

		const goalText = new PIXI.Text('HIGH SCORE', {
			fontFamily: 'Arial, sans-serif',
			fontSize: 48,
			fontWeight: 'bold',
			fill: COLORS.TEXT_GREEN,
			align: 'center',
		});
		goalText.anchor.set(0.5);
		goalText.position.set(bannerWidth / 2, 30);
		container.addChild(goalText);

		const amountText = new PIXI.Text(`$${amount.toLocaleString()}`, {
			fontFamily: 'Arial, sans-serif',
			fontSize: 42,
			fontWeight: 'bold',
			fill: COLORS.TEXT_GREEN,
			align: 'center',
		});
		amountText.anchor.set(0.5);
		amountText.position.set(bannerWidth / 2, 70);
		container.addChild(amountText);

		container.position.set((CHANNEL_WIDTH - bannerWidth) / 2, (CHANNEL_HEIGHT - bannerHeight) / 2);

		return container;
	}

	private render() {
		for (const graphic of this.snakeGraphics) {
			this.gameLayer.removeChild(graphic);
			graphic.destroy();
		}
		this.snakeGraphics = [];

		this.snake.forEach((segment) => {
			const graphics = new PIXI.Graphics();

			const baseX = segment.x * GRID_SIZE;
			const baseY = segment.y * GRID_SIZE;

			graphics.beginFill(COLORS.SNAKE);
			graphics.drawRect(baseX, baseY, GRID_SIZE, GRID_SIZE);
			graphics.endFill();

			this.snakeGraphics.push(graphics);
			this.gameLayer.addChild(graphics);
		});
	}

	public destroy() {
		// Clean up snake graphics
		for (const graphic of this.snakeGraphics) {
			this.gameLayer.removeChild(graphic);
			graphic.destroy();
		}
		this.snakeGraphics = [];

		// Clean up food graphics
		for (const food of this.food) {
			this.gameLayer.removeChild(food.graphics);
			food.graphics.destroy();
		}
		this.food = [];

		this.app.destroy(true, { children: true });
	}
}
