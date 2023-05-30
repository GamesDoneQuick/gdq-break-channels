import { angleBetween, isBetween } from './math';
import { Block, Bounds, Position, Segment, Side } from './model';

interface CollisionResult {
	readonly intersections: Array<{
		readonly block: Block | Bounds;
		readonly side: Side;
	}>;
	readonly endPosition: Position;
	readonly exitAngle: number;
}

interface Intersect {
	readonly block: Block | Bounds;
	readonly progress: number;
	readonly intersectPoint: Position;
	readonly side: Side;
	readonly endPosition: Position;
}

/**
 * This is a custom point/rectangle collider that does linear checks for
 * collisions.
 *
 * There's probably fancier, faster ways to do this. But we're not dealing with
 * thousands of objects here.
 */
export class Collider {
	private readonly rects: Block[] = [];
	constructor(private readonly bounds: Bounds) {}

	addRect(rect: Block) {
		this.rects.push(rect);
	}

	removeRect(rect: Block) {
		const i = this.rects.indexOf(rect);
		if (i >= 0) {
			this.rects.splice(i, 1);
		}
	}

	collisionsFor({ start: startPoint, end: endPoint }: Segment): CollisionResult {
		if (startPoint.x === endPoint.x && startPoint.y === endPoint.y) {
			// No collisions if we don't move.
			return {
				endPosition: endPoint,
				intersections: [],
				exitAngle: angleBetween(startPoint, endPoint),
			};
		}

		const [topIntersect] = this.checkIntersect({
			startPoint,
			endPoint,
			threshold: (r: Block) => r.y - r.collisionBuffer,
			axis: (p: Position) => p.y,
			counterAxis: (p: Position) => p.x,
			min: (r: Block) => r.x - r.collisionBuffer,
			max: (r: Block) => r.x + r.width + r.collisionBuffer,
			toPoint: ({ threshold, counter }) => ({ y: threshold, x: counter }),
			side: Side.TOP,
		});

		const [leftIntersect] = this.checkIntersect({
			startPoint,
			endPoint,
			threshold: (r: Block) => r.x - r.collisionBuffer,
			axis: (p: Position) => p.x,
			counterAxis: (p: Position) => p.y,
			min: (r: Block) => r.y - r.collisionBuffer,
			max: (r: Block) => r.y + r.height + r.collisionBuffer,
			toPoint: ({ threshold, counter }) => ({ y: counter, x: threshold }),
			side: Side.LEFT,
		});

		const [rightIntersect] = this.checkIntersect({
			startPoint,
			endPoint,
			threshold: (r: Block) => r.x + r.width + r.collisionBuffer,
			axis: (p: Position) => p.x,
			counterAxis: (p: Position) => p.y,
			min: (r: Block) => r.y - r.collisionBuffer,
			max: (r: Block) => r.y + r.height + r.collisionBuffer,
			toPoint: ({ threshold, counter }) => ({ y: counter, x: threshold }),
			side: Side.TOP,
		});

		const [bottomIntersect] = this.checkIntersect({
			startPoint,
			endPoint,
			threshold: (r: Block) => r.y + r.height + r.collisionBuffer,
			axis: (p: Position) => p.y,
			counterAxis: (p: Position) => p.x,
			min: (r: Block) => r.x - r.collisionBuffer,
			max: (r: Block) => r.x + r.width + r.collisionBuffer,
			toPoint: ({ threshold, counter }) => ({ y: threshold, x: counter }),
			side: Side.BOTTOM,
		});

		const boundsIntersect = this.computeBoundsIntersect(startPoint, endPoint);

		const closestIntersect = [topIntersect, leftIntersect, rightIntersect, bottomIntersect, boundsIntersect]
			.filter((inter: Intersect | undefined): inter is Intersect => !!inter)
			.sort((a, b) => a.progress - b.progress)[0];

		if (closestIntersect) {
			//recurse

			const exitAngle = angleBetween(closestIntersect.intersectPoint, closestIntersect.endPosition);

			return {
				endPosition: closestIntersect.endPosition,
				intersections: [
					{
						block: closestIntersect.block,
						side: closestIntersect.side,
					},
				],
				exitAngle,
			};
		}

		return {
			endPosition: endPoint,
			intersections: [],
			exitAngle: angleBetween(startPoint, endPoint),
		};
	}

