import { ShopItem } from '../shopItems';
import sword from '../assets/items/sword.png';

export const DQItems: Record<string, ShopItem> = {
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
