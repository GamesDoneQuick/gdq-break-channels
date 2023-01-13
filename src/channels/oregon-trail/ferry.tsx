import { FC, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import ferry from './ferry_alpha.png';

type FerryViewProps = {
	text: string;
	show: boolean;
};

export const FerryView: FC<FerryViewProps> = ({ text, show }) => {
	const [pos, setPos] = useState(140);
	const [showText, setShowText] = useState(false);

	useEffect(() => {
		if (show) {
			setTimeout(() => {
				setPos(140);
				setTimeout(() => setShowText(true), 6000);
			}, 100);
		} else {
			setPos(-118);
			setShowText(false);
		}
	}, [show]);

	if (!show) return null;

	return (
		<Container>
			<River style={{ top: pos }} />
			<Ferry />
			{showText && <MilestoneDonation>{text}</MilestoneDonation>}
		</Container>
	);
};

const Container = styled.div`
	position: absolute;
	overflow: hidden;
	width: 1092px;
	height: 332px;
	background: #000000;
`;

const River = styled.div`
	position: absolute;
	overflow: hidden;
	left: -500px;
	width: 2000px;
	height: 400px;
	transition: top 9s;
	transform: rotate(-15deg);
	background: #2222ff;
`;

const Ferry = styled.div`
	position: absolute;
	width: 231px;
	height: 126px;
	left: 440px;
	top: 115px;
	background: url('${ferry}') no-repeat center;
	transform: scale(3);
	image-rendering: pixelated;
`;

const MilestoneDonation = styled.div`
	box-sizing: border-box;
	position: absolute;
	height: 52px;
	left: 395px;
	top: 245px;
	background: #000000;
	border: 6px solid #ffffff;
	border-radius: 8px;
	resize: horizontal;
	font-family: 'oregontrail';
	font-style: normal;
	font-weight: 500;
	font-size: 15px;
	line-height: 92.9%;
	display: flex;
	padding-left: 8px;
	padding-right: 8px;
	align-items: center;
	text-align: center;
	color: #ffffff;
`;
