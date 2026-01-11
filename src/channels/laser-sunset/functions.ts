import type { FormattedDonation, TwitchSubscription } from '@gdq/types/tracker';
import { StarVisual, Overcast, DonationPopup, SubscriptionVisual, Static } from './types';
import CONFIG from './config';

export const formatCurrency = (val: number) => {
	return val.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	});
};

export const easeIn = (number: number, total: number, scaleMin = 1.0, scaleMax = 1.0) => {
	return scaleMin + (number / total) * (scaleMax - scaleMin);
};

export const easeOut = (number: number, total: number, scaleMin = 1.0, scaleMax = 1.0) => {
	return scaleMin + (scaleMax - scaleMin) * easeIn(number, total, 0.0, 1.0);
};

export const randomRange = (min: number, max: number) => {
	return min + Math.random() * (max - min);
};

export const staticOpacity = (yPosition: number) => {
	return Math.max(0.1, Math.abs(yPosition - 50.0) / 100.0);
};

export const randomStarOpacity = () => {
	return randomRange(CONFIG.Stars.opacityMin, CONFIG.Stars.opacityMax);
};

export const spawnStar = (number: number, xMin: number, xMax: number, yMin: number, yMax: number): StarVisual => {
	const clr = randomRange(CONFIG.Stars.brightnessMin, CONFIG.Stars.brightnessMax);
	const opacity = randomStarOpacity();

	return {
		left: randomRange(xMin, xMax),
		top: randomRange(yMin, yMax),
		text: number % 2 == 0 ? '+' : '*',
		color: { r: clr, g: clr, b: clr },
		opacity: opacity,
	};
};

export const starStyle = (star: StarVisual, highlight: boolean) => {
	return {
		left: star.left + '%',
		top: star.top + '%',
		color: 'RGB(' + (highlight ? '0' : star.color.r) + ',' + star.color.g + ',' + star.color.b + ')',
		opacity: star.opacity,
	};
};

export const spawnDonation = (baseProps: FormattedDonation, count: number): DonationPopup => {
	const range = 100 - CONFIG.Donations.xMarginPercent;
	const left =
		CONFIG.Donations.xMarginPercent + ((count % CONFIG.Donations.countMax) / CONFIG.Donations.countMax) * range;

	return {
		...baseProps,
		renderedAmount: formatCurrency(baseProps.rawAmount),
		left: left,
		top: randomRange(CONFIG.Donations.yMinPercent, CONFIG.Donations.yMaxPercent),
		color: CONFIG.Donations.colors[count % CONFIG.Donations.colors.length],
		received: new Date(),
	};
};

export const spawnCloud = (donationAmount: number, count: number): Overcast => {
	const clamped = Math.min(Math.max(donationAmount, CONFIG.Cloud.sizeDonationMin), CONFIG.Cloud.sizeDonationMax);
	const amountRatio = (clamped - CONFIG.Cloud.sizeDonationMin) / CONFIG.Cloud.sizeDonationMax;
	const sizeMin = CONFIG.Cloud.sizeMinPercent;
	const sizeMax = CONFIG.Cloud.sizeMaxPercent;
	const sideLength = sizeMin + amountRatio * (sizeMax - sizeMin);

	return {
		left: CONFIG.Cloud.xMargin + Math.random() * (100 - CONFIG.Cloud.xMargin * 2),
		width: sideLength,
		height: sideLength * 1.5,
		backgroundColor: CONFIG.Cloud.colors[count % CONFIG.Cloud.colors.length],
		received: new Date(),
	};
};

export const spawnStatic = (): Static => {
	return {
		spawnDate: new Date(),
		maxAge: CONFIG.Static.ageMin + Math.random() * (CONFIG.Static.ageMax - CONFIG.Static.ageMin),
		height:
			CONFIG.Static.heightMinPercent +
			Math.random() * (CONFIG.Static.heightMaxPercent - CONFIG.Static.heightMinPercent),
	};
};

export const cloudScreenspaceProps = (cloud: Overcast) => {
	const now = new Date();
	const timeVisible = Math.min(now.getTime() - cloud.received.getTime(), CONFIG.Cloud.despawnMs);
	const ageRatio = timeVisible / CONFIG.Cloud.despawnMs;
	const visibilityWindow = 100 + CONFIG.Cloud.sizeMaxPercent;
	const age = ageRatio * visibilityWindow;

	return {
		left: cloud.left,
		bottom: age,
		width: cloud.width + cloud.width * ageRatio * CONFIG.Cloud.perspectiveGrowth,
		height: cloud.height,
		backgroundColor: cloud.backgroundColor,
		now: now,
		age: age,
		rotate: age * 8,
	};
};

