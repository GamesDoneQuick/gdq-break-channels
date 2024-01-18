type Palette = {
	sky: number;
	horizonSky: number;
	ground: number;
	horizonGround: number;
	road: number;
	meridian: number;
};

export const Palettes = {
	day: {
		sky: 0x44cccc,
		horizonSky: 0x88eecc,
		ground: 0xcc8822,
		horizonGround: 0xccaa88,
		road: 0x666666,
		meridian: 0xeecc44,
	} satisfies Palette,

	dusk: {
		sky: 0xcc88aa,
		horizonSky: 0xeeaacc,
		ground: 0xcc8866,
		horizonGround: 0xeeaa66,
		road: 0x444444,
		meridian: 0xeecc44,
	} satisfies Palette,

	night: {
		sky: 0x000000,
		horizonSky: 0x000000,
		ground: 0x000000,
		horizonGround: 0x000000,
		road: 0x000000,
		meridian: 0xeeee00,
	} satisfies Palette,

	dawn: {
		sky: 0x222266,
		horizonSky: 0x442266,
		ground: 0x664444,
		horizonGround: 0xaa6644,
		road: 0x000000,
		meridian: 0xccaa44,
	} satisfies Palette,
};
