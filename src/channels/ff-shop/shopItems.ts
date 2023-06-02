import type { FormattedDonation } from '@gdq/types/tracker';

import { FFItemList } from './items/ffItems';
import { DQItemList } from './items/dqItems';
import { KHItemList } from './items/khItems';
import { NierItemList } from './items/nierItems';
import { GDQItemList } from './items/gdqItems';

const MINIMUM_AMOUNT_FOR_BIG_DONATIONS = 150;

export interface ShopItem {
	id: string;
	name?: string;
	description?: string;
	series?: string;
	sprite?: string;
	donationTypeRequired?: string;
	donationAmount?: number;
	component?: React.FC;
}

export function getRandomItem(): ShopItem {
	const values = allItems();

	return values[Math.floor(Math.random() * values.length)];
}

export function getItemFromDonation(donation: FormattedDonation): ShopItem {
	const values = allItems();
	let donationType = 'small';
	if (donation.rawAmount > MINIMUM_AMOUNT_FOR_BIG_DONATIONS) {
		donationType = 'big';
	}
	const filteredValues = values.filter((item) => item.donationTypeRequired == donationType);
	const newItem = filteredValues[Math.floor(Math.random() * filteredValues.length)];

	// Manually create copy to avoid changing other items
	return {
		id: `${newItem.id}-${donation.amount}`,
		name: newItem.name,
		description: newItem.description,
		series: newItem.series,
		sprite: newItem.sprite,
		donationTypeRequired: newItem.donationTypeRequired,
		donationAmount: donation.rawAmount,
	};
}

export function getRandomItems(amount: number): Array<ShopItem> {
	const values = allItems();
	const randomItems = new Array<ShopItem>();

	for (let index = 0; index < amount; index++) {
		const newValue = values[Math.floor(Math.random() * values.length)];
		randomItems.push(newValue);
	}

	return randomItems;
}

export function allItems(): Array<ShopItem> {
	const ffCopy = [...FFItemList];
	return ffCopy.concat(DQItemList, KHItemList, NierItemList, GDQItemList);
}
