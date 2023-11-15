import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

PIXI.Ticker.shared.maxFPS = 60;

export function usePIXICanvas(
	{ width, height, transparent }: { width: number; height: number; transparent?: boolean } = {
		width: 1092,
		height: 332,
		transparent: false,
	},
	raf: (ts?: number) => void,
) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rafRef = useRef((_ts?: number) => {});
	const appRef = useRef<PIXI.Application>();

	useEffect(() => {
		rafRef.current = raf;
	});

	useEffect(() => {
		if (!canvasRef.current) return;

		const app = new PIXI.Application({
			view: canvasRef.current,
			width,
			height,
			backgroundAlpha: transparent ? 0 : undefined,
		});

		appRef.current = app;

		app.ticker.add((time) => {
			rafRef.current(time);
		});

		app.ticker.maxFPS = 60;

		return () => {
			app.destroy(false, true);
		};
	}, [canvasRef, width, height]);

	return [appRef, canvasRef] as [
		React.MutableRefObject<PIXI.Application | undefined>,
		React.RefObject<HTMLCanvasElement>,
	];
}
