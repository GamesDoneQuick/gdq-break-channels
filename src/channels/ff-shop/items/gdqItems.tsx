import { ShopItem } from '../shopItems';
import item from '../assets/items/item.png';
import materiaMagic from '../assets/items/materia-magic.png';
import materiaIndependent from '../assets/items/materia-independent.png';
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
		sprite: materiaCommand,
	},
	framePerfectTrick: {
		id: 'framePerfectTrick',
		name: 'Frame Perfect Trick',
		description: `Achievable with masterful precision or incredible luck. Either way, we're happy!`,
		series: 'gdq',
		donationTypeRequired: 'small',
		sprite: materiaMagic,
	},
	softLock: {
		id: 'softLock',
		name: 'Soft Lock',
		description: `Uh oh, everythings' broken! Don't worry, just laugh it off and keep trying.`,
		series: 'gdq',
		donationTypeRequired: 'small',
		sprite: materiaIndependent,
	},
	noclipMode: {
		id: 'noclipMode',
		name: 'Noclip Mode',
		description: `You can walk through anything! Like some sort of time trial ghost!`,
		series: 'gdq',
		donationTypeRequired: 'big',
		sprite: materiaCommand,
	},
	saveTheAnimals: {
		id: 'saveTheAnimals',
		name: 'Save the Animals',
		description: `Who cares about frames when furry pals are involved? Those cuties are worth the cost.`,
		series: 'gdq',
		donationTypeRequired: 'big',
		sprite: materiaMagic,
	},
	killTheAnimals: {
		id: 'killTheAnimals',
		name: 'Kill the Animals',
		description: `Who cares how monstrous this is? A good run is worth any and every cost.`,
		series: 'gdq',
		donationTypeRequired: 'big',
		sprite: materiaMagic,
	},
};

export const GDQItemList = Object.values(GDQItems);
