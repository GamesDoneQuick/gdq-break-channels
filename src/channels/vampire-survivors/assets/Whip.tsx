import styled from '@emotion/styled';
import whipSprite from './whip.png';

interface WhipContainerProps {
	sprite: string;
	frameX: number;
	left?: string;
	top?: string;
}

const WhipContainer = styled.div<WhipContainerProps>`
	position: absolute;
	left: ${(props) => props.left || '45%'};
	top: ${(props) => props.top || '35%'};
	width: 523px;
	height: 82px;
	background-image: url(${(props) => props.sprite});
	background-repeat: no-repeat;
	overflow: hidden;
	background-position: ${(props) => `-${props.frameX * 523}px 0`};
`;

export interface WhipProps {
	left?: string;
	top?: string;
	frame: number;
	done: boolean;
}

function Whip({ left, top, frame }: WhipProps) {
	return <WhipContainer sprite={whipSprite} frameX={frame} left={left} top={top} />;
}

export default Whip;
