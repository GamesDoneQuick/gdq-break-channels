import styled from '@emotion/styled';
import hpBarFill from './assets/hpbar_fill.png';
import hpBarTop from './assets/hpbar_top.png';
import hpBar from './assets/hpbar.png';

const HPBarContainer = styled.div`
	position: absolute;
	bottom: 10px;
	width: 100%;
	height: 40px;
`;

const HPBarBackground = styled.img`
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
`;

const HPBarFill = styled.img<{ hpPercentage: number }>`
	position: absolute;
	width: calc(${(props) => props.hpPercentage * 100}% - 8px);
	height: calc(100% - 8px);
	top: 4px;
	left: 4px;
	overflow: hidden;
`;

const HPBarTop = styled.img`
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
`;

export function HPBar({ monsterHP, monsterMaxHP }: { monsterHP: number; monsterMaxHP: number }) {
	return (
		<HPBarContainer>
			<HPBarBackground src={hpBar} />
			<HPBarFill
				src={hpBarFill}
				hpPercentage={Math.max(0, Math.min(1, monsterMaxHP == 0 ? 0 : monsterHP / monsterMaxHP))}
			/>
			<HPBarTop src={hpBarTop} />
		</HPBarContainer>
	);
}
