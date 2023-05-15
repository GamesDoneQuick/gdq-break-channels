import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';

registerChannel('Template', 99, Template, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'example',
});

function Template(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);

	useListenFor('donation', (donation: FormattedDonation) => {
		/**
		 * Respond to a donation.
		 */
	});

	return (
		<Container>
			<TotalEl>
				$<TweenNumber value={total?.raw} />
			</TotalEl>
		</Container>
	);
}

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
`;

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	position: absolute;

	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
`;
