import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

export function usePIXICanvas(width: number, height: number, raf: (ts?: number) => void) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rafRef = useRef((ts?: number) => {});
	const appRef = useRef<PIXI.Application>();

	const [_, setLoadedState] = useState(false);

	useEffect(() => {
		rafRef.current = raf;
	});

	useLayoutEffect(() => {
		if (!canvasRef.current) return;

		const app = new PIXI.Application({
			view: canvasRef.current,
			width,
			height,
		});

		appRef.current = app;

		app.ticker.add((time) => {
			rafRef.current(time);
		});

		return () => {
			app.destroy(true, true);
		};
	}, [canvasRef, width, height]);

	const refCallback = (ref: HTMLCanvasElement) => {
		(canvasRef as React.MutableRefObject<HTMLCanvasElement>).current = ref;
		setLoadedState(!!ref);
	};

	return [appRef.current, refCallback as unknown as React.RefObject<HTMLCanvasElement>] as [
		PIXI.Application,
		React.RefObject<HTMLCanvasElement>,
	];
}
