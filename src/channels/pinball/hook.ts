import { useEffect, useState } from 'react';
import Module from './import';
import { MainModule } from './bin/SpaceCadetPinball';

export function useGame() {
	const [game, setGame] = useState<MainModule | null>(null);

	useEffect(() => {
		let exists = true;

		Module.then((game) => {
			if (!exists) return;
			setGame(game);
		});

		return () => {
			exists = false;
		};
	}, []);

	return game;
}
