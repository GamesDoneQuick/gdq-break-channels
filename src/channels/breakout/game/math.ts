import { Block, Bounds, Position, Velocity } from './model';

export function sumVelocities(a: Velocity, b: Velocity, maxAmplitude = Infinity): Velocity {
	const posA = velocityToPosition(a);
	const posB = velocityToPosition(b);
	const sum = positionToVelocity({
		x: posA.x + posB.x,
		y: posA.y + posB.y,
	});
	sum.amplitude = Math.min(sum.amplitude, maxAmplitude);
	return sum;
}

// Takes a velocity and returns a Position representing that velocity in cartesian coordinates.
export function velocityToPosition(velocity: Velocity): Position {
	return {
		x: Math.cos(velocity.angle) * velocity.amplitude,
		y: Math.sin(velocity.angle) * velocity.amplitude,
	};
}

export function positionToVelocity(position: Position): Velocity {
	return {
		angle: angleBetween({ x: 0, y: 0 }, position),
		amplitude: Math.sqrt(position.x ** 2 + position.y ** 2),
	};
}

export function angleBetween(start: Position, end: Position): number {
	const quadrantModifier = end.x - start.x < 0 ? Math.PI : 0;

	return quadrantModifier + Math.atan((end.y - start.y) / (end.x - start.x));
}

// Finds if target is between boundA and boundB.
export function isBetween(target: number, boundsA: number, boundsB: number) {
	return (target > boundsA && target < boundsB) || (target > boundsB && target < boundsA);
}

export function containsPoint(bounds: Bounds, point: Position): boolean {
	return (
		point.x > bounds.x &&
		point.x < bounds.x + bounds.width &&
		point.y > bounds.y &&
		point.y < bounds.y + bounds.height
	);
}

export function collisionBox(block: Block): Bounds {
	return {
		x: block.x - block.collisionBuffer,
		y: block.y - block.collisionBuffer,
		width: block.width + 2 * block.collisionBuffer,
		height: block.height + 2 * block.collisionBuffer,
	};
}
