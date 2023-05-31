import { ShopItem } from '../shopItems';
import sword from '../assets/items/sword.png';
import knuckle from '../assets/items/knuckle.png';
import item from '../assets/items/item.png';
import materiaSupport from '../assets/items/materia-support.png';
import materiaMagic from '../assets/items/materia-magic.png';

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
	leafBracer: {
		id: 'leafBracer',
		name: 'Leaf Bracer',
		description: 'This handy ability lets you cast Cure even while being attacked!',
		series: 'kingdomHearts',
		donationTypeRequired: 'small',
		sprite: materiaSupport,
	},
	curaga: {
		id: 'curaga',
		name: 'Curaga',
		description: `The highest level restoration spell. Let's hope your mage didn't auto-cast away his MP.`,
		series: 'kingdomHearts',
		donationTypeRequired: 'big',
		sprite: materiaMagic,
	},
	orichalcumPlus: {
		id: 'orichalcumPlus',
		name: 'Orichalcum+',
		description: `One of the rarest synthesis materials. Can be used to create powerful equipment.`,
		series: 'kingdomHearts',
		donationTypeRequired: 'big',
		sprite: item,
	},
	ultimaWeapon: {
		id: 'ultimaWeapon',
		name: 'Ultima Weapon',
		description: `A striking, elegant sword with a slight key shape to it. It's covered in bright spikes.`,
		series: 'kingdomHearts',
		donationTypeRequired: 'big',
		sprite: item,
	},
};

export const KHItemList = Object.values(KHItems);
