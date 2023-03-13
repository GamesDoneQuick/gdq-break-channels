import { useRef, useState } from 'react';
import { useRafLoop } from 'react-use';
import styled from '@emotion/styled';
import { useRotatingBodyPart } from './undertaleHooks';

import mettatonHeadsImage from './assets/enemies/mettaton-heads.png';
import mettatonTorsoImage from './assets/enemies/mettaton-torso.png';
import mettatonLegsImage from './assets/enemies/mettaton-legs.png';
import mettatonArmsImage from './assets/enemies/mettaton-arms.png';

const TORSO_ROTATION = [
	[1, 0],
	[1, -1],
	[0, -1],
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, 1],
	[1, 1],
] as [number, number][];

const HEAD_ROTATION = [
	[0, 0],
	[0, -1],
	[0, -1],
	[0, 0],
	[0, 1],
	[0, 1],
] as [number, number][];

const METTATON_ARM_SPRITE_COUNT = 6;
const METTATON_HEAD_SPRITE_COUNT = 9;

const POSE_SWAP_DELAY_MS = 10000;

export const MettatonUndertale: React.FC = () => {
	const [headOffsetX, headOffsetY] = useRotatingBodyPart(HEAD_ROTATION);
	const [torsoOffsetX, torsoOffsetY] = useRotatingBodyPart(TORSO_ROTATION);
	const [leftArm, setLeftArm] = useState(3);
	const [rightArm, setRightArm] = useState(5);
	const [head, setHead] = useState(0);
	const lastPoseSwapMs = useRef(Date.now());

	useRafLoop(() => {
		const now = Date.now();

		if (now - lastPoseSwapMs.current >= POSE_SWAP_DELAY_MS) {
			setLeftArm(Math.floor(Math.random() * METTATON_ARM_SPRITE_COUNT));
			setRightArm(Math.floor(Math.random() * METTATON_ARM_SPRITE_COUNT));
			setHead(Math.floor(Math.random() * METTATON_HEAD_SPRITE_COUNT));

			lastPoseSwapMs.current = now;
		}
	});

	return (
		<MetatonContainer>
			<MetatonHead sprite={head} dx={headOffsetX + torsoOffsetX} dy={headOffsetY + torsoOffsetY} />
			<MetatonTorso src={mettatonTorsoImage} dx={torsoOffsetX} dy={torsoOffsetY} />
			<MetatonArmLeft sprite={leftArm} dx={torsoOffsetX} dy={torsoOffsetY} />
			<MetatonArmRight sprite={rightArm} dx={torsoOffsetX} dy={torsoOffsetY} />
			<MetatonLegs />
		</MetatonContainer>
	);
};

const MetatonContainer = styled.div`
	position: relative;
	height: 100px;
	width: 100px;
	transform: scale(2);
	transform-origin: 50% 100%;
	image-rendering: pixelated;
`;

const MetatonHead = styled.div<{ dx: number; dy: number; sprite: number }>`
	position: absolute;
	bottom: ${({ dy }) => 87 + dy}px;
	left: ${({ dx }) => 31 + dx}px;
	width: 37px;
	height: 35px;
	background-image: url('${mettatonHeadsImage}');
	background-position: -${({ sprite }) => sprite * 37}px 0;
	z-index: 3;
`;

const MetatonTorso = styled.img<{ dx: number; dy: number }>`
	position: absolute;
	bottom: ${({ dy }) => 58 + dy}px;
	left: calc(50% + ${({ dx }) => dx}px);
	transform: translateX(-50%);
	z-index: 2;
`;

const MetatonArmLeft = styled.div<{ dx: number; dy: number; sprite: number }>`
	position: absolute;
	width: 200px;
	height: 200px;
	background-image: url('${mettatonArmsImage}');
	background-position: -${({ sprite }) => sprite * 200}px 0;
	z-index: 3;
	bottom: ${({ dy }) => -35 + dy}px;
	left: ${({ dx }) => -83 + dx}px;
`;

const MetatonArmRight = styled.div<{ dx: number; dy: number; sprite: number }>`
	position: absolute;
	width: 200px;
	height: 200px;
	background-image: url('${mettatonArmsImage}');
	background-position: -${({ sprite }) => sprite * 200}px 0;
	z-index: 3;
	bottom: ${({ dy }) => -35 + dy}px;
	left: ${({ dx }) => -18 + dx}px;
	transform: scaleX(-1);
`;

const MetatonLegs = styled.div`
	position: absolute;
	bottom: 23px;
	width: 100px;
	height: 42px;
	background-image: url('${mettatonLegsImage}');
`;
