import styled from '@emotion/styled';

import velocity from './assets/velocity/velocity-sheet.png';
import velocityAttack from './assets/velocity/velocity-attack-sheet.png';
import nameTriangle from './assets/name_triangle.png';

const TOP_MARGIN = 32;

const VelocityContainer = styled.div`
	position: absolute;
	top: ${TOP_MARGIN}px;
	left: 10px;
	width: 300px;
	height: 300px;
`;

const Label = styled.div`
	font-family: gdqpixel;
	font-size: 24px;
	text-align: center;
`;

const NameTriangle = styled.div`
	width: 100%;
	height: 16px;
	background-image: url(${nameTriangle});
	background-position: center;
	background-size: contain;
	background-repeat: no-repeat;
	margin-top: 8px;
	position: absolute;
`;

const VelocityIdle = styled.div`
	background-image: url(${velocity});
	background-size: 1050px 210px;
	background-repeat: no-repeat;
	background-position: top;
	width: 210px;
	height: 210px;
	animation: playChar 1s steps(5) infinite;
	transform: scale(1);
	position: absolute;
	left: 18%;
	top: 17%;

	@keyframes playChar {
		from {
			background-position: 0 0;
		}
		to {
			background-position: -1050px 0;
		}
	}
`;
const VelocityAttack = styled.div`
	background-image: url(${velocityAttack});
	background-size: 1050px 210px;
	background-repeat: no-repeat;
	background-position: top;
	width: 210px;
	height: 210px;
	animation: playAttack 0.5s steps(5);
	animation-iteration-count: 1;
	animation-fill-mode: forwards;
	animation-direction: normal;
	transform: scale(1);
	position: absolute;
	left: 18%;
	top: 17%;

	@keyframes playAttack {
		from {
			background-position: 0 0;
		}
		to {
			background-position: -1050px 0;
		}
	}
`;

function VelocityImage({ state, onAnimationEnd }: { state: 'idle' | 'attack'; onAnimationEnd: () => void }) {
	return (
		<div className={state}>
			{state === 'idle' && <VelocityIdle />}
			{state === 'attack' && <VelocityAttack onAnimationEnd={onAnimationEnd} />}
		</div>
	);
}

export function Velocity({
	velocityState,
	onAnimationEnd,
}: {
	velocityState: 'idle' | 'attack';
	onAnimationEnd: () => void;
}) {
	return (
		<VelocityContainer>
			<Label>Velocity</Label>
			<NameTriangle />
			<VelocityImage state={velocityState} onAnimationEnd={onAnimationEnd} />
		</VelocityContainer>
	);
}
