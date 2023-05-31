import { ShopItem } from '../shopItems';
import item from '../assets/items/item.png';
import materiaAbility from '../assets/items/materia-ability.png';
import materiaSpell from '../assets/items/materia-spell.png';
import materiaStatus from '../assets/items/materia-status.png';
import materiaCommand from '../assets/items/materia-command.png';

export const GDQItems: Record<string, ShopItem> = {
	personalBest: {
		id: 'personalBest',
		name: 'Personal Best',
		description: 'A new personal record! Congratulate yourself, then get back to work on achieving another.',
		series: 'gdq',
		donationTypeRequired: 'small',
		sprite: item,
	},
	worldRecord: {
		id: 'worldRecord',
		name: 'World Record',
		description: `Congrats! You're the fastest of them all! You should apply for the next GDQ!`,
		series: 'gdq',
		donationTypeRequired: 'big',
		sprite: item,
	},
	wrongWarp: {
		id: 'wrongWarp',
		name: 'Wrong Warp',
		description: `I...don't know how you got here. Impressive!`,
		series: 'gdq',
		donationTypeRequired: 'small',
		sprite: materiaAbility,
	},
	framePerfectTrick: {
		id: 'framePerfectTrick',
		name: 'Frame Perfect Trick',
		description: `Achievable with masterful precision or incredible luck. Either way, we're happy!`,
		series: 'gdq',
		donationTypeRequired: 'small',
		sprite: materiaSpell,
	},
	softLock: {
		id: 'softLock',
		name: 'Soft Lock',
		description: `Uh oh, everythings' broken! Don't worry, just laugh it off and keep trying.`,
		series: 'gdq',
		donationTypeRequired: 'small',
		sprite: materiaStatus,
	},
	noclipMode: {
		id: 'noclipMode',
		name: 'Noclip Mode',
		description: `You can walk through anything! Like some sort of time trial ghost!`,
		series: 'gdq',
		donationTypeRequired: 'big',
		sprite: materiaCommand,
	},
};

export const GDQItemList = Object.values(GDQItems);
