import styled from '@emotion/styled';
import { JunimoAlert } from '@gdq/channels/stardew-junimo/types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface JunimoProps {
	image: string;
	imageJump: string;
	alert: JunimoAlert | null;
	onAnimationEnded: Function;
}

export const Junimo = ({ image, imageJump, alert, onAnimationEnded }: JunimoProps) => {
	const [src, setSrc] = useState(image);
	const frames = useRef(0);
	const isAnimating = useRef(false);

	const startAnimation = useCallback(() => {
		if (isAnimating.current) {
			return;
		}

		isAnimating.current = true;

		setTimeout(() => {
			const intervalId = setInterval(() => {
				frames.current = frames.current - 1;

				if (frames.current % 2 === 0) {
					setSrc(image);
				} else {
					setSrc(imageJump);
				}
				if (frames.current === 0) {
					isAnimating.current = false;
					clearInterval(intervalId);

					setTimeout(onAnimationEnded, 500);
				}
			}, 300);
		}, 300);
	}, [isAnimating, frames]);

	useEffect(() => {
		if (!alert) {
			return;
		}
		frames.current = 6;
		startAnimation();
	}, [alert]);

	return (
		<Container>
			<JunimoContainer>
				<JunimoImage src={src} style={{ paddingBottom: frames.current % 2 == 0 ? '0px' : '50px' }} />
			</JunimoContainer>
			<DonationText style={{ opacity: alert?.amount && frames.current ? '1' : '0' }}>
				{alert?.amount || ''}
			</DonationText>
		</Container>
	);
};

const JunimoContainer = styled.div`
	height: 200px;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
`;

const JunimoImage = styled.img`
	width: 150px;
`;

const DonationText = styled.div`
	font-family: gdqpixel;
	color: #eee;
	font-size: 25px;
	margin-top: 20px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	transition: opacity 200ms linear;
`;
