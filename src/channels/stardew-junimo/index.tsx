import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import background from './assets/images/bg.png';
import junimoGreen from './assets/images/junimo-green.png';
import junimoBlue from './assets/images/junimo-blue.png';
import junimoViol from './assets/images/junimo-viol.png';
import junimoRed from './assets/images/junimo-red.png';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { Junimo } from '@gdq/channels/stardew-junimo/junimo';

registerChannel('Stardew Junimo', 169, StardewJunimo, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'torioyoshiko',
});

function StardewJunimo(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);

	useListenFor('donation', (donation: FormattedDonation) => {
		/**
		 * Respond to a donation.
		 */
	});

	return (
		<Container>
			<Junimo image={junimoGreen}/>
			<Junimo image={junimoBlue}/>
			<Junimo image={junimoViol}/>
			<Junimo image={junimoRed}/>
			<TotalEl>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalEl>
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
	top: 85%;
	transform: translate(-50%, -50%);
`;
