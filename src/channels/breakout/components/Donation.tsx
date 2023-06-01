import styled from '@emotion/styled';
import { FormattedDonation } from '@gdq/types/tracker';
import gsap from 'gsap';
import { FC, useLayoutEffect, useRef } from 'react';
import { Color, toCss } from '../game/model';

interface Props {
	readonly donation: FormattedDonation;
	readonly offset: number;
}

const Donation: FC<Props> = ({ donation, offset }: Props) => {
	const text = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const color = toCss(colorForAmount(donation.rawAmount));

		// basically logarithmic.
		const scale = Math.min(2, Math.max(0.8, Math.log10(donation.rawAmount) ** (1 / 3)));

		gsap.timeline()
			.to(text.current, {
				y: 0,
				scale,
				opacity: 1,
				color,
			})
			.to(text.current, { opacity: 0 }, 2);
	}, []);

	useLayoutEffect(() => {
		gsap.to(text.current, { y: offset * 50 });
	}, [offset]);

	return <DonationText ref={text}>{donation.amount}</DonationText>;
};

const DonationText = styled.div`
	font-family: gdqpixel;
	color: #eee;
	font-size: 25px;

	position: absolute;
	left: 0;
	transform: translateX(-50%) scale(0);
	opacity: 0;
`;

function colorForAmount(amount: number): Color {
	if (amount >= 500) {
		return Color.YELLOW;
	}

	if (amount >= 50) {
		return Color.GREEN;
	}

	return Color.WHITE;
}

export default Donation;
