import styled from '@emotion/styled';
import eventSprite from './event.png';

interface EventBarContainerProps {
	left?: string;
	top?: string;
}

const EventBarContainer = styled.div<EventBarContainerProps>`
	position: absolute;
	left: ${(props) => props.left || '45%'};
	top: ${(props) => props.top || '35%'};
	width: 100%;
	height: 48px;
	background-image: url(${eventSprite});
	background-repeat: no-repeat;
`;

const EventInnerContainer = styled.div`
	position: relative;
	left: 6px;
	top: 7px;
`;

const EventBeneficiary = styled.span`
	display: inline-block;
	font-family: gdqpixel;
	font-size: 18px;
	color: white;
	background-color: blue;
	border-radius: 2px 0 0 2px;

	padding: 8px 8px 8px 8px;
	width: 768px;
`;

const EventName = styled.span`
	display: inline-block;
	font-family: gdqpixel;
	font-size: 18px;
	color: white;
	background-color: black;
	border-radius: 0 2px 2px 0;
	text-align: right;

	padding: 8px 8px 8px 8px;
	width: 279px;
`;

export interface EventBarProps {
	left?: string;
	top?: string;
	eventBeneficiary?: string;
	eventName?: string;
}
export default function EventBar({ left, top, eventBeneficiary, eventName }: EventBarProps) {
	return (
		<EventBarContainer left={left} top={top}>
			<EventInnerContainer>
				<EventBeneficiary>{eventBeneficiary}</EventBeneficiary>
				<EventName>{eventName}</EventName>
			</EventInnerContainer>
		</EventBarContainer>
	);
}
