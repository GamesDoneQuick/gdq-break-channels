import styled from '@emotion/styled';

export const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	overflow: hidden;
`;

export const FullWidthImage = styled.img`
	image-rendering: pixelated;
	width: 100%;
`;

export const CitationContainer = styled.div`
	z-index: 16;
	position: absolute;
	bottom: -300px;
	right: 53px;
	width: 605px;
	transition: 0.5s opacity;
`;

export const CitationText = styled.div`
	z-index: 17;
	position: absolute;
	top: 63px;
	left: 36px;
	font-family: proggytiny;
	color: #5a5559;
	font-size: 36px;
	line-height: 22px;
`;

export const GoalStamp = styled.div`
	opacity: 0;
	z-index: 16;
	position: absolute;
	top: 84px;
	left: 99px;
	width: 252px;
`;

export const GoalAmount = styled.div`
	position: absolute;
	top: 10px;
	left: 10px;
	font-family: webbycaps;
	font-size: 22px;
	color: #596f2a;
`;

export const Stampper = styled.span`
	z-index: 17;
	position: absolute;
	left: 1059px;
	bottom: 56px;
	width: 892px;
	height: 328.13px;
`;

export const Person = styled.img`
	z-index: 12;
	position: absolute;
	image-rendering: pixelated;
	width: 295px;
`;

export const Passport = styled.span`
	z-index: 15;
	position: absolute;
	bottom: 500px;
	left: 496px;
	width: 458px;
	overflow: hidden;
`;

export const TotalEl = styled.div`
	z-index: 99;
	font-family: webbycaps;
	font-size: 28px;
	color: #5d544e;
	position: absolute;
`;

export const PassportOuterImage = styled.img`
	z-index: 11;
	opacity: 0;
	position: absolute;
	image-rendering: pixelated;
	left: 175px;
	width: 50px;
`;

export const SupplementaryText = styled.div`
	display: flex;
	flex-direction: column;
	z-index: 16;
	position: absolute;
	left: 0px;
	top: 400px;
	color: #5d544e;
	font-family: proggytiny;
	font-size: 32px;
`;

export const Foreground = styled.img`
	z-index: 14;
	image-rendering: pixelated;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
`;

export const Background = styled.img`
	z-index: 10;
	image-rendering: pixelated;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
`;
