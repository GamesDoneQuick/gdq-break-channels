import type { MegaManEnemyDescription } from './types';

export const MegaManEnemyList: { [enemy: string]: MegaManEnemyDescription } = {
	METTOOL: { animName: 'enemy_mettool', isGrounded: true, mustJump: false },
	SCWORM: { animName: 'enemy_scworm', isGrounded: true, mustJump: false },
	BLOCKY: { animName: 'enemy_blocky', isGrounded: true, mustJump: true, dropYOffset: -8 },
	BATTON: { animName: 'enemy_batton', isGrounded: false, mustJump: true, yOffset: 4, dropYOffset: -4 },
	TELLY: { animName: 'enemy_telly', isGrounded: false, mustJump: true },
};
const enemyListKeys = Object.keys(MegaManEnemyList);

export function getRandomEnemy(): MegaManEnemyDescription {
	const idx = Math.floor(Math.random() * enemyListKeys.length);
	return MegaManEnemyList[enemyListKeys[idx]];
}
