import { useEffect, useMemo } from 'react';
import { GameManager, SerializedGameManager } from './tetrisai/gdq/game_manager';

const tetrisRep = nodecg.Replicant<SerializedGameManager | null>('tetris-game', {
	defaultValue: null,
	persistent: true,
});

export function useGameManager() {
	const manager = useMemo(() => {
		if (tetrisRep.value) return GameManager.deserialize(tetrisRep.value);
		else return new GameManager();
	}, []);

	useEffect(() => {
		if (!manager) return;

		manager.endTurnCb = () => {
			tetrisRep.value = manager.serialize();
		};

		manager.startTurn();

		return () => {
			tetrisRep.value = manager.serialize();
			manager.stop();
		};
	}, [manager]);

	return manager;
}
