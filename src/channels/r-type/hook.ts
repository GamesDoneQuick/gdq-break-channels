import { useEffect, useRef, useState } from 'react';
import { GameState } from './game/types';
import { createInitialState, updateGameState } from './game/logic';

export function useRTypeGame() {
	const [gameState, setGameState] = useState<GameState>(createInitialState());
	const animationFrameRef = useRef<number | null>(null);
	const lastTimeRef = useRef<number>(Date.now());

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			setGameState((prev) => ({
				...prev,
				keys: {
					...prev.keys,
					[e.key]: true,
				},
			}));
		}

		function handleKeyUp(e: KeyboardEvent) {
			setGameState((prev) => ({
				...prev,
				keys: {
					...prev.keys,
					[e.key]: false,
				},
			}));
		}

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);

	useEffect(() => {
		function gameLoop() {
			const now = Date.now();
			const deltaTime = now - lastTimeRef.current;
			lastTimeRef.current = now;

			setGameState((prev) => updateGameState(prev, deltaTime));

			animationFrameRef.current = requestAnimationFrame(gameLoop);
		}

		animationFrameRef.current = requestAnimationFrame(gameLoop);

		return () => {
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, []);

	return gameState;
}
