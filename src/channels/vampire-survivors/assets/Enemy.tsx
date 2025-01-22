import styled from '@emotion/styled';
import batSprite from './bat.png';
import { useEffect, useState } from 'react';

interface EnemyContainerProps {
	sprite: string;
	frameX: number;
	left?: string;
	top?: string;
}

const EnemyContainer = styled.div<EnemyContainerProps>`
	position: absolute;
	left: ${(props) => props.left || '45%'};
	top: ${(props) => props.top || '35%'};
	width: 80px;
	height: 80px;
	background-image: url(${(props) => props.sprite});
	background-repeat: no-repeat;
	overflow: hidden;
	background-position: ${(props) => `-${props.frameX * 80}px 0`};
`;

export interface EnemyProps {
	left?: string;
	top?: string;
	sprite?: string;
	collected: boolean;
}

function Enemy({ left, top, sprite }: EnemyProps) {
	const [frame, setFrame] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setFrame((prevFrame) => (prevFrame + 1) % 2);
		}, 1000 / 2);

		return () => clearInterval(interval);
	}, []);

	return <EnemyContainer sprite={sprite || batSprite} frameX={frame} left={left} top={top} />;
}

export default Enemy;
