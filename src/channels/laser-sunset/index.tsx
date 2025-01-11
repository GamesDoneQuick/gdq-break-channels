/**
 * @author SushiElemental <SushiElemental@gmail.com>
 *
 * @file Break channel showing an HTML/CSS 【 V A P O R W A V E 】 scenery
 */

import type { FormattedDonation, TwitchSubscription, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import styled from '@emotion/styled';

import { useEffect, useState, useReducer } from 'react';
import { useReplicant } from 'use-nodecg';
import { useActive } from '@gdq/lib/hooks/useActive';
import { useListenForFn } from '@gdq/lib/hooks/useListenForFn';
import TweenNumber from '@gdq/lib/components/TweenNumber';

import { StarVisual, SunReflectionLine, Overcast, DonationPopup, SubscriptionVisual, Static } from './types';
import * as fn from './functions';
import CONFIG from './config';
import './style.css';
import staticNoise from '@gdq/assets/static.gif';

registerChannel('Laser Sunset', 15, LaserSunset, {
	position: 'topRight',
	site: 'Twitch',
	handle: 'SushiElemental',
});

export function LaserSunset(props: ChannelProps) {
	const active = useActive();
	const [running, setRunning] = useState<boolean>(false);
	const [total] = useReplicant<Total | null>('total', null);
	const [stars, setStars] = useState<StarVisual[]>([]);
	const [countDonations, incrementDonationsCount] = useReducer((x) => x + 1, 0);
	const [donations, setDonations] = useState<DonationPopup[]>([]);
	const [countSubscriptions, incrementSubscriptionsCount] = useReducer((x) => x + 1, 0);
	const [subscriptions, setSubscriptions] = useState<SubscriptionVisual[]>([]);
	const [_, scrollLasers] = useReducer((x) => x + 1, 0);
	const [clouds, setClouds] = useState<Overcast[]>([]);
	const [sunReflections, setSunReflections] = useState<SunReflectionLine[]>([
		{ xPosition: 50, marginTop: 2, width: 16 },
		{ xPosition: 50, marginTop: 2, width: 14 },
		{ xPosition: 50, marginTop: 2, width: 12 },
		{ xPosition: 50, marginTop: 2, width: 10 },
		{ xPosition: 50, marginTop: 2, width: 9 },
		{ xPosition: 50, marginTop: 2, width: 8 },
		{ xPosition: 50, marginTop: 2, width: 6 },
		{ xPosition: 50, marginTop: 2, width: 4 },
	]);
	const [staticOverlays, setStaticOverlays] = useState<Static[]>([]);

	const bgHighlightClass = donations.length || subscriptions.length ? ' highlight' : '';

	const onDonationReceived = (donation: FormattedDonation) => {
		if (!active || donations.length >= CONFIG.Donations.countMax) return;

		const dono = fn.spawnDonation(donation, countDonations);
		const cloud = fn.spawnCloud(donation.rawAmount, countDonations);
		setDonations((donos) => [...donos, dono]);
		setClouds((clouds) => [...clouds, cloud]);
		setTimeout(() => removeDonation(dono.received), CONFIG.Donations.despawnMs);
		setTimeout(() => removeCloud(cloud.received), CONFIG.Cloud.despawnMs);

		incrementDonationsCount();
		animateSunReflections();

		if (donations.length >= CONFIG.Donations.countMax) {
			props.lock();
		}
	};

	const onSubscriptionReceived = (subscription: TwitchSubscription) => {
		if (!active) return;

		setTimeout(() => props.unlock(), CONFIG.Subscriptions.lockTimeMs);

		const sub = fn.spawnSubscription(subscription, countSubscriptions);
		setSubscriptions((subs) => [...subs, sub]);
		setTimeout(() => removeSubscription(sub.received), CONFIG.Subscriptions.despawnMs);

		incrementSubscriptionsCount();
		animateSunReflections();
	};

	useListenForFn('donation', onDonationReceived);
	useListenForFn('subscription', onSubscriptionReceived);

	useEffect(() => {
		if (!active) return;

		const fpsTimer = setInterval(() => {
			scrollLasers();
		}, CONFIG.Timers.fpsInterval);

		setRunning(true);
		return () => clearInterval(fpsTimer);
	}, [active]);

	useEffect(() => {
		const xStep = Math.min(100, 100 / CONFIG.Stars.countX);
		const yStep = Math.min(100, 100 / CONFIG.Stars.countY);
		const stars = new Array<StarVisual>();

		for (let y = 0; y < CONFIG.Stars.countY; y++) {
			for (let x = 0; x < CONFIG.Stars.countX; x++) {
				const star = fn.spawnStar(
					y * CONFIG.Stars.countY + x,
					x * xStep,
					x * xStep + xStep,
					y * yStep,
					y * yStep + yStep,
				);
				stars.push(star);
			}
		}

		setStars(stars);
	}, [CONFIG.Stars.countX, CONFIG.Stars.countY]);

	useEffect(() => {
		if (!active) return;

		const twinkleTimer = setInterval(() => {
			setStars((stars) =>
				stars.map((s, index) => {
					return { ...s, opacity: fn.randomStarOpacity() };
				}),
			);
		}, CONFIG.Stars.twinkleMs);

		return () => clearInterval(twinkleTimer);
	}, [active]);

	useEffect(() => {
		if (!active) return;

		const staticOverlaysTimer = setInterval(() => {
			setTimeout(() => {
				const staticOverlay = fn.spawnStatic();

				setStaticOverlays((overlays) => [...overlays, staticOverlay]);
				setTimeout(() => removeStaticOverlay(staticOverlay.spawnDate), staticOverlay.maxAge);
			}, Math.random() * CONFIG.Static.respawnPeriodVariance);
		}, CONFIG.Static.respawnPeriod);

		return () => clearInterval(staticOverlaysTimer);
	}, [active]);

	const removeDonation = (date: Date) => {
		setDonations((donos) => donos.filter((d) => d.received !== date));
		props.unlock();
	};

	const removeCloud = (date: Date) => {
		setClouds((donos) => donos.filter((d) => d.received !== date));
	};

	const removeSubscription = (date: Date) => {
		setSubscriptions((subscriptions) => subscriptions.filter((s) => s.received !== date));
	};

	const removeStaticOverlay = (date: Date) => {
		setStaticOverlays((staticOverlays) => staticOverlays.filter((so) => so.spawnDate !== date));
	};

	const animateSunReflections = () => {
		setSunReflections((lines) => {
			return lines.map((line, index) => {
				line.width = 16 - index * 2 + (Math.random() * 2 - 1);
				line.marginTop = Math.floor(2.5 + (Math.random() * 2 - 1));
				line.xPosition = 50 + (Math.random() * 2 - 1);
				return line;
			});
		});
	};

	if (!active || !running) {
		return <Container className="Container"></Container>;
	}

	return (
		<Container className="Container">
			<Sky className={'Sky' + bgHighlightClass}>
				<Stars className="Stars">
					{stars.map((s, index) => (
						<Star className="Star" key={index} style={fn.starStyle(s, false)}>
							{s.text}
						</Star>
					))}
				</Stars>
				<Sun className="Sun Sun-top"></Sun>
				<Sun className="Sun Sun-middle-top"></Sun>
				<Sun className="Sun Sun-middle"></Sun>
				<Sun className="Sun Sun-middle-bottom"></Sun>
				<Sun className="Sun Sun-bottom"></Sun>
				<Clouds className="Clouds">
					{clouds.map((c, index) => (
						<Cloud className="Cloud" key={index} style={fn.cloudStyle(c)}></Cloud>
					))}
				</Clouds>
			</Sky>
			<Ocean className={'Ocean' + bgHighlightClass}>
				<Stars className="Stars reflection">
					{stars.map((s, index) => (
						<Star
							className="Star"
							key={index}
							style={fn.starStyle(s, donations.length > 0 || subscriptions.length > 0)}>
							{s.text}
						</Star>
					))}
				</Stars>
				<OceanBackground className="Ocean-background"></OceanBackground>
				<Lasers className="Lasers"></Lasers>
				<LasersHorizon className="Lasers-horizon"></LasersHorizon>
				<SunReflections className="SunReflections">
					{sunReflections.map((line, index) => (
						<SunReflection
							className={'SunReflection SunReflection-' + index}
							key={index}
							style={{
								width: line.width + '%',
								marginTop: line.marginTop + 'px',
								left: line.xPosition + '%',
							}}></SunReflection>
					))}
				</SunReflections>
				<TotalEl className="TotalEl reflection">
					$<TweenNumber value={total?.raw} />
				</TotalEl>
				<SubscriptionsList className="SubscriptionsList">
					{subscriptions.map((s, idx) => (
						<Subscription
							className="Subscription reflection"
							key={idx}
							style={fn.subscriptionReflectionStyle(s)}>
							♥
						</Subscription>
					))}
				</SubscriptionsList>
				<CloudReflections className="CloudReflections">
					{clouds.map((c, index) => (
						<Cloud className="Cloud reflection" key={index} style={fn.cloudReflectionStyle(c)}></Cloud>
					))}
				</CloudReflections>
				<DonationsList className="DonationsList">
					{donations.map((d, idx) => (
						<Donation className="Donation reflection" key={idx} style={fn.donationReflectionStyle(d)}>
							{d.renderedAmount}
						</Donation>
					))}
				</DonationsList>
			</Ocean>
			<SubscriptionsList className="SubscriptionsList">
				{subscriptions.map((s, idx) => (
					<Subscription className="Subscription" key={idx} style={fn.subscriptionStyle(s)}>
						♥
					</Subscription>
				))}
			</SubscriptionsList>
			<DonationsList className="DonationsList">
				{donations.map((d, idx) => (
					<Donation className="Donation" key={idx} style={fn.donationStyle(d)}>
						{d.renderedAmount}
					</Donation>
				))}
			</DonationsList>
			<TotalEl className="TotalEl">
				$<TweenNumber value={total?.raw} />
			</TotalEl>
			<StaticList className="StaticList">
				{staticOverlays.map((so, idx) => (
					<StaticEl className="Static" key={idx} style={fn.staticStyle(so, staticNoise)}></StaticEl>
				))}
			</StaticList>
		</Container>
	);
}

export const Container = styled.div``;
export const TotalEl = styled.div``;
export const DonationsList = styled.div``;
export const Donation = styled.div``;
export const SubscriptionsList = styled.div``;
export const Subscription = styled.div``;
export const Sky = styled.div``;
export const Stars = styled.div``;
export const Star = styled.div``;
export const Clouds = styled.div``;
export const Cloud = styled.div``;
export const CloudReflections = styled.div``;
export const Sun = styled.div``;
export const Ocean = styled.div``;
export const OceanBackground = styled.div``;
export const Lasers = styled.div``;
export const LasersHorizon = styled.div``;
export const SunReflections = styled.div``;
export const SunReflection = styled.div``;
export const StaticList = styled.div``;
export const StaticEl = styled.div``;
