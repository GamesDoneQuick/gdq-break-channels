import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { ChannelProps, registerChannel } from '../channels';
import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { useListenFor, useReplicant } from 'use-nodecg';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { SnakeGame } from './snake-game';
import { CHANNEL_WIDTH, CHANNEL_HEIGHT, MILESTONE_INCREMENT } from './constants';

const Wrapper = styled.div`
	position: absolute;
	width: ${CHANNEL_WIDTH}px;
	height: ${CHANNEL_HEIGHT}px;
	background: #c7d23c;
	display: flex;
	flex-direction: column;
`;

const TopBar = styled.div`
	height: 40px;
	background: #c7d23c;
	display: flex;
	align-items: center;
	justify-content: center;
	border-bottom: 3px dotted #43523d;
`;

const GameContainer = styled.div`
	flex: 1;
	position: relative;
	border-left: 3px dotted #43523d;
	border-right: 3px dotted #43523d;
	overflow: hidden;
`;

const BottomBar = styled.div`
	height: 36px;
	background: #c7d23c;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding-right: 15px;
	border-top: 3px dotted #43523d;
`;

const Canvas = styled.canvas`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
`;

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 28px;
	color: #43523d;
	text-shadow: none;
`;

function Snake(props: ChannelProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const gameRef = useRef<SnakeGame | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const lastTimeRef = useRef<number>(Date.now());
	const previousTotal = useRef<number>(0);

	const [total] = useReplicant<Total | null>('total', null);

	// Initialize game
	useEffect(() => {
		if (!canvasRef.current) return;

		const game = new SnakeGame(canvasRef.current);
		gameRef.current = game;

		// Game loop
		const update = () => {
			const now = Date.now();
			const deltaTime = now - lastTimeRef.current;
			lastTimeRef.current = now;

			game.update(deltaTime);
			animationFrameRef.current = requestAnimationFrame(update);
		};
		update();

		const directionInterval = setInterval(() => {
			const smartDirection = game.getSmartDirection();
			if (smartDirection !== null) {
				game.setDirection(smartDirection);
			}
		}, 200);

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			clearInterval(directionInterval);
			game.destroy();
		};
	}, []);

	// Handle donations
	useListenFor('donation', (donation: FormattedDonation) => {
		if (!gameRef.current) return;

		const oldTotal = previousTotal.current;
		const newTotal = donation.rawNewTotal;

		const oldMilestone = Math.floor(oldTotal / MILESTONE_INCREMENT);
		const newMilestone = Math.floor(newTotal / MILESTONE_INCREMENT);

		if (newMilestone > oldMilestone) {
			// Lock channel during milestone animation
			props.lock();

			// Trigger milestone animations for each crossed threshold
			const milestonesCount = newMilestone - oldMilestone;
			for (let i = 0; i < milestonesCount; i++) {
				const milestoneAmount = (oldMilestone + i + 1) * MILESTONE_INCREMENT;
				setTimeout(() => {
					gameRef.current?.triggerMilestoneAnimation(milestoneAmount);
				}, i * 4500);
			}

			// Unlock channel after all animations complete
			setTimeout(() => {
				props.unlock();
			}, milestonesCount * 4500);
		}

		// Spawn food based on donation amount
		gameRef.current.spawnFoodForDonation(donation.rawAmount);

		previousTotal.current = newTotal;
	});

	// Initialize previous total when total first loads
	useEffect(() => {
		if (total && previousTotal.current === 0) {
			previousTotal.current = total.raw;
		}
	}, [total]);

	return (
		<Wrapper>
			<TopBar>
				<TotalEl>
					$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
				</TotalEl>
			</TopBar>
			<GameContainer>
				<Canvas ref={canvasRef} />
			</GameContainer>
			<BottomBar />
		</Wrapper>
	);
}

registerChannel('Snake', 98, Snake, {
	position: 'bottomRight',
	site: 'GitHub',
	handle: 'einalem4',
});

export default Snake;
