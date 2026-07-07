export function clamp01(n: number) {
	return Math.max(0, Math.min(1, n));
}

export function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}

export function easeOutCubic(t: number) {
	const u = 1 - t;
	return 1 - u * u * u;
}

export function clampInt(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, Math.floor(n)));
}
