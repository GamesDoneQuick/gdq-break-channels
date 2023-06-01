import styled from '@emotion/styled';
import runningAnimation from './assets/shovel-knight-running.gif';
import shovelingAnimation from './assets/shovel-knight-shoveling.gif';

export interface ShovelKnightCharacterProps {
	isShoveling: boolean;
}

const CharacterContainer = styled.img`
	position: absolute;
	height: 96px;
	width: auto;
	bottom: 64px;
	left: 15%;
	z-index: 3;
`;

export function ShovelKnightCharacter({ isShoveling }: ShovelKnightCharacterProps) {
	const characterAnimation = isShoveling ? shovelingAnimation : runningAnimation;

	return <CharacterContainer src={characterAnimation} />;
}
