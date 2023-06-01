import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { Container, Sky, TotalEl } from './components';
import { ShovelKnightCharacter } from './ShovelKnightCharacter';
import { useEffect, useState } from 'react';
import { ScrollingAnimation } from './ScrollingAnimation';
import { Treasure } from './Treasure';
import {
	BACKGROUND_ANIMATION_DURATION,
	FOREGROUND_ANIMATION_DURATION,
	SHOVELING_ANIMATION_DURATION,
} from './constants';

registerChannel('Shovel Knight', 42, ShovelKnight, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'meseck',
});

export function ShovelKnight(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const [donationQueue, setDonationQueue] = useState<number[]>([]);

	const hasDonation = donationQueue.length > 0;

	useListenFor('donation', (donation: FormattedDonation) => {
		setDonationQueue((prevDonationQueue) => [...prevDonationQueue, donation.rawAmount]);
	});

	useEffect(() => {
		if (donationQueue.length > 0) {
			setTimeout(() => {
				setDonationQueue((prevDonationQueue) => prevDonationQueue.slice(1));
			}, donationQueue.length * SHOVELING_ANIMATION_DURATION);
		}
	}, [donationQueue]);

	return (
		<Container>
			<TotalEl>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalEl>
			{hasDonation && <Treasure key={String(donationQueue[0])} donationAmount={donationQueue[0]} />}
			<ShovelKnightCharacter isShoveling={hasDonation} />
			<Sky />
			<ScrollingAnimation type="foreground" duration={FOREGROUND_ANIMATION_DURATION} isPaused={hasDonation} />
			<ScrollingAnimation type="background" duration={BACKGROUND_ANIMATION_DURATION} isPaused={hasDonation} />
		</Container>
	);
}
