import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

export function usePIXICanvas(width: number, height: number, raf: (ts?: number) => void) {
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
		});

		appRef.current = app;

		app.ticker.add((time) => {
			rafRef.current(time);
		});

		return () => {
			app.destroy(false, true);
		};
	}, [canvasRef, width, height]);

	return [appRef, canvasRef] as [
		React.MutableRefObject<PIXI.Application | undefined>,
		React.RefObject<HTMLCanvasElement>,
	];
}
