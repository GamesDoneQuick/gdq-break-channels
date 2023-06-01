import styled from '@emotion/styled';
import skyImage from './assets/sky.png';

export const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
`;

export const TotalEl = styled.div`
	position: absolute;
	font-family: gdqpixel;
	font-size: 46px;
	color: white;
	text-shadow: -1px 4px black;
	right: 15%;
	top: 35%;
	z-index: 2;
`;

export const Sky = styled.div`
	position: absolute;
	height: 100%;
	width: 100%;
	background-image: url(${skyImage});
	image-rendering: pixelated;
`;
