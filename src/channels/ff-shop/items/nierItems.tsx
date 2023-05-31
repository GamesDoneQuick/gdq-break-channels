import { ShopItem } from '../shopItems';
import sword from '../assets/items/sword.png';

export const NierItems: Record<string, ShopItem> = {
	virtuousContract: {
		id: 'virtuousContract',
		name: 'Virtuous Contract',
		description: 'How long can I fight amidst this bloody vortex of a battlefield? How long, I wonder?',
		series: 'nier',
		donationTypeRequired: 'small',
		sprite: sword,
	},
};

export const NierItemList = Object.values(NierItems);
