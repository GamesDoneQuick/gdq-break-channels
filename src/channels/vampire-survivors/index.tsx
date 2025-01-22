/**
 * @author Ryan Morrison-Westphal <mr.tyzik@gmail.com>
 */

import type { FormattedDonation, Event, Total, TwitchSubscription } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useEffect, useState } from 'react';

import { useListenFor } from 'use-nodecg';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';

import background from './background.png';

import Guy from './assets/Guy';
import Enemy, { type EnemyProps } from './assets/Enemy';
import Coin, { type CoinProps } from './assets/Coin';
import Whip, { type WhipProps } from './assets/Whip';
import Sub, { type SubProps } from './assets/Sub';
import EventBar from './assets/EventBar';

import batSprite from './assets/bat.png';

registerChannel('Vampire Survivors', 23, VampireSurvivors, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'ryanttb',
});

function VampireSurvivors(props: ChannelProps) {
	const [event] = usePreloadedReplicant<Event>('currentEvent');

	const [total] = usePreloadedReplicant<Total | null>('total', null);

	const [bgOffset, setBgOffset] = useState(0);

	const [batProps, setBatProps] = useState<EnemyProps[]>([]);

	const [coinProps, setCoinProps] = useState<CoinProps[]>([]);

	const [whipProps, setWhipProps] = useState<WhipProps[]>([]);

	const [subProps, setSubProps] = useState<SubProps[]>([]);

	useListenFor('donation', (donation: FormattedDonation) => {
		const maxLeft = 1092;
		const maxTop = 332;

		const middleTop = 128;

		const leftValue = Math.floor(Math.random() * (maxLeft + 1));
		let topValue = Math.floor(Math.random() * (maxTop + 1));

		if (topValue < middleTop) {
			topValue -= middleTop;
		} else {
			topValue += middleTop;
		}

		const left = leftValue + 'px';
		const top = topValue + 'px';

		let index = 1;
		if (donation.rawAmount > 20) {
			index = 2;
		}
		if (donation.rawAmount > 200) {
			index = 3;
		}
		setCoinProps((prevProps) => [...prevProps, { index: index, left, top, collected: false }]);
	});

	useListenFor('subscription', (subscription: TwitchSubscription) => {
		const maxTop = 332;

		const middleTop = 128;

		const leftValue = -80;
		let topValue = Math.floor(Math.random() * (maxTop + 1));

		if (topValue < middleTop) {
			topValue -= middleTop;
		} else {
			topValue += middleTop;
		}

		const left = leftValue + 'px';
		const top = topValue + 'px';

		setBatProps((prevProps) => [...prevProps, { left, top, sprite: batSprite, collected: false }]);

		setSubProps((prevProps) => [
			...prevProps,
			{ height: '0px', tick: 0, subPlan: subscription.sub_plan, displayName: subscription.display_name },
		]);
	});

	useEffect(() => {
		const interval = setInterval(() => {
			setBgOffset((prevOffset) => (prevOffset - 4) % 1092);

			setWhipProps((prevWhipProps) =>
				prevWhipProps
					.map((whip) => {
						whip.frame = (whip.frame + 1) % 4;
						return { ...whip, done: whip.frame === 0 };
					})
					.filter((whip) => !whip.done),
			);

			setSubProps((prevSubProps) => {
				const maxHeight = 64;
				const maxTicks = 128;
				const fadeOutTicks = (maxTicks * 3) / 4;

				if (prevSubProps.length > 0) {
					const currentHeight = parseInt(prevSubProps[0].height ?? '0', 10);
					let newHeight = currentHeight;

					if (prevSubProps[0].tick < fadeOutTicks) {
						newHeight = Math.min(currentHeight + 8, maxHeight);
					} else {
						newHeight = Math.max(currentHeight - 8, 0);
					}

					prevSubProps[0].height = `${newHeight}px`;
					prevSubProps[0].tick = prevSubProps[0].tick + 1;
				}

				return prevSubProps.filter((sub) => sub.tick < maxTicks);
			});

			setBatProps((prevBatProps) =>
				prevBatProps
					.map((bat) => {
						const middleLeft = 500;
						const middleTop = 128;

						// Current positions
						const currentLeft = parseInt(bat.left ?? '0', 10);
						const currentTop = parseInt(bat.top ?? '0', 10);

						// Distance from coin to Guy
						const dx = middleLeft - currentLeft;
						const dy = middleTop - currentTop;

						const fraction = 0.05;

						const newLeft = currentLeft + dx * fraction;
						const newTop = currentTop + dy * fraction;

						const distance = Math.sqrt(dx * dx + dy * dy);
						const collected = distance < 40;

						if (collected) {
							setWhipProps((prevWhipProps) => [
								...prevWhipProps,
								{ left: `112px`, top: `112px`, frame: 0, done: false },
							]);
						}

						return { ...bat, left: `${newLeft}px`, top: `${newTop}px`, collected: collected };
					})
					.filter((bat) => !bat.collected),
			);

			setWhipProps((prevWhipProps) => prevWhipProps.filter((whip) => !whip.done));

			setCoinProps((prevCoinProps) => {
				return prevCoinProps
					.map((coin) => {
						const middleLeft = 682;
						const middleTop = 128;

						// Current positions
						const currentLeft = parseInt(coin.left ?? '0', 10);
						const currentTop = parseInt(coin.top ?? '0', 10);

						// Distance from coin to Guy
						const dx = middleLeft - currentLeft;
						const dy = middleTop - currentTop;

						const fraction = 0.1;

						const newLeft = currentLeft + dx * fraction;
						const newTop = currentTop + dy * fraction;

						// If distance is less than 20 pixels, mark as collected
						const distance = Math.sqrt(dx * dx + dy * dy);
						const collected = distance < 20;

						return { ...coin, left: `${newLeft}px`, top: `${newTop}px`, collected: collected };
					})
					.filter((coin) => !coin.collected);
			});
		}, 1000 / 30);

		return () => clearInterval(interval);
	}, [setBgOffset]);

	return (
		<Container posX={bgOffset}>
			<EventBar
				left="0px"
				top="0px"
				eventBeneficiary={event?.beneficiary}
				eventName={event?.shortname}></EventBar>

			<TotalEl>
				<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalEl>

			<Guy left="640px" top="112px"></Guy>

			{batProps.map((props, index) => (
				<Enemy key={index} {...props}></Enemy>
			))}

			{whipProps.map((props, index) => (
				<Whip key={index} {...props}></Whip>
			))}

			{coinProps.map((props, index) => (
				<Coin key={index} {...props}></Coin>
			))}

			{subProps.length > 0 && (
				<Sub
					left="16px"
					top="140px"
					tick={subProps[0].tick}
					height={subProps[0].height}
					subPlan={subProps[0].subPlan}
					displayName={subProps[0].displayName}></Sub>
			)}

			<Coin index={1} left="1032px" top="52px" collected={false}></Coin>
		</Container>
	);
}

interface ContainerProps {
	posX: number;
}

const Container = styled.div<ContainerProps>`
	position: absolute;
	width: 100%;
	height: 100%;
	background: url('${background}');
	background-position: ${(props) => `${props.posX}px 0`};
	overflow: hidden;
	padding: 0;
	margin: 0;
`;

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 25px;
	color: white;

	position: absolute;

	right: 64px;
	top: 58px;
`;
