import styled from '@emotion/styled';
import textbox from './assets/textbox.png';

const VictoryDialogBox = styled.div`
	bottom: 0;
	color: white;
	font-family: gdqpixel;
	font-size: 32px;
	left: 0;
	line-height: 1.25;
	margin: auto;
	padding: 72px 32px;
	position: absolute;
	right: 0;
	text-align: center;
	top: 0;
	width: 67%;
	background-image: url(${textbox});
	background-size: contain;
	background-position: center;
	background-repeat: no-repeat;
	box-sizing: border-box;
	background-origin: padding-box;
	background-clip: padding-box;

	display: flex;
	align-items: center;
	justify-content: center;
`;

export function VictoryDialog({ showVictoryDialog, monsterName }: { showVictoryDialog: boolean; monsterName: string }) {
	if (!showVictoryDialog) return null;
	return <VictoryDialogBox>Chat defeated {monsterName}!</VictoryDialogBox>;
}
