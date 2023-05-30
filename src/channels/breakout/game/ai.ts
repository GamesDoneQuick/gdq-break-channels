import { Breakout } from './breakout';
import { velocityToPosition } from './math';
import { Ball, Move, Velocity } from './model';

/**
 * This is basically my first attempt at an AI for a game.
 *
 * It's probably bad.
 */
export class BreakoutAI {
	constructor(private readonly game: Breakout) {}

	evaluateMove() {
		// Find a ball to chase and chase it.
		const target = this.findBallToChase();
		if (target) {
			let anticipatedX = target.x;
			const vector = velocityToPosition(target);

			if (vector.y > 0) {
				const stepsUntilArrival = (this.game.paddle.y - target.y) / vector.y;
				anticipatedX = target.x + stepsUntilArrival * vector.x;
			}

			this.move(this.directionTo(anticipatedX));
			return;
		}

		// Head towards middle if nothing else to do.
		if (this.paddleCenter() > this.boardCenter()) {
			this.move(Move.LEFT);
		} else {
			this.move(Move.RIGHT);
		}
	}

	private findBallToChase(): Ball | undefined {
		return [...this.game.balls].sort((ballA, ballB) => {
			const ballAy = this.yComponent(ballA);
			const ballBy = this.yComponent(ballB);

			// De-prioritize balls we missed.
			if (ballA.y > this.game.paddle.y) {
				return 1;
			}

			// De-prioritize balls we missed.
			if (ballB.y > this.game.paddle.y) {
				return -1;
			}

			// Prioritize balls moving down over balls moving up.
			if (ballAy < 0 !== ballBy < 0) {
				return ballBy;
			}

			// Both are moving down (y is increasing), decide which is a greater threat.
			// For now, that's the one that's scheduled to arrive sooner with an adjustment
			// for horizontal distance.
			if (ballAy > 0) {
				const etaA = (this.game.paddle.y - ballA.y) / ballAy;
				const etaB = (this.game.paddle.y - ballB.y) / ballBy;
				const distToA = Math.abs(ballA.x - this.paddleCenter());
				const distToB = Math.abs(ballB.x - this.paddleCenter());

				return etaA * distToA - etaB * distToB;
			}

			return 0;
		})[0];
	}

	// Determine if a given velocity is "down"
	private yComponent(velocity: Velocity) {
		return velocityToPosition(velocity).y;
	}

	private directionTo(xCoord: number): Move {
		if (this.paddleCenter() > xCoord) return Move.LEFT;

		return Move.RIGHT;
	}

	private paddleCenter() {
		return this.game.paddle.x + this.game.paddle.width / 2;
	}

	private boardCenter() {
		return this.game.bounds.x + this.game.bounds.width / 2;
	}

	private move(move: Move) {
		this.game.moveDirection = move;
	}
}
