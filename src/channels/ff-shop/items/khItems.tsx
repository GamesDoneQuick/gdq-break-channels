import { ShopItem } from '../shopItems';
import sword from '../assets/items/sword.png';
import knuckle from '../assets/items/knuckle.png';
import item from '../assets/items/item.png';

export const KHItems: Record<string, ShopItem> = {
	kingdomKey: {
		id: 'kingdomKey',
		name: 'Kingdom Key',
		description: 'A large key-shaped weapon, complete with a cute cartoon-themed keychain.',
		series: 'kingdomHearts',
		donationTypeRequired: 'small',
		sprite: sword,
	},
	oathkeeper: {
		id: 'oathkeeper',
		name: 'Oathkeeper',
		description: 'A radiant key-shaped weapon. It represents an everlasting bond.',
		series: 'kingdomHearts',
		donationTypeRequired: 'small',
		sprite: sword,
	},
	oblivion: {
		id: 'oblivion',
		name: 'Oblivion',
		description: 'A tragic key-shaped weapon. It feels like the forgotten half of a larger whole.',
		series: 'kingdomHearts',
		donationTypeRequired: 'small',
		sprite: sword,
	},
	eternalFlames: {
		id: 'eternalFlames',
		name: 'Eternal Flames',
		description:
			'These spiky, circular weapons evoke both burning passion and a laid-back attitude. Got it memorized?',
		series: 'kingdomHearts',
		donationTypeRequired: 'small',
		sprite: knuckle,
	},
	paopuFruit: {
		id: 'paopuFruit',
		name: 'Paopu Fruit',
		description: 'When two people share this star-shaped fruit, their destinies become intertwined.',
		series: 'kingdomHearts',
		donationTypeRequired: 'small',
		sprite: item,
	},
};

export const KHItemList = Object.values(KHItems);
