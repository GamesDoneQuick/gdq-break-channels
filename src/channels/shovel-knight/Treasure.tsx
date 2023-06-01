import styled from '@emotion/styled';
import { ReactNode } from 'react';
import treasure00Image from './assets/treasure00.png';
import treasure01Image from './assets/treasure01.png';
import treasure02Image from './assets/treasure02.png';
import treasure03Image from './assets/treasure03.png';
import treasure04Image from './assets/treasure04.png';
import { SHOVELING_ANIMATION_DURATION } from './constants';

export interface TreasureProps {
	donationAmount: number;
}

const donationToTreasureImage = (donation: number) => {
	const donationInt = Math.round(donation);

	if (donationInt < 5) {
		return treasure00Image;
	} else if (donationInt < 50) {
		return treasure01Image;
	} else if (donationInt < 100) {
		return treasure02Image;
	} else if (donationInt < 500) {
		return treasure03Image;
	} else {
		return treasure04Image;
	}
};

const TreasureContainer = styled.div`
	@keyframes xAxis {
		50% {
			left: 50px;
		}
		80% {
			opacity: 1;
		}
		100% {
			left: 50px;
			opacity: 0;
		}
	}

	@keyframes yAxis {
		25% {
			bottom: 100px;
		}
		50% {
			bottom: 18px;
		}
		80% {
			opacity: 1;
		}
		100% {
			bottom: 18px;
			opacity: 0;
		}
	}

	@keyframes fadeInOut {
		0% {
			opacity: 0;
		}
		25% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			transform: translateY(-100%);
			opacity: 0;
		}
	}

	position: absolute;
	height: 150px;
	width: 150px;
	bottom: 32px;
	left: 22%;
	z-index: 3;
`;

interface DonationTextProps {
	children: ReactNode;
	animationDuration?: number;
	animationDelay?: number;
}

function DonationText({ children }: DonationTextProps) {
	return (
		<span
			css={{
				fontFamily: 'gdqpixel',
				fontSize: '1rem',
				textShadow: '-1px 4px black',
				position: 'absolute',
				bottom: '64px',
				width: '100%',
				textAlign: 'center',
				opacity: '0',
				animation: `fadeInOut ${SHOVELING_ANIMATION_DURATION}ms linear`,
				animationIterationCount: '1',
			}}>
			{children}
		</span>
	);
}

interface TreasureImageProps {
	src: string;
}

function TreasureImage({ src }: TreasureImageProps) {
	return (
		<img
			src={src}
			css={{
				position: 'absolute',
				bottom: '0',
				left: '0',
				animation: `xAxis ${SHOVELING_ANIMATION_DURATION}ms linear, yAxis ${SHOVELING_ANIMATION_DURATION}ms ease-in-out`,
				animationIterationCount: '1',
			}}
		/>
	);
}

export function Treasure({ donationAmount }: TreasureProps) {
	return (
		<TreasureContainer>
			<DonationText>${donationAmount}</DonationText>
			<TreasureImage src={donationToTreasureImage(donationAmount)} />
		</TreasureContainer>
	);
}