export const cloudStyle = (cloud: Overcast) => {
	const csp = cloudScreenspaceProps(cloud);

	return {
		left: csp.left + '%',
		bottom: csp.bottom + '%',
		width: csp.width + '%',
		height: csp.height + '%',
		backgroundColor: csp.backgroundColor,
		rotate: 'x -' + csp.rotate + 'deg',
	};
};

export const donationHovering = (age: number) => {
	const maxTime = CONFIG.Donations.hoverTimeMs;
	const relAge = age % maxTime;
	const offset = CONFIG.Donations.hoverOffset;
	return Math.cos((relAge / maxTime) * Math.PI * 2) * offset;
};

export const cloudReflectionStyle = (cloud: Overcast) => {
	const csp = cloudScreenspaceProps(cloud);

	return {
		left: csp.left + '%',
		top: csp.bottom + '%',
		width: csp.width + '%',
		height: csp.height + '%',
		backgroundColor: csp.backgroundColor,
		rotate: 'x ' + csp.rotate + 'deg',
	};
};

export const donationScreenspaceProps = (donation: DonationPopup) => {
	const now = new Date();
	const age = now.getTime() - donation.received.getTime();
	const progress = Math.min(1.0, age / CONFIG.Donations.despawnMs);
	const fadeAt = CONFIG.Donations.fadeAt;
	const fadeOutAt = 1.0 - fadeAt;

	let opacity = 1.0;
	if (progress < fadeAt) {
		opacity = progress / fadeAt;
	} else if (progress > fadeOutAt) {
		opacity = 1 - (progress - fadeOutAt) / fadeAt;
	}

	return {
		x: donation.left,
		y: donation.top + donationHovering(age),
		now: now,
		age: age,
		color: donation.color,
		opacity: opacity,
	};
};

export const donationStyle = (donation: DonationPopup) => {
	const dsp = donationScreenspaceProps(donation);
	return { left: dsp.x + '%', top: dsp.y + '%', color: dsp.color, opacity: dsp.opacity };
};

export const donationReflectionStyle = (donation: DonationPopup) => {
	const dsp = donationScreenspaceProps(donation);
	const pushDown = 10;

	return {
		...donation,
		left: dsp.x + '%',
		top: 50 - dsp.y + pushDown + '%',
		opacity: dsp.opacity * CONFIG.Donations.reflectionOpacity,
	};
};

export const spawnSubscription = (sub: TwitchSubscription, count: number): SubscriptionVisual => {
	const angleDegs = count % 2 ? (count % 36) * 10 : ((count + 18) % 36) * 10;
	const angleRads = (angleDegs / 360) * Math.PI * 2.0;

	return {
		angle: angleRads,
		radius: 2 + Math.random() * 5,
		color: CONFIG.Subscriptions.colors[count % CONFIG.Subscriptions.colors.length],
		received: new Date(),
	};
};

export const subscriptionScreenspaceProps = (sub: SubscriptionVisual) => {
	const now = new Date();
	const age = now.getTime() - sub.received.getTime();
	const radius = sub.radius + age / 50.0;

	return {
		x: 50 + Math.cos(sub.angle) * radius,
		y: 45 + Math.sin(sub.angle) * radius,
		now: now,
		age: age,
		radius: radius,
		color: sub.color,
		fontSize: easeIn(
			age,
			CONFIG.Subscriptions.despawnMs,
			CONFIG.Subscriptions.fontSizeMin,
			CONFIG.Subscriptions.fontSizeMax,
		),
	};
};

export const subscriptionStyle = (sub: SubscriptionVisual) => {
	const ssp = subscriptionScreenspaceProps(sub);
	return { left: ssp.x + '%', top: ssp.y + '%', fontSize: ssp.fontSize + 'px', color: ssp.color };
};

export const subscriptionReflectionStyle = (sub: SubscriptionVisual) => {
	const dsp = subscriptionScreenspaceProps(sub);
	const age = dsp.age * 2;
	const pushDown = 10 + (age / CONFIG.Donations.despawnMs) * 120;
	return {
		...sub,
		left: dsp.x + '%',
		top: dsp.radius + pushDown + '%',
	};
};

export const staticStyle = (staticOverlay: Static, staticNoiseSrc: string) => {
	const maxHeight = CONFIG.Static.heightMaxPercent;
	const now = new Date();
	const age = now.getTime() - staticOverlay.spawnDate.getTime();
	const top = -maxHeight + (age / staticOverlay.maxAge) * (100.0 + maxHeight);
	return {
		top: top + '%',
		height: staticOverlay.height + '%',
		opacity: staticOpacity(top),
		backgroundImage: 'url(' + staticNoiseSrc + ')',
	};
};
