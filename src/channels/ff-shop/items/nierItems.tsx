import { ShopItem } from '../shopItems';
import armor from '../assets/items/armor.png';
import sword from '../assets/items/sword.png';
import spear from '../assets/items/spear.png';
import item from '../assets/items/item.png';

export const NierItems: Record<string, ShopItem> = {
	virtuousContract: {
		id: 'virtuousContract',
		name: 'Virtuous Contract',
		description: 'This resplendent blade is bright enough that its users wear a blindfold to shade their eyes.',
		series: 'nier',
		donationTypeRequired: 'small',
		sprite: sword,
	},
	machineSpear: {
		id: 'machineSpear',
		name: 'Machine Spear',
		description:
			'A sturdy, quaint spear built from android parts. It was found in a town full of sentient machines.',
		series: 'nier',
		donationTypeRequired: 'small',
		sprite: spear,
	},
	mackerel: {
		id: 'mackerel',
		name: 'Mackerel',
		description: 'This fish is poisonous to androids. You caught this yourself? Great Job!',
		series: 'nier',
		donationTypeRequired: 'small',
		sprite: item,
	},
	letter: {
		id: 'letter',
		name: 'Letter',
		description: 'This letter is addressed to a lady living in a lighthouse nearby. Should you deliver it?',
		series: 'nier',
		donationTypeRequired: 'small',
		sprite: item,
	},
	memoryAlloy: {
		id: 'memoryAlloy',
		name: 'Memory Alloy',
		description: 'Rare robots can drop this even rarer metal. Use it to upgrade your weapons.',
		series: 'nier',
		donationTypeRequired: 'big',
		sprite: item,
	},
	osChip: {
		id: 'osChip',
		name: 'OS Chip',
		description: `A chip storing an android's operating system. PLEASE don't remove it.`,
		series: 'nier',
		donationTypeRequired: 'big',
		sprite: armor,
	},
	beastcurse: {
		id: 'beastcurse',
		name: 'Beastcurse',
		description: `This large spear was hidden away in an abandoned castle. It's emblazoned with a bestial motif.`,
		series: 'nier',
		donationTypeRequired: 'big',
		sprite: spear,
	},
};

export const NierItemList = Object.values(NierItems);
