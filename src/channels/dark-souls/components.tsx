import styled from '@emotion/styled';
import dsFont from './fonts/EBGaramond-Regular.ttf';
import souls from './img/souls.png';

export const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
`;

export const TotalEl = styled.div`
	@font-face {
		font-family: 'darkSoulsFont';
		src: url('${dsFont}');
	}

	font-family: darkSoulsFont;
	font-size: 46px;
	color: white;
	text-align: right;
	position: absolute;
	width: 80%;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
`;

export const Video = styled.video`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
`;

export const HealthBar = styled.img`
	position: absolute;
	padding: 0;
	margin: 10px;
`;

export const TransHumanity = styled.img`
	position: absolute;
	padding: 0;
	margin-left: 90px;
	margin-top: 65px;
	width: 15px;
`;

export const Items = styled.img`
	position: absolute;
	top: 165px;
	padding: 0;
	margin-left: 25px;
`;

export const TotalWrapper = styled.div`
	background-image: url('${souls}');
	width: 300px;
	height: 67px;
	text-align: right;
	position: absolute;
	top: 250px;
	margin-left: 800px;
`;

export const HumanityCount = styled.div`
	position: absolute;
	margin-top: 13px;
	margin-left: 35px;
`;

export const HumanityNum = styled.img`
	width: 25px;
	margin-right: -6px;
`;