	private checkIntersect({
		startPoint,
		endPoint,
		threshold,
		axis,
		counterAxis,
		min,
		max,
		toPoint,
		side,
	}: {
		startPoint: Position;
		endPoint: Position;
		threshold: (r: Block) => number;
		axis: (p: Position) => number;
		counterAxis: (p: Position) => number;
		min: (r: Block) => number;
		max: (r: Block) => number;
		toPoint: (opts: { threshold: number; counter: number }) => Position;
		side: Side;
	}): Intersect[] {
		// Find nearest intersection.
		return (
			this.rects
				// Ignore destroyed:
				.filter((r) => !r.destroyed)
				// Do we span the threshold?
				.filter((r) => isBetween(threshold(r), axis(startPoint), axis(endPoint)))
				// determine progress (0 to 1) where the intersect may occur
				.map((block) => ({
					block,
					progress:
						axis(endPoint) === axis(startPoint)
							? // Co-linear:
							  Math.min(
									Math.abs(
										(min(block) - counterAxis(startPoint)) /
											(counterAxis(endPoint) - counterAxis(startPoint)),
									),
									Math.abs(
										(max(block) - counterAxis(startPoint)) /
											(counterAxis(endPoint) - counterAxis(startPoint)),
									),
							  )
							: // Orthogonal:
							  (threshold(block) - axis(startPoint)) / (axis(endPoint) - axis(startPoint)),
				}))
				// Confirm it's an intersection.
				.filter(({ block, progress }) =>
					isBetween(
						counterAxis(startPoint) + progress * (counterAxis(endPoint) - counterAxis(startPoint)),
						min(block),
						max(block),
					),
				)
				// find the exact coordinates where the intersect occurred.
				.map(({ block, progress }) => ({
					block,
					progress,
					side,
					intersectPoint: {
						...toPoint({
							counter:
								counterAxis(startPoint) + progress * (counterAxis(endPoint) - counterAxis(startPoint)),
							threshold: threshold(block),
						}),
					},
				}))
				// Find closest intersection:
				.reduce<Array<Omit<Intersect, 'endPosition'>>>(
					([a], b) => (b.progress < (a?.progress ?? Infinity) ? [b] : [a]),
					[],
				)
				// Use the intersection to adjust end position.
				.map((intersect) => ({
					...intersect,
					endPosition: toPoint({
						threshold: axis(endPoint) - 2 * (1 - intersect.progress) * (axis(endPoint) - axis(startPoint)),
						counter: counterAxis(endPoint),
					}),
				}))
		);
	}

	private computeBoundsIntersect(startPoint: Position, endPoint: Position): Intersect | undefined {
		return [
			endPoint.x < this.bounds.x
				? {
						block: this.bounds,
						progress: (this.bounds.x - startPoint.x) / (endPoint.x - startPoint.x),
						endPosition: {
							x: this.bounds.x + (this.bounds.x - endPoint.x),
							y: endPoint.y,
						},
						side: Side.LEFT,
				  }
				: undefined,
			endPoint.x > this.bounds.x + this.bounds.width
				? {
						block: this.bounds,
						progress: (this.bounds.x + this.bounds.width - startPoint.x) / (endPoint.x - startPoint.x),
						endPosition: {
							x: this.bounds.x + this.bounds.width - (endPoint.x - (this.bounds.x + this.bounds.width)),
							y: endPoint.y,
						},
						side: Side.RIGHT,
				  }
				: undefined,
			endPoint.y < this.bounds.y
				? {
						block: this.bounds,
						progress: (this.bounds.y - startPoint.y) / (endPoint.y - startPoint.y),
						endPosition: {
							y: this.bounds.y + (this.bounds.y - endPoint.y),
							x: endPoint.x,
						},
						side: Side.TOP,
				  }
				: undefined,
			endPoint.y > this.bounds.y + this.bounds.height
				? {
						block: this.bounds,
						progress: (this.bounds.y + this.bounds.height - startPoint.y) / (endPoint.y - startPoint.y),
						endPosition: {
							y: this.bounds.y + this.bounds.height - (endPoint.y - (this.bounds.y + this.bounds.height)),
							x: endPoint.x,
						},
						side: Side.BOTTOM,
				  }
				: undefined,
		]
			.map(
				(partial: Omit<Intersect, 'intersectPoint'> | undefined) =>
					partial && {
						...partial,
						intersectPoint: {
							x: partial.progress * (endPoint.x - startPoint.x) + startPoint.x,
							y: partial.progress * (endPoint.y - startPoint.y) + startPoint.y,
						},
					},
			)
			.filter((result: Intersect | undefined): result is Intersect => !!result)
			.sort((a, b) => a.progress - b.progress)[0];
	}
}
