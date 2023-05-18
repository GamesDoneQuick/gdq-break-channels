import { useRef, useState } from 'react';
import { useRafLoop } from 'react-use';

const WANDER_CLAMP = 1;
const WANDER_MIN_DELAY_MS = 200;
const WANDER_CHANCE = 0.05;

const ROTATE_DELAY_MS = 100;

export function useWanderingBodyPart(): number {
	const [offset, setOffset] = useState(0);
	const lastWanderMs = useRef(Date.now());

	useRafLoop(() => {
		const now = Date.now();
		const timeSinceLastWander = now - lastWanderMs.current;

		// console.log(timeSinceLastWander, offset);

		if (timeSinceLastWander >= WANDER_MIN_DELAY_MS && Math.random() < WANDER_CHANCE) {
			if (offset >= WANDER_CLAMP) {
				setOffset(offset - 1);
			} else if (offset <= -WANDER_CLAMP) {
				setOffset(offset + 1);
			} else {
				setOffset(offset + (Math.random() > 0.25 ? 1 : -1));
			}

			lastWanderMs.current = now;
		}
	});

	return offset;
}
export function useRotatingBodyPart(offsets: [number, number][]): [number, number] {
	const [offset, setOffset] = useState<[number, number]>([0, 0]);
	const stepPosition = useRef(0);
	const lastWanderMs = useRef(Date.now());

	useRafLoop(() => {
		const now = Date.now();
		const timeSinceLastWander = now - lastWanderMs.current;

		if (timeSinceLastWander >= ROTATE_DELAY_MS) {
			const nextPosition = (stepPosition.current + 1) % offsets.length;

			setOffset(offsets[nextPosition]);

			stepPosition.current = nextPosition;

			lastWanderMs.current = now;
		}
	});

	return offset;
}
