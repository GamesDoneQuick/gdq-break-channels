import { ChannelProps, registerChannel } from '../channels';
import { InstallerBackground } from './InstallerBackground';
import { useListenFor, useReplicant } from 'use-nodecg';
import type { FormattedDonation, Total, Event, TwitchSubscription } from '@gdq/types/tracker';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';
import styled from '@emotion/styled';
import { useState } from 'react';
import { FULL_PROGRESS_DONATIONS, TIME_TO_DISPLAY_DONATION_ALERT } from './settings';
import { DonationMessage } from './Donation';
import { AnimatedCursor } from './AnimatedCursor';

registerChannel('Installer', 219, Installer, {
	position: 'bottomRight',
	site: 'GitHub',
	handle: 'g-herselman',
});

type FormattedDonationWithOffest = FormattedDonation & { visibleIndex: number };

export function Installer(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const [event] = usePreloadedReplicant<Event>('currentEvent');
	const [newSubscriber, setNewSubscriber] = useState('primer');
	const [displayingDonations, setDisplayingDonations] = useState<FormattedDonationWithOffest[]>([]);
	const [donatedWhileShowing, setDonatedWhileShowing] = useState(0);

	const removeEarliestDisplayedDonation = () => {
		setDisplayingDonations((donations) => donations.slice(1));
	};

	const addDonation = (newDonation: FormattedDonation) => {
		setDisplayingDonations((donations) => {
			const lastVisibleDonation = donations[donations.length - 1];
			const lastVisibleIndex = lastVisibleDonation?.visibleIndex ?? 0;
			return [...donations, { ...newDonation, visibleIndex: lastVisibleIndex + 1 }];
		});
		setDonatedWhileShowing((donated) => donated + newDonation.rawAmount);
		setTimeout(removeEarliestDisplayedDonation, TIME_TO_DISPLAY_DONATION_ALERT);
	};

	useListenFor('donation', (donation: FormattedDonation) => {
		addDonation(donation);
	});

	useListenFor('subscription', (subscription: TwitchSubscription) => {
		setNewSubscriber(subscription.display_name);
	});

	const progress = Math.min(1, donatedWhileShowing / FULL_PROGRESS_DONATIONS);

	return (
		<Container>
			<InstallerBackground
				eventTitle={event.name}
				newSubscriber={newSubscriber}
				progress={progress}
				donationTotal={total?.formatted ?? '$ 0'}
			/>
			<ErrorContainer>
				{displayingDonations.map((donation) => {
					const offset = donation.visibleIndex * 2 + '%';
					return (
						<div style={{ position: 'absolute', left: offset, top: offset }}>
							<DonationMessage
								donationAmount={donation.amount}
								eventShortTitle={event.beneficiaryShort}
							/>
						</div>
					);
				})}
			</ErrorContainer>
			<AnimatedCursor />
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

const ErrorContainer = styled.div`
	position: absolute;
	left: 60%;
	top: 10%;
	height: 90%;
	width: 40%;
	padding: 0;
	margin: 0;
	overflow: hidden;
`;
