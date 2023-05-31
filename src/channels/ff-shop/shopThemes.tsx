export interface ShopTheme {
	id: string;
	gradient: string;
	highlightColor: string;
}

export const AllThemes: Record<string, ShopTheme> = {
	finalFantasyVII: {
		id: 'finalFantasyVII',
		gradient: `linear-gradient(
			349deg,
			rgba(0, 1, 23, 1) 0%,
			rgba(10, 26, 105, 1) 13%,
			rgba(42, 70, 185, 1) 71%,
			rgba(41, 59, 224, 1) 88%,
			rgba(42, 61, 250, 1) 100%
		)`,
		highlightColor: '#51f4fc',
	},
	finalFantasyVIII: {
		id: 'finalFantasyVIII',
		gradient: `linear-gradient(90deg,
			rgba(40,40,40,1) 0%,
			rgba(66,66,66,1) 27%,
			rgba(159,162,163,1) 100%)`,
		highlightColor: `#ffff00`,
	},
	chronoTrigger: {
		id: 'chronoTrigger',
		gradient: `linear-gradient(
			0deg,
			rgba(0, 1, 23, 1) 0%,
			rgba(14, 25, 28, 1) 7%,
			rgba(36, 46, 48, 1) 34%,
			rgba(126, 132, 133, 1) 78%,
			rgba(159, 162, 163, 1) 100%
		)`,
		highlightColor: '#0fff67',
	},
	dragonQuest: {
		id: 'dragonQuest',
		gradient: `linear-gradient(
			0deg,
			rgba(0, 0, 0, 1) 0%,
			rgba(0, 0, 0, 1) 100%
		)`,
		highlightColor: '#fa1919',
	},
	finalFantasyIV: {
		id: 'finalFantasyIV',
		gradient: `linear-gradient(
			0deg,
			rgba(10, 26, 105, 1) 0%,
			rgba(10, 26, 105, 1) 100%
		)`,
		highlightColor: '#ffff00',
	},
};

export function getRandomTheme(): ShopTheme {
	const values = Object.values(AllThemes);

	return values[Math.floor(Math.random() * values.length)];
}
