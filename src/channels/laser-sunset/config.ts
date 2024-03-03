/**
 * @file Configuration values. Many of the settings are now balanced to look good enough and will
 * break if put to extremes. Handle with care.
 */

const CONFIG = {
	Donations: {
		despawnMs: 4000,
		countMax: 6,
		xMarginPercent: 15,
		yMinPercent: 12,
		yMaxPercent: 25,
		reflectionOpacity: 0.3,
		fadeAt: 0.2,
		hoverTimeMs: 1500,
		hoverOffset: 1,
		colors: ['mediumspringgreen', 'deepskyblue', 'cyan'],
	},
	Subscriptions: {
		despawnMs: 8000,
		fontSizeMin: 25,
		fontSizeMax: 60,
		lockTimeMs: 600,
		colors: ['Lavender', 'LightSkyBlue', 'Aquamarine', 'AliceBlue', 'HoneyDew'],
	},
	Stars: {
		countX: 10,
		countY: 7,
		brightnessMin: 120,
		brightnessMax: 240,
		opacityMin: 0.3,
		opacityMax: 1.0,
		twinkleMs: 600,
	},
	Lasers: {
		bgXstart: 67,
		bgXmin: -53,
		scrollSpeed: 0.5,
	},
	Cloud: {
		despawnMs: 5000,
		xMargin: 5,
		sizeMinPercent: 2,
		sizeMaxPercent: 12,
		sizeDonationMin: 5,
		sizeDonationMax: 1000,
		perspectiveGrowth: 2.4,
		colors: ['magenta', 'orchid', 'blueviolet', 'mediumpurple'],
	},
	Timers: {
		fpsInterval: 1000 / 60,
	},
};

export default CONFIG;
