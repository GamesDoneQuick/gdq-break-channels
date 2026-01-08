export function clamp01(n: number) {
	return Math.max(0, Math.min(1, n));
}

export function easeOutCubic(t: number) {
	return 1 - Math.pow(1 - t, 3);
}

export function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}
