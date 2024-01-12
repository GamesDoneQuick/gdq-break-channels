import { useEffect, useMemo } from 'react';
import { GameManager, SerializedGameManager } from './tetrisai/gdq/game_manager';
import { useActive } from '@gdq/lib/hooks/useActive';

const tetrisRep = nodecg.Replicant<SerializedGameManager | null>('tetris-game', {
	defaultValue: null,
	persistent: true,
});

export function useGameManager() {
	const active = useActive();

	const manager = useMemo(() => {
		if (tetrisRep.value) return GameManager.deserialize(tetrisRep.value);
		else return new GameManager();
	}, []);

	useEffect(() => {
		if (!manager) return;

		manager.endTurnCb = () => {
			if (active) tetrisRep.value = manager.serialize();
		};

		manager.startTurn();

		return () => {
			if (active) tetrisRep.value = manager.serialize();
			manager.stop();
		};
	}, [manager, active]);

	return manager;
}
