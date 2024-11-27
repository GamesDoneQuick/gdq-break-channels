import { ShopItem } from '../shopItems';
import armor from '../assets/items/armor.png';
import sword from '../assets/items/sword.png';
import knuckle from '../assets/items/knuckle.png';
import item from '../assets/items/item.png';
import materiaMagic from '../assets/items/materia-magic.png';

export const DQItems: Record<string, ShopItem> = {
	frizz: {
		id: 'frizz',
		name: 'Frizz',
		description: 'A basic spell that launches a small, fizzling fireball towards the enemy.',
		series: 'dragonQuest',
		donationTypeRequired: 'small',
		sprite: materiaMagic,
	},
	thwack: {
		id: 'thwack',
		name: 'Thwack',
		description: 'A dark spell that can instantly KO the enemy. Seems like an unfair move in a large arsenal.',
		series: 'dragonQuest',
		donationTypeRequired: 'small',
		sprite: materiaMagic,
	},
	yggdrasilLeaf: {
		id: 'yggdrasilLeaf',
		name: 'Yggdrasil Leaf',
		description: 'A leaf taken from the World Tree. It can revive a fallen ally.',
		series: 'dragonQuest',
		donationTypeRequired: 'small',
		sprite: item,
	},
	holyWater: {
		id: 'holyWater',
		name: 'Holy Water',
		description: 'Blessed water that can be used to avoid enemy encounters for a wee while.',
		series: 'dragonQuest',
		donationTypeRequired: 'small',
		sprite: item,
	},
	chimaeraWing: {
		id: 'chimaeraWing',
		name: 'Chimaera Wing',
		description: `Can be used to warp to towns you've visited. Notably dropped by--you guessed it--chimaeras.`,
		series: 'dragonQuest',
		donationTypeRequired: 'small',
		sprite: item,
	},
	ironClaws: {
		id: 'ironClaws',
		name: 'Iron Claws',
		description: `A set of claws used by martial artists. The knuckles are adorned with long, iron spikes.`,
		series: 'dragonQuest',
		donationTypeRequired: 'small',
		sprite: knuckle,
	},
	mardiGarb: {
		id: 'mardiGarb',
		name: 'Mardi Garb',
		description: `This extravagant outfit entices its wearers to constantly shake its stylish tail of feathers.`,
		series: 'dragonQuest',
		donationTypeRequired: 'big',
		sprite: armor,
	},
	supremeSwordOfLight: {
		id: 'supremeSwordOfLight',
		name: 'Supreme Sword of Light',
		description:
			'The ultimate symbol of hope for Erdrea. Its blessed blade can do away with any and all evil effects.',
		series: 'dragonQuest',
		donationTypeRequired: 'big',
		sprite: sword,
	},
	hypernovaSword: {
		id: 'hypernovaSword',
		name: 'Hypernova Sword',
		description: 'The ultimate bejeweled blade. It can lower the defence of any enemy struck.',
		series: 'dragonQuest',
		donationTypeRequired: 'big',
		sprite: sword,
	},
};

export const DQItemList = Object.values(DQItems);
