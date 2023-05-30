import { Collider } from './collider';
import { collisionBox, containsPoint, sumVelocities } from './math';
import { Ball, Block, Bounds, Color, Move, Paddle, Side } from './model';

const PADDLE_SPEED_LIMIT = 2.5;
const BALL_SPEED_LIMIT = 2;
const PADDLE_ACCEL = 0.2;

export interface BreakoutState {
	readonly bounds: Bounds;
	readonly paddle: Paddle;
	readonly blocks: Block[];
	readonly balls: Ball[];
}

export class Breakout {
	readonly balls: Ball[] = [];
	private readonly collider: Collider = new Collider(this.bounds);
	private interval?: NodeJS.Timer;

	moveDirection = Move.NONE;

	constructor(readonly bounds: Bounds, readonly paddle: Paddle, readonly blocks: Block[]) {
		this.collider.addRect(this.paddle);
		this.blocks.forEach((block) => {
			this.collider.addRect(block);
		});
	}

	addBall(ball: Ball) {
		this.balls.push(ball);
	}

	addBlock(block: Block) {
		this.blocks.push(block);
		this.collider.addRect(block);
	}

	start() {
		let lastNow = performance.now();
		this.interval = setInterval(() => {
			const now = performance.now();
			this.tick(now - lastNow);
			lastNow = now;
		}, 1000 / 60);
	}

	tick(millis: number) {
		this.updatePaddleVelocity();

		const paddleTranslate = this.paddle.velocity * millis * 0.1;
		this.paddle.x = Math.max(
			0,
			Math.min(this.paddle.x + paddleTranslate, this.bounds.width + this.bounds.x - this.paddle.width),
		);

		const ballsToDestroy: Ball[] = [];

		for (const ball of this.balls) {
			// If the ball is inside the paddle, yeet it back out.
			if (containsPoint(collisionBox(this.paddle), ball)) {
				ball.x += paddleTranslate;
			}

			const collisionResult = this.collider.collisionsFor({
				start: ball,
				end: {
					x: ball.x + Math.cos(ball.angle) * ball.amplitude * millis * 0.1,
					y: ball.y + Math.sin(ball.angle) * ball.amplitude * millis * 0.1,
				},
			});

			ball.angle = collisionResult.exitAngle;
			ball.x = collisionResult.endPosition.x;
			ball.y = collisionResult.endPosition.y;

			if (collisionResult.intersections[0]?.block === this.paddle) {
				// We hit the paddle. Adjust velocity a bit.
				const verticalDirection = collisionResult.intersections[0]?.side === Side.BOTTOM ? 1 : -1;
				const newVelocity = sumVelocities(
					ball,
					{
						amplitude: Math.abs(this.paddle.velocity),
						// Send the ball slightly up and in the direction of travel.
						angle: verticalDirection * (this.paddle.velocity < 0 ? 0.8 * Math.PI : 0.2 * Math.PI),
					},
					BALL_SPEED_LIMIT,
				);
				ball.amplitude = newVelocity.amplitude;
				ball.angle = newVelocity.angle;
			}

			if (
				collisionResult.intersections[0]?.block === this.bounds &&
				collisionResult.intersections[0]?.side === Side.BOTTOM
			) {
				ballsToDestroy.push(ball);
			}

			collisionResult.intersections
				.map((i) => i.block)
				.filter(isBlock)
				.filter((b) => b.destroyable && !b.destroyed)
				.forEach((b) => {
					b.destroyed = true;
				});
		}

		while (ballsToDestroy.length) {
			const ball = ballsToDestroy.pop()!;
			const index = this.balls.indexOf(ball);
			if (index >= 0) {
				this.balls.splice(index, 1);
			}
		}
	}

	isLevelClear() {
		return this.blocks.every((block) => block.destroyed);
	}

	private updatePaddleVelocity() {
		if (this.moveDirection === Move.NONE) {
			if (Math.abs(this.paddle.velocity) < PADDLE_ACCEL) {
				this.paddle.velocity = 0;
			} else if (this.paddle.velocity < 0) {
				this.paddle.velocity += PADDLE_ACCEL;
			} else if (this.paddle.velocity > 0) {
				this.paddle.velocity -= PADDLE_ACCEL;
			}
		}

		if (this.moveDirection === Move.LEFT) {
			this.paddle.velocity = Math.max(-PADDLE_SPEED_LIMIT, this.paddle.velocity - PADDLE_ACCEL);
		}

		if (this.moveDirection === Move.RIGHT) {
			this.paddle.velocity = Math.min(PADDLE_SPEED_LIMIT, this.paddle.velocity + PADDLE_ACCEL);
		}
	}

	stop() {
		clearInterval(this.interval);
		this.interval = undefined;
	}

	serialize(): BreakoutState {
		return {
			bounds: {
				x: this.bounds.x,
				y: this.bounds.y,
				width: this.bounds.width,
				height: this.bounds.height,
			},
			balls: this.balls.slice(0),
			paddle: {
				x: this.paddle.x,
				y: this.paddle.y,
				width: this.paddle.width,
				height: this.paddle.height,
				velocity: this.paddle.velocity,
				collisionBuffer: this.paddle.collisionBuffer,
				destroyable: false,
				destroyed: this.paddle.destroyed,
				color: Color.WHITE,
			},
			blocks: this.blocks.slice(0),
		};
	}

	static deserialize(state: BreakoutState): Breakout {
		const breakout = new Breakout(state.bounds, state.paddle, state.blocks);

		state.balls.forEach((ball) => {
			breakout.addBall(ball);
		});

		return breakout;
	}
}

function isBlock(b: Block | Bounds): b is Block {
	return (b as Block).color !== undefined;
}
