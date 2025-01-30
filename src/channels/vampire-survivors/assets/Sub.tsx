import styled from '@emotion/styled';
import subSprite from './sub.png';

interface SubContainerProps {
	left?: string;
	top?: string;
	height?: string;
}

const SubContainer = styled.div<SubContainerProps>`
	position: absolute;
	left: ${(props) => props.left || '45%'};
	top: ${(props) => props.top || '35%'};
	width: 320px;
	height: ${(props) => props.height || '64px'};
	font-family: gdqpixel;
	background-image: url(${subSprite});
	background-repeat: no-repeat;
	overflow: hidden;
`;

const SubPlan = styled.span`
	display: block;
	position: absolute;
	left: 16px;
	top: 12px;
	font-size: 12px;
	color: white;
`;

const SubDisplayName = styled.span`
	display: block;
	position: absolute;
	font-size: 14px;
	color: yellow;
	text-align: center;
	margin-top: 26px;
	width: 100%;
`;

export interface SubProps {
	left?: string;
	top?: string;
	height?: string;
	tick: number;
	subPlan?: string;
	displayName?: string;
}

function planToName(plan: string): string {
	switch (plan) {
		case '1000':
			return 'Tier 1';
		case '2000':
			return 'Tier 2';
		case '3000':
			return 'Tier 3';
		case 'Prime':
			return 'Prime';
		default:
			return '';
	}
}

export default function Sub({ left, top, height, subPlan, displayName }: SubProps) {
	return (
		<SubContainer left={left} top={top} height={height}>
			<SubPlan>{planToName(subPlan ? subPlan : '')}</SubPlan>
			<SubDisplayName>{displayName}</SubDisplayName>
		</SubContainer>
	);
}
