import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import background from './assets/images/bg.png';
import junimoGreen from './assets/images/junimo-green.png';
import junimoBlue from './assets/images/junimo-blue.png';
import junimoViol from './assets/images/junimo-viol.png';
import junimoRed from './assets/images/junimo-red.png';

import junimoGreenJump from './assets/images/junimo-green-jump.png';
import junimoBlueJump from './assets/images/junimo-blue-jump.png';
import junimoViolJump from './assets/images/junimo-viol-jump.png';
import junimoRedJump from './assets/images/junimo-red-jump.png';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { Junimo } from '@gdq/channels/stardew-junimo/junimo';
import { useRef, useState } from 'react';
import { JunimoAlert } from '@gdq/channels/stardew-junimo/types';
import { random } from 'lodash';

registerChannel('Stardew Junimo', 169, StardewJunimo, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'torioyoshiko',
});

function StardewJunimo(_props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const [junimoAlerts, setJunimoAlerts] = useState<(JunimoAlert | null)[]>([null, null, null, null]);
	const donationQueue = useRef<FormattedDonation[]>([]);
	const freeJunimos = useRef<Set<number>>(new Set([0, 1, 2, 3]));

	const maybeShowDonation = () => {
		if (freeJunimos.current.size === 0 || donationQueue.current.length === 0) {
			return;
		}

		const junimoNumber = [...freeJunimos.current][random(0, freeJunimos.current.size - 1)];
		freeJunimos.current.delete(junimoNumber);
		const donation = donationQueue.current.pop();

		setJunimoAlerts((prev) => {
			const newAlerts: (JunimoAlert | null)[] = prev;
			newAlerts[junimoNumber] = { amount: donation!.amount };

			return [...newAlerts];
		});
	};
	useListenFor('donation', (donation: FormattedDonation) => {
		/**
		 * Respond to a donation.
		 */
		donationQueue.current.push(donation);
		maybeShowDonation();
	});

	return (
		<Container>
			<TotalEl>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalEl>
			<Junimo
				image={junimoGreen}
				imageJump={junimoGreenJump}
				alert={junimoAlerts[0]}
				onAnimationEnded={() => {
					freeJunimos.current.add(0);
					maybeShowDonation();
				}}
			/>
			<Junimo
				image={junimoBlue}
				imageJump={junimoBlueJump}
				alert={junimoAlerts[1]}
				onAnimationEnded={() => {
					freeJunimos.current.add(1);
					maybeShowDonation();
				}}
			/>
			<Junimo
				image={junimoRed}
				imageJump={junimoRedJump}
				alert={junimoAlerts[2]}
				onAnimationEnded={() => {
					freeJunimos.current.add(2);
					maybeShowDonation();
				}}
			/>
			<Junimo
				image={junimoViol}
				imageJump={junimoViolJump}
				alert={junimoAlerts[3]}
				onAnimationEnded={() => {
					freeJunimos.current.add(3);
					maybeShowDonation();
				}}
			/>
		</Container>
	);
}

const Container = styled.div`
	background: url('${background}');
	position: absolute;
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	align-items: center;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
`;

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 35px;
	color: white;

	position: absolute;

	left: 50%;
	bottom: 80%;
	transform: translate(-50%, -50%);
`;
