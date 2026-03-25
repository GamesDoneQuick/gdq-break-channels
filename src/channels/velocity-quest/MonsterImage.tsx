import styled from '@emotion/styled';
import { MonsterImageProps } from './types';

const MonsterIdle = styled.div<{ idleUrl: string }>`
	background-image: url(${(props) => props.idleUrl});
	background-size: 2800px 280px;
	background-repeat: no-repeat;
	background-position: 0 0;
	width: 280px;
	height: 280px;
	transform: scale(1);
	animation: playIdle 2s steps(10) infinite;
	position: absolute;
	top: -4px;

	@keyframes playIdle {
		from {
			background-position: 0 0;
		}
		to {
			background-position: -2800px 0;
		}
	}
`;

type MonsterHurtProps = {
	hurtUrl: string;
	duration: number;
	fullSteps: number;
	steps: number;
};

/* a hit plays the first few frames */
/* but defeating them plays the full animation */
const MonsterHurt = styled.div<MonsterHurtProps>`
	background-image: url(${(props) => props.hurtUrl});
	background-size: ${({ fullSteps }) => 280 * fullSteps}px 280px;
	background-repeat: no-repeat;
	background-position: 0 0;
	width: 280px;
	height: 280px;
	transform: scale(1);
	animation: ${(props) => `playHurt ${props.duration}s steps(${props.steps}) 1`};
	animation-fill-mode: forwards;
	animation-direction: normal;
	position: absolute;

	@keyframes playHurt {
		from {
			background-position: 0 0;
		}
		to {
			background-position: ${({ steps }) => -280 * steps}px 0;
		}
	}
`;

export function MonsterImage({
	fullSteps,
	state,
	idleUrl,
	hurtUrl,
	onHurtAnimationEnd,
	hurtDuration,
	hurtSteps,
}: MonsterImageProps) {
	return (
		<>
			{state === 'idle' && <MonsterIdle idleUrl={idleUrl} />}
			{state === 'hurt' && (
				<MonsterHurt
					fullSteps={fullSteps}
					hurtUrl={hurtUrl}
					onAnimationEnd={onHurtAnimationEnd}
					duration={hurtDuration}
					steps={hurtSteps}
				/>
			)}
		</>
	);
}
