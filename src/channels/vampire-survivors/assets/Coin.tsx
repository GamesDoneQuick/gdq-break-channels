import styled from '@emotion/styled';
import coinsSprite from './coins.png';

interface CoinContainerProps {
	sprite: string;
	index: number;
	left?: string;
	top?: string;
}

const CoinContainer = styled.div<CoinContainerProps>`
	position: absolute;
	left: ${(props) => props.left || '45%'};
	top: ${(props) => props.top || '35%'};
	width: 38px;
	height: 38px;
	background-image: url(${(props) => props.sprite});
	background-repeat: no-repeat;
	background-position: ${(props) => `-${props.index * 38}px 0`};
`;

export interface CoinProps {
	/**
	 * index determines which coin to show:
	 * 0 -> first coin (gold),
	 * 1 -> green gem, etc.
	 */
	index?: number;
	className?: string;
	left?: string;
	top?: string;
	collected: boolean;
}

export default function Coin({ index = 0, className, left, top }: CoinProps) {
	return <CoinContainer sprite={coinsSprite} index={index} className={className} left={left} top={top} />;
}
