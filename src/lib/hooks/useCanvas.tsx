import React, { useEffect, useRef } from 'react';

export function useCanvas(width: number, height: number, raf: (ts?: number) => void) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rafRef = useRef((_ts?: number) => {});

	useEffect(() => {
		rafRef.current = raf;
	});

	useEffect(() => {
		if (!canvasRef.current) return;

		const loop = {
			func: ((ts: number) => {
				if (!loop.func) return;
				rafRef.current(ts);
				requestAnimationFrame(loop.func);
			}) as ((ts: number) => void) | undefined,
		};

		requestAnimationFrame(loop.func!);

		return () => {
			loop.func = undefined;
		};
	}, [canvasRef, width, height]);

	return canvasRef;
}
