import styled from '@emotion/styled';
import portraitUrl from './assets/velocity/velocity-portrait.png';

const Portrait = styled.div`
	background-image: url(${portraitUrl});
	background-size: 100% 100%;
	background-position: center;
	background-repeat: no-repeat;

	position: absolute;
	left: 0;
	width: 515px;
	height: 332px;
	z-index: 10;

	animation: slideInExpand 5s ease-out;
	animation-iteration-count: 1;

	@keyframes slideInExpand {
		0% {
			transform: translateX(-100%) scaleY(0.05);
		}

		15% {
			transform: translateX(289px) scaleY(0.05);
		}

		20% {
			transform: translateX(289px) scaleY(1);
		}

		80% {
			transform: translateX(289px) scaleY(1);
		}

		85% {
			transform: translateX(289px) scaleY(0.05);
		}

		100% {
			transform: translateX(1200px) scaleY(0.05);
		}
	}
`;

const PortraitContainer = styled.div`
	width: 100%;
	height: 100%;
	overflow: hidden;
	position: relative;
`;

export function SubscriptionNotification({
	show,
	onSubscriptionEnd,
}: {
	show: boolean;
	onSubscriptionEnd?: () => void;
}) {
	if (show) {
		return (
			<PortraitContainer>
				<Portrait onAnimationEnd={onSubscriptionEnd} />
			</PortraitContainer>
		);
	}
	return null;
}
