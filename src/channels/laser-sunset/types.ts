import type { FormattedDonation } from '@gdq/types/tracker';

export type RGB = { r: number; g: number; b: number };

export type StarVisual = { left: number; top: number; text: string; color: RGB; opacity: number };

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

export type Static = {
	spawnDate: Date;
	maxAge: number;
	height: number;
};
