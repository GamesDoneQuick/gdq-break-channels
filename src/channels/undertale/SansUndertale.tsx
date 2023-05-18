import styled from '@emotion/styled';

import sansHeadImage from './assets/enemies/sans-head.png';
import sansTorsoImage from './assets/enemies/sans-torso.png';
import sansLegsImage from './assets/enemies/sans-legs.png';
import { useWanderingBodyPart } from './undertaleHooks';

export const SansUndertale: React.FC = () => {
	const headOffsetX = useWanderingBodyPart();
	const headOffsetY = useWanderingBodyPart();
	const torsoOffsetX = useWanderingBodyPart();
	const torsoOffsetY = useWanderingBodyPart();

	return (
		<SansContainer>
			<SansHead dx={headOffsetX + torsoOffsetX} dy={headOffsetY + torsoOffsetY} />
			<SansTorso dx={torsoOffsetX} dy={torsoOffsetY} />
			<SansLegs />
		</SansContainer>
	);
};

const SansContainer = styled.div`
	position: relative;
	height: 100px;
	width: 54px;
	transform: scale(2);
	transform-origin: 50% 100%;
	image-rendering: pixelated;
`;

const SansHead = styled.div<{ dx: number; dy: number }>`
	position: absolute;
	bottom: ${({ dy }) => 66 + dy}px;
	left: ${({ dx }) => 11 + dx}px;
	width: 32px;
	height: 30px;
	background-image: url('${sansHeadImage}');
	z-index: 2;
`;

const SansTorso = styled.div<{ dx: number; dy: number }>`
	position: absolute;
	bottom: ${({ dy }) => 46 + dy}px;
	left: ${({ dx }) => dx}px;
	width: 54px;
	height: 25px;
	background-image: url('${sansTorsoImage}');
	z-index: 1;
`;

const SansLegs = styled.div`
	position: absolute;
	bottom: 23px;
	left: 6px;
	width: 44px;
	height: 23px;
	background-image: url('${sansLegsImage}');
`;
