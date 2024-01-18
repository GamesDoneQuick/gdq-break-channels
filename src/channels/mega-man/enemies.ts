import type { MegaManEnemyDescription } from './types';

export const MegaManEnemyList: { [enemy: string]: MegaManEnemyDescription } = {
	/* Mega Man 2 */
	METTOOL: { animNames: ['enemy_mettool'], isGrounded: true, mustJump: false },
	SCWORM: { animNames: ['enemy_scwormA', 'enemy_scwormB'], isGrounded: true, mustJump: false },
	BLOCKY: { animNames: ['enemy_blockyA', 'enemy_blockyB'], isGrounded: true, mustJump: true, dropYOffset: -8 },
	BATTON: { animNames: ['enemy_batton'], isGrounded: false, mustJump: true, yOffset: 4, dropYOffset: -4 },
	TELLY: { animNames: ['enemy_telly'], isGrounded: false, mustJump: true },
	/* Mega Man 3 */
	POTTON: { animNames: ['enemy_potton'], isGrounded: false, mustJump: true, yOffset: -4, dropYOffset: 4 },
	PENPEN: { animNames: ['enemy_penpen'], isGrounded: true, mustJump: false },
	YAMBOW: { animNames: ['enemy_yambowA', 'enemy_yambowB'], isGrounded: false, mustJump: true },
	/* Mega Man 4 */
	RINGRING: { animNames: ['enemy_ringring'], isGrounded: false, mustJump: true },
	MINOAN: { animNames: ['enemy_minoan'], isGrounded: true, mustJump: false },
};
const enemyListKeys = Object.keys(MegaManEnemyList);

export function getRandomEnemy(): MegaManEnemyDescription {
	const idx = Math.floor(Math.random() * enemyListKeys.length);
	return MegaManEnemyList[enemyListKeys[idx]];
}
