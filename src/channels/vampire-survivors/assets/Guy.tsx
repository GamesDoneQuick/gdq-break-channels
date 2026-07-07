import styled from '@emotion/styled';
import guySprite from './guy.png';
import { useEffect, useState } from 'react';

interface GuyContainerProps {
	sprite: string;
	frameX: number;
	left?: string;
	top?: string;
}

const GuyContainer = styled.div<GuyContainerProps>`
	position: absolute;
	left: ${(props) => props.left || '50%'};
	top: ${(props) => props.top || '35%'};
	width: 101px;
	height: 104px;
	background-image: url(${(props) => props.sprite});
	background-repeat: no-repeat;
	overflow: hidden;
	background-position: ${(props) => `-${props.frameX * 101}px 0`};
`;

interface GuyProps {
	left?: string;
	top?: string;
}

function Guy({ left, top }: GuyProps) {
	const [frame, setFrame] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setFrame((prevFrame) => (prevFrame + 1) % 2);
		}, 1000 / 2);

		return () => clearInterval(interval);
	}, []);

	return <GuyContainer sprite={guySprite} frameX={frame} left={left} top={top} />;
}

export default Guy;
