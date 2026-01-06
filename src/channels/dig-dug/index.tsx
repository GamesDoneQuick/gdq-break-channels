import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { ChannelProps, registerChannel } from '../channels';
import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { useListenFor, useReplicant } from 'use-nodecg';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { DigDugGame } from './dig-dug-game';
import { CHANNEL_WIDTH, CHANNEL_HEIGHT, COLORS } from './constants';

const Wrapper = styled.div`
	position: absolute;
	width: ${CHANNEL_WIDTH}px;
	height: ${CHANNEL_HEIGHT}px;
	background: ${`#${COLORS.BACKGROUND.toString(16).padStart(6, '0')}`};
	display: flex;
	flex-direction: column;
`;

const TopBar = styled.div`
	height: 40px;
	background: ${`#${COLORS.UI_BACKGROUND.toString(16).padStart(6, '0')}`};
	display: flex;
	align-items: center;
	justify-content: center;
	border-bottom: 2px solid ${`#${COLORS.DIRT_DARK.toString(16).padStart(6, '0')}`};
`;

const GameContainer = styled.div`
	flex: 1;
	position: relative;
	overflow: hidden;
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
	color: #ffee44;
	text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
`;

const BottomBar = styled.div`
	height: 40px;
	background: ${`#${COLORS.UI_BACKGROUND.toString(16).padStart(6, '0')}`};
	border-top: 2px solid ${`#${COLORS.DIRT_DARK.toString(16).padStart(6, '0')}`};
`;

function DigDug(props: ChannelProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const gameRef = useRef<DigDugGame | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const lastTimeRef = useRef<number>(Date.now());

	const [total] = useReplicant<Total | null>('total', null);

	// Initialize game
	useEffect(() => {
		if (!canvasRef.current) return;

		const game = new DigDugGame(canvasRef.current);
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

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
			game.destroy();
		};
	}, []);

	// Handle donations
	useListenFor('donation', (donation: FormattedDonation) => {
		if (!gameRef.current) return;

		// Show flying donation amount
		gameRef.current.showDonationAmount(donation.rawAmount);

		// Spawn collectibles and enemies based on donation amount
		gameRef.current.spawnForDonation(donation.rawAmount);
	});

	// Handle subscriptions
	useListenFor('subscription', () => {
		if (!gameRef.current) return;

		// Chain pop all enemies on screen!
		gameRef.current.chainPopAllEnemies();
	});

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

registerChannel('Dig Dug', 197, DigDug, {
	position: 'bottomRight',
	site: 'GitHub',
	handle: '@jakenbear',
});

export default DigDug;
