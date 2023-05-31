import { useEffect, useMemo } from 'react';
import { Breakout, BreakoutState } from './game/breakout';
import { Bounds, Paddle } from './game/model';

const rep = nodecg.Replicant<BreakoutState | null>('breakout-game', {
	defaultValue: null,
	persistent: true,
});

export function useBreakout(bounds: Bounds, paddle: Paddle) {
	const breakout = useMemo(() => {
		if (rep.value) {
			return Breakout.deserialize(rep.value);
		}
		return new Breakout(bounds, paddle, []);
	}, []);

	useEffect(() => {
		if (!breakout) return;

		const saveInterval = setInterval(() => {
			rep.value = breakout.serialize();
		}, 1000);

		breakout.start();

		return () => {
			rep.value = breakout.serialize();
			breakout.stop();
			clearInterval(saveInterval);
		};
	}, [breakout]);

	return breakout;
}
