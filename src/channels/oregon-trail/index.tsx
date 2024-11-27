/**
 * @author Melanie Arnold <melanie.w.arnold@gmail.com>
 * @author Dillon Pentz <dillon@vodbox.io>
 */

import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '..';

import styled from '@emotion/styled';
import { useEffect, useState, useReducer } from 'react';
import { useListenFor } from 'use-nodecg';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';
import { FerryView } from './ferry';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { CurrencyToAbbreviation } from 'currency-to-abbreviation';

import hills from './hills.png';
import wagon from './wagon1.png';
import wagon2 from './wagon2.png';
import wagon3 from './wagon3.png';
import river from './river.png';
import { useListenForFn } from '@gdq/lib/hooks/useListenForFn';

registerChannel('Oregon Trail', 85, OregonTrail, {
	handle: 'einalem4',
	position: 'bottomLeft',
	site: 'SupportClass',
});

type DonationPopup = FormattedDonation & {
	left: number;
	top: number;
	received: Date;
};

const positions = [
	{
		left: 50,
		top: 120,
	},
	{
		left: 220,
		top: 160,
	},
	{
		left: 390,
		top: 120,
	},
	{
		left: 560,
		top: 160,
	},
	{
		left: 730,
		top: 120,
	},
];

const wagons = [wagon, wagon2, wagon3];
let wagonTimer: ReturnType<typeof setInterval> | undefined = undefined;
let animationTimer: ReturnType<typeof setTimeout> | undefined = undefined;

export function OregonTrail(_: ChannelProps) {
	const [event] = usePreloadedReplicant<Event>('currentEvent');
	const [total] = usePreloadedReplicant<Total | null>('total', null);
	const [donations, setDonations] = useState<DonationPopup[]>([]);
	const [receivedCount, incrementReceivedCount] = useReducer((x) => x + 1, 0);
	const [wagonFrame, setWagonFrame] = useState(0);
	const [viewFerry, setViewFerry] = useState(false);

	const totalRaw = total ? total.raw : 0;
	const [goalProgress, setGoalProgress] = useState(totalRaw);

	const start = -800,
		end = 600,
		goalTarget = (Math.floor(goalProgress / 10000) + 1) * 10000;
	let riverPos = (end - start) * ((totalRaw - goalTarget + 10000) / 10000) + start;

	if (riverPos > end) {
		riverPos = end;
	}

	const goalAmount = CurrencyToAbbreviation({
		inputNumber: goalTarget,
		inputLocale: 'en-US',
		decimalPlacesToRound: 2,
	});

	useEffect(() => {
		if (receivedCount === 0) return;

		if (wagonTimer) clearInterval(wagonTimer);
		wagonTimer = setInterval(() => {
			setWagonFrame((frame) => {
				const nextFrame = frame + 1;
				return nextFrame >= wagons.length ? 0 : nextFrame;
			});
		}, 1000 / 15);

		if (animationTimer) clearTimeout(animationTimer);
		animationTimer = setTimeout(() => {
			setTimeout(() => {
				if (wagonTimer) clearInterval(wagonTimer);
				setWagonFrame(0);
			}, 1000);
		}, 3000);
	}, [receivedCount]);

	useEffect(() => {
		if ((total?.raw ?? 0) >= goalTarget) {
			setTimeout(() => {
				setViewFerry(true);
				setGoalProgress(total?.raw ?? 0);
				setTimeout(() => setViewFerry(false), 10000);
			}, 2800);
		}
	}, [total?.raw]);

	const removeDonation = (date: Date) => {
		setDonations((donos) => donos.filter((d) => d.received !== date));
	};

	const onDonationReceived = (donation: FormattedDonation) => {
		const fields = { received: new Date(), ...positions[receivedCount % positions.length] };
		setDonations((donos) => [...donos, { ...donation, ...fields }]);
		setTimeout(() => removeDonation(fields.received), 5000);
		incrementReceivedCount();
	};

	useListenForFn('donation', onDonationReceived);

	const formatCurrency = (val: number) =>
		val.toLocaleString('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0,
		});

	return (
		<div>
			{!viewFerry && (
				<Container>
					<TotalText>
						$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
					</TotalText>
					<DonationText>raised for</DonationText>
					<DonationTextBigger>{event.beneficiary}</DonationTextBigger>
					<Hills />
					<Wagon style={{ backgroundImage: `url(${wagons[wagonFrame]})` }} />
					<River style={{ left: riverPos }} />
					<Grass />
					<GrassTracker style={{ left: riverPos + 100 }} />
					<GoalTrackerText style={{ left: riverPos + 85 }}>
						{goalAmount ? goalAmount.replace('$', '') : ''}
					</GoalTrackerText>
					<>
						{donations.map((d, idx) => (
							<DonationRectangle key={idx} style={{ left: d.left, top: d.top }}>
								{`${event.beneficiaryShort} received ${formatCurrency(d.rawAmount)}.`}
							</DonationRectangle>
						))}
					</>
				</Container>
			)}
			<FerryView
				show={viewFerry}
				text={`${event.shortname} has raised ${CurrencyToAbbreviation({
					inputNumber: totalRaw,
					decimalPlacesToRound: totalRaw > 1010000 ? 2 : 0,
				})}!`}
			/>
		</div>
	);
}

