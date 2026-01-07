import styled from '@emotion/styled';
import { MonsterProps } from './types';
import { MonsterImage } from './MonsterImage';
import { HPBar } from './HPBar';
import sparkleUrl from './assets/vfx/sparkle-sheet.png';
import strikeUrl from './assets/vfx/strike-sheet.png';

const MonsterContainer = styled.div`
	position: absolute;
	top: 32px;
	right: 2%;
	width: 300px;
	height: 300px;
`;

const MonsterFrame = styled.div`
	position: relative;
	width: 300px;
	height: 300px;
	margin-top: -20px;
	margin-left: 20px;
`;

const SparkleVfx = styled.div`
	background-image: url(${sparkleUrl});
	background-size: 3636px 226px;
	background-repeat: no-repeat;
	background-position: 0 0;
	width: 280px;
	height: 280px;
	transform: scale(1);
	animation: playSparkle 0.8s steps(12) 1;
	position: absolute;
	top: 32px;
	z-index: 2;

	@keyframes playSparkle {
		from {
			background-position: 0 0;
		}
		to {
			background-position: -3636px 0;
		}
	}
`;

const StrikeVfx = styled.div`
	background-image: url(${strikeUrl});
	background-size: cover;
	background-repeat: no-repeat;
	background-position: 0 0;
	width: 280px;
	height: 280px;
	transform: scale(1);
	animation: playStrike 0.5s steps(8) 1;
	position: absolute;
	z-index: 2;

	@keyframes playStrike {
		from {
			background-position: 0 0;
		}
		to {
			background-position: -2240px 0;
		}
	}
`;

const Label = styled.div`
	font-family: gdqpixel;
	font-size: 24px;
	text-align: center;
`;

export function Monster({
	monsterName,
	onStrikeEnd,
	onSparkleEnd,
	monsterState,
	idleUrl,
	hurtUrl,
	showStrike,
	showSparkle,
	monsterHP,
	monsterMaxHP,
	onHurtAnimationEnd,
}: MonsterProps) {
	let steps = monsterName === 'Run Killer' ? 9 : 3;
	let duration = monsterName === 'Run Killer' ? 0.6 : 0.5;
	let fullSteps = monsterName === 'Run Killer' ? 18 : 9;

	if (monsterHP <= 0) {
		if (monsterName === 'Run Killer') {
			steps = 18;
			duration = 2;
		} else {
			steps = 9;
			duration = 2;
		}
	}
	return (
		<MonsterContainer>
			<Label>{monsterName}</Label>
			<MonsterFrame>
				{showStrike && <StrikeVfx onAnimationEnd={onStrikeEnd} />}
				{showSparkle && <SparkleVfx onAnimationEnd={onSparkleEnd} />}
				<MonsterImage
					state={monsterState}
					idleUrl={idleUrl}
					hurtUrl={hurtUrl}
					onHurtAnimationEnd={onHurtAnimationEnd}
					hurtDuration={duration}
					hurtSteps={steps}
					fullSteps={fullSteps}
				/>
			</MonsterFrame>
			<HPBar monsterHP={monsterHP} monsterMaxHP={monsterMaxHP} />
		</MonsterContainer>
	);
}
