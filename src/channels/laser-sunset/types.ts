import type { FormattedDonation } from '@gdq/types/tracker';

export type StarVisual = { left: number; top: number; text: string; color: string; opacity: number };

export type SunReflectionLine = { xPosition: number; marginTop: number; width: number };

export type Overcast = {
	left: number;
	width: number;
	height: number;
	backgroundColor: string;
	received: Date;
};

export type DonationPopup = FormattedDonation & {
	renderedAmount: string;
	left: number;
	top: number;
	color: string;
	received: Date;
};

export type SubscriptionVisual = {
	angle: number;
	radius: number;
	color: string;
	received: Date;
};