const Container = styled.div`
	position: absolute;
	overflow: hidden;
	width: 1092px;
	height: 332px;
	background: #131b14;
`;

const TotalText = styled.div`
	font-family: gdqpixel;
	position: absolute;
	width: 313.05px;
	height: 48.48px;
	left: 62.95px;
	top: 33.99px;
	font-style: normal;
	font-weight: 400;
	font-size: 47.8853px;
	line-height: 92.9%;
	display: flex;
	align-items: center;
	text-align: center;
	color: #53ff89;
`;

const DonationText = styled.div`
	position: absolute;
	left: 400px;
	right: 10.07%;
	top: 28px;
	font-family: 'oregontrail';
	font-style: normal;
	font-weight: 500;
	font-size: 15px;
	line-height: 32px;
	display: flex;
	align-items: center;
	color: #ffffff;
`;

const DonationTextBigger = styled.div`
	position: absolute;
	left: 400px;
	right: 10.07%;
	top: 58px;
	font-family: 'oregontrail';
	font-style: normal;
	font-size: 21px;
	line-height: 32px;
	display: flex;
	align-items: center;
	color: #ffffff;
`;

const DonationRectangle = styled.div`
	box-sizing: border-box;
	position: absolute;
	height: 40px;
	background: #000000;
	border: 6px solid #ffffff;
	border-radius: 8px;
	resize: horizontal;
	font-family: 'oregontrail';
	font-style: normal;
	font-weight: 500;
	font-size: 15px;
	line-height: 92.9%;
	display: flex;
	padding-left: 8px;
	padding-right: 8px;
	align-items: center;
	text-align: center;
	color: #ffffff;
`;

const Grass = styled.div`
	position: absolute;
	left: 0%;
	right: 0%;
	top: 91.87%;
	bottom: 0%;
	background: #0e4205;
	border-top: #13e114 solid 3px;
`;

const GrassTracker = styled.div`
	position: absolute;
	width: 2px;
	height: 6px;
	top: 308px;
	background: #53ff89;
	transition: left 3s;
`;

const GoalTrackerText = styled.div`
	position: absolute;
	top: 316px;
	font-family: 'oregontrail';
	font-style: normal;
	font-weight: 400;
	font-size: 10px;
	line-height: 92.9%;
	display: flex;
	align-items: center;
	text-align: center;
	color: #53ff89;
	transition: left 3s;
`;

const Hills = styled.div`
	position: absolute;
	width: 837px;
	height: 45px;
	left: 254px;
	top: 200px;
	background: url('${hills}') repeat-x;
	overflow: hidden;
	mix-blend-mode: screen;
	transform: scale(3);
	image-rendering: pixelated;
`;

const Wagon = styled.div`
	position: absolute;
	width: 225px;
	height: 81px;
	left: 1000px;
	top: 305px;
	background-repeat: no-repeat;
	transform: scale(3);
	image-rendering: pixelated;
`;

const River = styled.div`
	position: absolute;
	width: 201px;
	height: 69px;
	left: 172px;
	top: 236px;
	transition: left 3s;
	background: url('${river}') no-repeat center;
	transform: scale(3);
	image-rendering: pixelated;
`;
