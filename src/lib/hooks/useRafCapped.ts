import { useCallback, useRef } from 'react';
import { useRafLoop } from 'react-use';
import { RafLoopReturns } from 'react-use/lib/useRafLoop';

const timeBetweenFrames = 1000 / 60;
const acceptableDelta = 3;

export function useRafCapped(callback: FrameRequestCallback, initiallyActive?: boolean): RafLoopReturns {
	const raf = useRef(callback);
	raf.current = callback;

	const lastRafTime = useRef(performance.now());

	const loopCallback = useCallback(
		((time) => {
			const now = performance.now();
			if (now - lastRafTime.current > timeBetweenFrames - acceptableDelta) {
				lastRafTime.current = now;
				raf.current?.(time);
			}
		}) as FrameRequestCallback,
		[],
	);

	const loop = useRafLoop(loopCallback, initiallyActive);

	return loop;
}
