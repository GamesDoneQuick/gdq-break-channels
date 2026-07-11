import { useEffect, useRef, useState } from 'react';
import { useListenFor } from 'use-nodecg';
import { GameState } from './game/types';
import { createInitialState, updateGameState } from './game/logic';

export function useRTypeGame() {
	const [gameState, setGameState] = useState<GameState>(createInitialState());
	const animationFrameRef = useRef<number | null>(null);
	const lastTimeRef = useRef<number>(Date.now());

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			const isActivationKey = e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S';
			setGameState((prev) => ({
				...prev,
				controlsEnabled: prev.controlsEnabled || isActivationKey,
				keys: prev.controlsEnabled || isActivationKey
					? {
						...prev.keys,
						[e.key]: true,
					}
					: prev.keys,
			}));
		}

		function handleKeyUp(e: KeyboardEvent) {
			setGameState((prev) => {
				if (!prev.controlsEnabled) {
					return prev;
				}

				return {
					...prev,
					keys: {
						...prev.keys,
						[e.key]: false,
					},
				};
			});
		}

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);

	useListenFor('donation', () => {
		setGameState((prev) => ({
			...prev,
			pendingEnemyWaves: prev.pendingEnemyWaves + 1,
		}));
	});

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
