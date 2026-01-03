import styled from '@emotion/styled';
import type { FormattedDonation } from '@gdq/types/tracker';
import textbox from './assets/textbox.png';

const DonationDialogBox = styled.div`
	font-family: gdqpixel;
	font-size: 32px;
	color: white;
	position: absolute;
	left: 50%;
	top: 13%;
	transform: translateX(-50%);
	box-sizing: border-box;
	padding: 28px;
	line-height: 1.25;
	max-width: 50%;
	background-image: url(${textbox});
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
	background-origin: padding-box;
	background-clip: padding-box;
	word-break: break-all;
`;

export function DonationDialog({ donation }: { donation?: FormattedDonation }) {
	if (!donation) {
		return null;
	}

	return (
		<DonationDialogBox>
			Chat donated <br />
			for {Math.floor(donation.rawAmount)}!
		</DonationDialogBox>
	);
}
