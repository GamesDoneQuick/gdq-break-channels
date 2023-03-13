import React from 'react';
import { SansUndertale } from './SansUndertale';
import { MettatonUndertale } from './MettatonUndertale';
import torielBase from './assets/enemies/toriel-base.png';
import papyrusBase from './assets/enemies/papyrus-base.png';
import undyneBase from './assets/enemies/undyne-base.png';

export interface UndertaleDialogue {
	speechBubble?: string[];
	textBox?: string[];
}

export interface UndertaleEnemy {
	id: string;
	baseSprite?: string;
	component?: React.FC;
	font?: string;
	idle?: UndertaleDialogue[];
	donation?: UndertaleDialogue[];
	subscribe?: UndertaleDialogue[];
}

export const UndertaleEnemies: Record<string, UndertaleEnemy> = {
	toriel: {
		id: 'toriel',
		baseSprite: torielBase,
		idle: [
			// { textBox: ['TORIEL - ATK 80 DEF 80', 'Knows best for you.'] },
			{ textBox: ['Toriel looks through you.'] },
			{ speechBubble: ['I promise I will show you<br>good runs here.'] },
			{ textBox: ["You couldn't think of any conversation topics."] },
			{ textBox: ['Toriel takes a deep breath.'] },
			{ textBox: ['You thought about telling Toriel<br>that you saw her donate.'] },
			{ textBox: ['Ironically, talking does not seem to be the solution to this situation.'] },
			{ textBox: ['Toriel blocks the way!'] },
			{ speechBubble: ['Come on, you can do it!'] },
			{ speechBubble: ['Do you need some ideas<br>for donation comments?'] },
		],
		donation: [{ textBox: ['(TORIEL sent you a message titled<br>"$1 in Donations.")'] }],
	},
	papyrus: {
		id: 'papyrus',
		baseSprite: papyrusBase,
		font: 'PapyrusUndertale',
		idle: [
			{ textBox: ['Papyrus is trying hard to play it<br>cool.'] },
			{ textBox: ['Papyrus whispers "Nyeh heh heh!"'] },
			{ textBox: ['Papyrus is rattling his bones.'] },
			{ textBox: ['Papyrus is considering his<br>options.'] },
			{ textBox: ['Papyrus blocks the way!'] },
			{ textBox: ['Papyrus prepares a non-bone run<br>then spends a minute fixing his<br>mistake.'] },
			{ speechBubble: ['I CAN ALMOST<br>TASTE MY FUTURE<br>POPULARITY!!!'] },
			{ speechBubble: [`"SIGH" HERE'S AN<br> ABSOLUTELY<br> NORMAL SPEEDRUN.`] },
		],
		// donation: [{ speechBubble: ['WHAT!? DONATING!? YOU FINALLY<br>REVEAL YOUR<br>ULTIMATE FEELINGS!'] }],
	},
	sans: {
		id: 'sans',
		component: SansUndertale,
		font: 'ComicSansUndertale',
		idle: [
			// { textBox: ['SANS 1 ATK 1 DEF', 'The easiest enemy.'] },
			{ textBox: ["You feel like you're going to<br>have a good run."] },
			{ speechBubble: ["guess i'm pretty good<br>at my job, huh?"] },
			{ textBox: ["Reading this doesn't seem like<br>the best use of your time."] },
			{ textBox: ['Sans is preparing something.'], speechBubble: ["it's my submission vod."] },
			{ speechBubble: ["i'm thinking about<br>getting into the<br>speedrun business."] },
			{ speechBubble: ['geeettttttt dunked on!!!'] },
			{ speechBubble: ["you're, uh, very<br>determined, aren't<br>you?"] },
		],
		donation: [
			{ speechBubble: ["that's the expression<br>of a community who's<br>donated $1."] },
			// { textBox: ['DONATIONS coursing through your<br>veins!'] },
			{ speechBubble: ['our reports showed <br>$1 in donations in<br>the timespace<br>continuum.'] },
		],
	},
	undyne: {
		id: 'undyne',
		baseSprite: undyneBase,
		idle: [
			{ speechBubble: ["Everyone's been waiting their whole lives for this moment!"] },
			{ speechBubble: ["For everyone's hopes!<br>For everyone's PBs!"] },
			{ speechBubble: ['En garde!'] },
			{ textBox: ['Undyne flips her spear<br>impatiently.'] },
			{ textBox: ['Undyne points heroically towards the<br>sky.'] },
			{ textBox: ['Undyne does a frame perfect<br>trick, just because she can.'] },
			{ speechBubble: ['Not bad! Then how about<br>THIS!?'] },
		],
		donation: [],
	},
	mettaton: {
		id: 'mettaton',
		component: MettatonUndertale,
		idle: [
			{ textBox: ["Mettaton is saving your run's VOD for future use."] },
			{ textBox: ['Mettaton EX makes his premiere!'] },
			{
				textBox: [
					"You say you aren't going to lose<br>time at ALL. Ratings gradually<br>increase during Mettaton's turn.",
				],
			},
			{ textBox: ["Mettaton poses dramatically. The<br>audience (that's you!) nods."] },
			{ textBox: ['Despite being five frames slower, you posed dramatically. The<br>audience applauds.'] },
			{ speechBubble: ['Lights! Camera! Action!'] },
			{ speechBubble: ['Drama! Romance!<br>Bloodshed!'] },
			{ speechBubble: ["OOH, LOOK AT THESE<br>RATINGS!!! THIS IS THE<br>MOST VIEWERS I'VE EVER<br>HAD!!!"] },
		],
		donation: [{ speechBubble: ['$1 in donations!<br>Can you keep up the<br>pace!?'] }],
	},
	// test: {
	// 	id: 'mettaton',
	// 	font: 'ComicSansUndertale',
	// 	component: MettatonUndertale,
	// 	idle: [
	// 	],
	// 	donation: [
	// 		{ textBox: ['()'] },
	// 	],
	// },
};

export const GenericDonationMessages: UndertaleDialogue[] = [
	// { textBox: ['A $1 donation drew near!']},
	{ textBox: ['(The thought of $1 in<br>donations fills you with<br>determination.)'] },
	// { textBox: ['(Knowing someone gave $1...', 'it fills you with determination.)'] },
	{ textBox: ['(Knowing the host has $1<br>more in donations to read...', 'it fills you with determination.)'] },
	{ textBox: ['($1 in donations for<br>Doctors Without Borders...', 'it fills you with determination.)'] },
	{ textBox: ['(The thought of personal bests<br>and $1 in donations fills you<br>with determination.)'] },
	{ textBox: ['(You see $1 in donations.', 'It fills you with determination.)'] },
	// { textBox: ['(Partaking in speedruns fills you with determination.)'] },
	{ textBox: ['(Some folks donating $1 for<br>a great cause fills you with<br>determination.)'] },
];

export function getRandomEnemy(): UndertaleEnemy {
	if (UndertaleEnemies.test) return UndertaleEnemies.test;

	const values = Object.values(UndertaleEnemies);

	return values[Math.floor(Math.random() * values.length)];
}
