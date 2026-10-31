import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import {
	BattleChipDef,
	BackgroundDef,
	BossDef,
	DialogSet,
	Speaker,
	SpriteTilePosition,
} from './types';
import {
	adjacentTiles,
	bossInChipZone,
	bossTileAtOffset,
	bossTileCol,
	randomBackground,
	randomBoss,
	randomChip,
	shuffle,
	tileCol,
	tileRow,
	useTypewriter,
	weightedRandomTile,
} from './helpers';
import MMBN_CONSTS from './config';

import { useListenFor } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { useEffect, useRef, useState } from 'react';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import * as PIXI from 'pixi.js';

import sheetTexture from './assets/atlas.png';
import sheetAtlas from './assets/atlas.json';
import battleGrid from './assets/battle-grid.png';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';

/**************************************************
 * 
 * MegaMan Battle Network channel - basically a 
 * boss battle a la MMBN3. Megaman moves on his own.
 * Donations give him battlechips. Every so often
 * a supporting character will jump in and say a line
 * or two. 
 * 
 ************************************************/

registerChannel('MMBN', 300, mmbn, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'Introlysis',
});

function mmbn(props: ChannelProps) {
	const [event] = usePreloadedReplicant<Event>('currentEvent');
	const [shownTotal, setShownTotal] = useState<number>(
		usePreloadedReplicant<Total | null>('total', null)[0]?.raw ?? 0,
	);
	const [lastDonation, setLastDonation] = useState(0);

	const [ready, setReady] = useState(false);
	const objects = useRef<Record<string, PIXI.DisplayObject> | null>(null);
	const spritesheet = useRef<PIXI.Spritesheet | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	const [boss, setBoss] = useState<BossDef>(() => randomBoss());
	const [bossHealth, setBossHealth] = useState<number>(boss.health);
	const bossRef = useRef<BossDef>(boss);
	const boss_position = useRef<SpriteTilePosition>('center');
	const bossMoving = useRef(false);
	const bossMoveTimeout = useRef<number>(0);
	const bossDying = useRef(false);
	const explosions = useRef<PIXI.AnimatedSprite[]>([]);
	const deathTimeouts = useRef<number[]>([]);

	const mm_exe_position = useRef<SpriteTilePosition>('center');
	const mmMoving = useRef(false);
	const mmMoveTimeout = useRef<number>(0);
	const mmFireTimeout = useRef<number>(0);
	const busterFiring = useRef(false);
	const chargeState = useRef(0);
	const chargeTimeout = useRef<number>(0);

	const chipQueue = useRef<BattleChipDef[]>([]);
	const chipSprites = useRef<PIXI.Sprite[]>([]);
	const chipUsing = useRef(false);
	const chipUseTimeout = useRef<number>(0);
	const chipQueuedAt = useRef<number>(0);
	const [chipVersion, setChipVersion] = useState(0);
	const chipRepeatLeft = useRef(0);
	const chipRepeatTimeout = useRef<number>(0);
	const projectileFired = useRef(false);
	const chipExplosions = useRef<PIXI.AnimatedSprite[]>([]);

	const [dialogText, setDialogText] = useState('');
	const [speaker, setSpeaker] = useState<Speaker>('lan');
	const { typed: typedDialog, done: dialogDone } = useTypewriter(dialogText, MMBN_CONSTS.DIALOG_TYPEWRITER_MS_PER_CHAR);
	const dialogQueue = useRef<DialogSet[]>(
		[MMBN_CONSTS.DIALOG_SETS[0], ...shuffle(MMBN_CONSTS.DIALOG_SETS.slice(1))].map((set) => [...set]),
	);
	const dialogSetGapTimeout = useRef<number>(0);

	//Line bling (boss death)
	const lineState = useRef({ line: 0, segment: 0, lastReveal: 0 });
	const lineContainers = useRef<PIXI.Container[]>([]);

	const [background] = useState<BackgroundDef>(() => randomBackground());

	const speak = (who: Speaker, text: string) => {
		setSpeaker(who);
		setDialogText(text);
	};

	const resetLines = () => {
		for (const c of lineContainers.current) {
			for (const child of c.children) child.visible = false;
		}
		lineState.current = { line: 0, segment: 0, lastReveal: performance.now() };
	};

	const revealNextLineSegment = () => {
		const st = lineState.current;
		const container = lineContainers.current[st.line];
		if (!container) return;
		const n = st.segment;
		container.children[n].visible = true;
		st.segment++;
		st.lastReveal = performance.now();
	};

	const advanceLine = () => {
		const st = lineState.current;
		const prevContainer = lineContainers.current[st.line];
		if (prevContainer) {
			for (const child of prevContainer.children) child.visible = false;
		}
		st.line = (st.line + 1) % MMBN_CONSTS.LINE_DIRECTIONS.length;
		st.segment = 0;
		if (st.line === 0) {
			st.lastReveal = performance.now() + MMBN_CONSTS.LINE_CYCLE_GAP_MS;
		}
	};

	/************************************************************
	 * The actual PIXICanvas
	 ************************************************************/
	const [app, canvasRef] = usePIXICanvas({ width: MMBN_CONSTS.CANVAS_W, height: MMBN_CONSTS.CANVAS_H }, () => {
		if (!objects.current || !spritesheet.current) return;

		const boss = objects.current.boss as PIXI.AnimatedSprite;
		const bossHealthText = objects.current.bossHealth as PIXI.Text;
		const busterCharge = objects.current.busterCharge as PIXI.AnimatedSprite;

		//the line bling animation upon boss death
		if (bossDying.current) {
			const st = lineState.current;
			const now = performance.now();
			if (now - st.lastReveal >= MMBN_CONSTS.LINE_REVEAL_DELAY_MS) {
				if (st.segment < MMBN_CONSTS.LINE_SEGMENTS) {
					revealNextLineSegment();
				} else {
					advanceLine();
				}
			}
		}

		const [exe_x, exe_y] = MMBN_CONSTS.MM_EXE_TILE_POSITION[mm_exe_position.current];
		const [boss_x, boss_y] = MMBN_CONSTS.BOSS_TILE_POSITION[boss_position.current];

		const megaMan = objects.current.megaMan as PIXI.AnimatedSprite;
		const idleFrame = spritesheet.current!.animations.mm_exe_idle[0];
		const idleW = idleFrame.width * MMBN_CONSTS.SPRITE_SCALE;
		const idleH = idleFrame.height * MMBN_CONSTS.SPRITE_SCALE;
		busterCharge.x = exe_x + idleW / 2;
		busterCharge.y = exe_y - idleH / 2;

		//battlechip fan position
		const headX = exe_x + idleW /2;
		const headY = exe_y - idleH - 25
		for (let i = 0; i < chipSprites.current.length; i++) {
			const spr = chipSprites.current[i];
			if (!spr.visible) continue;
			spr.x = headX - i * MMBN_CONSTS.CHIP_FAN_OFFSET_X;
			spr.y = headY - i * MMBN_CONSTS.CHIP_FAN_OFFSET_Y;
		}

		if (!bossDying.current) {
			boss.x = boss_x;
			boss.y = boss_y;

			bossHealthText.x = boss_x;
			bossHealthText.y = boss_y;
		}
	});

	//boss movement logic
	const moveBoss = () => {
		if (!objects.current || !spritesheet.current) return;
		if (bossMoving.current) return;
		if (bossDying.current) return;

		const boss = objects.current.boss as PIXI.AnimatedSprite;
		const ghostFrom = objects.current.bossMoveGhostFrom as PIXI.AnimatedSprite;
		const ghostTo = objects.current.bossMoveGhostTo as PIXI.AnimatedSprite;

		const tiles = Object.keys(MMBN_CONSTS.BOSS_TILE_POSITION) as SpriteTilePosition[];
		const currentTile = boss_position.current;
		const otherTiles = tiles.filter((t) => t !== currentTile);

		//if the next chip is shortRange, we try to get the boss to 
		//walk to the front row
		const frontChip = chipQueue.current[0];
		const favorFrontCol = frontChip?.shortRange === true;
		const newTile = weightedRandomTile(otherTiles, (tile) =>
			favorFrontCol && bossTileCol(tile) === 0
				? MMBN_CONSTS.BOSS_MOVE_WEIGHT_FRONT_COL
				: MMBN_CONSTS.BOSS_MOVE_WEIGHT_DEFAULT,
		);
		if (!newTile) return;

		const [oldX, oldY] = MMBN_CONSTS.BOSS_TILE_POSITION[currentTile];
		const [newX, newY] = MMBN_CONSTS.BOSS_TILE_POSITION[newTile];

		bossMoving.current = true;

		const moveAnim = spritesheet.current.animations[bossRef.current.moveAnim];
		ghostFrom.textures = moveAnim;
		ghostTo.textures = [...moveAnim].reverse();
		ghostFrom.anchor.set(bossRef.current.anchor[0], bossRef.current.anchor[1]);
		ghostTo.anchor.set(bossRef.current.anchor[0], bossRef.current.anchor[1]);

		ghostFrom.x = oldX;
		ghostFrom.y = oldY;
		ghostFrom.visible = true;
		ghostFrom.play();

		boss_position.current = newTile;
		boss.x = newX;
		boss.y = newY;

		ghostTo.x = newX;
		ghostTo.y = newY;
		ghostTo.visible = true;
		ghostTo.play();

		let completed = 0;
		const onGhostDone = () => {
			completed++;
			if (completed < 2) return;
			ghostFrom.visible = false;
			ghostTo.visible = false;
			bossMoving.current = false;
			if (bossDying.current) return;
			bossMoveTimeout.current = window.setTimeout(moveBoss, MMBN_CONSTS.BOSS_MOVE_BASE_DELAY_MS + Math.random() * MMBN_CONSTS.BOSS_MOVE_JITTER_MS);
		};
		ghostFrom.onComplete = onGhostDone;
		ghostTo.onComplete = onGhostDone;
	};

	const startCharge = (level: 1 | 2) => {
		const busterCharge = objects.current?.busterCharge as PIXI.AnimatedSprite | undefined;
		if (!busterCharge || busterCharge.destroyed || !spritesheet.current) return;
		const anim =
			spritesheet.current.animations[
				level === 2 ? 'buster_charge_2' : 'buster_charge_1'
			];
		const alpha = level === 2 ? 0.7 : 0.9;
		busterCharge.alpha = alpha;
		busterCharge.textures = anim;
		busterCharge.animationSpeed = 1 / 2;
		busterCharge.loop = true;
		busterCharge.visible = true;
		busterCharge.play();
	};

	const stopCharge = () => {
		const busterCharge = objects.current?.busterCharge as PIXI.AnimatedSprite | undefined;
		if (!busterCharge || busterCharge.destroyed) return;
		busterCharge.visible = false;
		busterCharge.stop();
	};

	const beginCharge = () => {
		chargeState.current = 1;
		startCharge(1);
		window.clearTimeout(chargeTimeout.current);
		chargeTimeout.current = window.setTimeout(() => {
			chargeState.current = 2;
			startCharge(2);
			chargeTimeout.current = window.setTimeout(() => {
				chargeState.current = 3;
			}, MMBN_CONSTS.MM_CHARGE_LEVEL2_MS);
		}, MMBN_CONSTS.MM_CHARGE_LEVEL1_MS);
	};

	const fireMegaBuster = () => {
		if (!objects.current || !spritesheet.current) return;
		if (busterFiring.current || mmMoving.current || chipUsing.current) return;

		if (tryUseChip()) return;

		if (chipRepeatLeft.current > 0) return;

		if (bossDying.current) return;

		if (chargeState.current === 1 || chargeState.current === 2) return;

		if (chargeState.current === 0 && Math.random() < MMBN_CONSTS.MM_CHARGE_SHOT_CHANCE) {
			beginCharge();
			return;
		}

		if (tileRow(mm_exe_position.current) != tileRow(boss_position.current)) return;

		const isChargeShot = chargeState.current === 3;
		if (isChargeShot) {
			chargeState.current = 0;
			stopCharge();
		}

		const megaMan = objects.current.megaMan as PIXI.AnimatedSprite;

		const [exe_x, exe_y] = MMBN_CONSTS.MM_EXE_TILE_POSITION[mm_exe_position.current];

		busterFiring.current = true;
		megaMan.textures = spritesheet.current.animations.mm_exe_buster;
		megaMan.anchor.set(0, 1);
		megaMan.x = exe_x;
		megaMan.y = exe_y;
		megaMan.loop = false;
		megaMan.play();
		megaMan.onComplete = () => {
			if (megaMan.destroyed) return;
			busterFiring.current = false;

			const [cx, cy] = MMBN_CONSTS.MM_EXE_TILE_POSITION[mm_exe_position.current];
			megaMan.textures = spritesheet.current!.animations.mm_exe_idle;
			megaMan.loop = true;
			megaMan.anchor.set(0, 0);
			megaMan.x = cx;
			megaMan.y = cy - megaMan.height;
			megaMan.play();
			megaMan.onComplete = null;

			resolveShot(isChargeShot);
		};
	};

	const resolveShot = (isChargeShot: boolean) => {
		if (!objects.current || !spritesheet.current) return;
		if (bossDying.current) return;

		const busterImpact = objects.current.busterImpact as PIXI.AnimatedSprite;
		const boss = objects.current.boss as PIXI.AnimatedSprite;

		const hit = tileRow(mm_exe_position.current) === tileRow(boss_position.current);
		if (!hit) {
			return;
		}

		const damage = isChargeShot ? MMBN_CONSTS.MM_CHARGE_SHOT_DAMAGE : MMBN_CONSTS.MM_BASE_DAMAGE;
		setBossHealth((health) => Math.max(0, Math.round(health - damage)));

		busterImpact.textures = spritesheet.current.animations[
			isChargeShot ? 'charged_impact' : 'mm_buster_impact'
		];

		const bossCenterX = boss.x;
		const bossCenterY = boss.y - boss.height / 2;
		const jitter = Math.random() * MMBN_CONSTS.BUSTER_IMPACT_JITTER;
		const offsets: [number, number][] = [
			[0, -jitter],
			[0, jitter],
			[jitter, 0],
			[-jitter, 0],
		];
		const [ox, oy] = offsets[Math.floor(Math.random() * offsets.length)];

		busterImpact.anchor.set(0.5, 0.5);
		busterImpact.x = bossCenterX + ox;
		busterImpact.y = bossCenterY + oy;
		busterImpact.loop = false;
		busterImpact.visible = true;
		busterImpact.play();
		busterImpact.onComplete = () => {
			busterImpact.visible = false;
			busterImpact.onComplete = null;
		};
	};

	/************************************************************
	  Battlechip logic
	 ************************************************************/

	const updateChipSprites = () => {
		if (!objects.current || !spritesheet.current) return;
		const megaMan = objects.current.megaMan as PIXI.AnimatedSprite;
		if (megaMan.destroyed) return;

		const [exe_x, exe_y] = MMBN_CONSTS.MM_EXE_TILE_POSITION[mm_exe_position.current];
		const idleFrame = spritesheet.current.animations.mm_exe_idle[0];
		const headX = exe_x + (idleFrame.width * MMBN_CONSTS.SPRITE_SCALE) / 2;
		const headY = exe_y - idleFrame.height * MMBN_CONSTS.SPRITE_SCALE - 8;

		const container = objects.current.container as PIXI.Container;
		while (chipSprites.current.length < MMBN_CONSTS.CHIP_VISIBLE_MAX) {
			const spr = new PIXI.Sprite();
			spr.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			spr.visible = false;
			container.addChild(spr);
			chipSprites.current.push(spr);
		}

		//makes sure the chips show up with the most recent one in the back
		for (const spr of chipSprites.current) container.removeChild(spr);
		for (let i = chipSprites.current.length - 1; i >= 0; i--) {
			container.addChild(chipSprites.current[i]);
		}

		const visible = Math.min(chipQueue.current.length, MMBN_CONSTS.CHIP_VISIBLE_MAX);
		for (let i = 0; i < MMBN_CONSTS.CHIP_VISIBLE_MAX; i++) {
			const spr = chipSprites.current[i];
			if (i < visible) {
				const chip = chipQueue.current[i];
				const tex = spritesheet.current.textures[chip.texture];
				if (tex) {
					spr.texture = tex;
					spr.visible = true;
					spr.x = headX - i * MMBN_CONSTS.CHIP_FAN_OFFSET_X;
					spr.y = headY - i * MMBN_CONSTS.CHIP_FAN_OFFSET_Y;
				}
			} else {
				spr.visible = false;
			}
		}
	};

	const updateChipInfoText = () => {
		const text = objects.current?.currentChipInfo as PIXI.Text | undefined;
		if (!text || text.destroyed) return;
		const chip = chipQueue.current[0];
		if (chip) {
			text.text = `${chip.name}${chip.damage}`;
			text.visible = true;
		} else {
			text.text = '';
			text.visible = false;
		}
	};

	const showChipImpact = (chip: BattleChipDef, x: number, y: number) => {
		if (!objects.current || !spritesheet.current) return;
		const busterImpact = objects.current.busterImpact as PIXI.AnimatedSprite;
		if (busterImpact.destroyed) return;
		const impactAnim = chip.impactAnimation;
		if (impactAnim) {
			busterImpact.textures = spritesheet.current.animations[chip.impactAnimation];
			busterImpact.anchor.set(0.5, 0.5);
			if (chip.impactJitter) {
				const boss = objects.current.boss as PIXI.AnimatedSprite;
				const bossCenterX = boss.x;
				const bossCenterY = boss.y - boss.height / 2;
				const jitter = chip.impactJitter;
				busterImpact.x = bossCenterX + (Math.random() * 2 - 1) * jitter;
				busterImpact.y = bossCenterY + (Math.random() * 2 - 1) * jitter;
			} else {
				busterImpact.x = x;
				busterImpact.y = y;
			}
			busterImpact.loop = false;
			busterImpact.visible = true;
			busterImpact.play();
			busterImpact.onComplete = () => {
				busterImpact.visible = false;
				busterImpact.onComplete = null;
			};
		};
	};

	const playChipExplosion = (x: number, y: number, animName: string) => {
		if (!spritesheet.current) return;
		const anim = spritesheet.current.animations[animName];
		if (!anim) return;
		const spr = chipExplosions.current.find((s) => !s.visible && !s.destroyed);
		if (!spr) return;
		spr.textures = anim;
		spr.anchor.set(0.5, 0.5);
		spr.x = x;
		spr.y = y - MMBN_CONSTS.MM_EXE_TILE_DY / 2;
		spr.loop = false;
		spr.visible = true;
		spr.play();
		spr.onComplete = () => {
			if (spr.destroyed) return;
			spr.visible = false;
			spr.onComplete = null;
		};
	};

	const showBlast = (chip: BattleChipDef, x: number, y: number) => {
		const animName = chip.impactAnimation ?? 'explosion';
		for (const [dx, dy] of chip.blastRadius ?? []) {
			playChipExplosion(x + dx * MMBN_CONSTS.MM_EXE_TILE_DX, y + dy * MMBN_CONSTS.MM_EXE_TILE_DY, animName);
		}
	};

	const fireChipProjectile = (chip: BattleChipDef): boolean => {
		if (!objects.current || !spritesheet.current || !app.current) return false;
		const container = objects.current.container as PIXI.Container;

		const [exe_x, exe_y] = MMBN_CONSTS.MM_EXE_TILE_POSITION[mm_exe_position.current];

		const animName = chip.projectileAnim!;
		const anim =
			spritesheet.current.animations[animName] ??
			(spritesheet.current.textures[animName]
				? [spritesheet.current.textures[animName]]
				: undefined);
		if (!anim) return false;

		const proj = new PIXI.AnimatedSprite(anim);
		proj.scale.set(MMBN_CONSTS.SPRITE_SCALE);
		proj.anchor.set(0.5, 0.5);
		proj.x = exe_x - 20;
		proj.y = exe_y - 20;
		proj.visible = true;
		proj.play();
		container.addChild(proj);

		const startX = proj.x;
		const startY = proj.y;
		const duration = chip.projectileDuration ?? 500;
		const arc = (chip.projectileArc ?? 0) * MMBN_CONSTS.SPRITE_SCALE;
		const startTime = performance.now();

		let endX: number;
		let endY: number;
		let landingTile: SpriteTilePosition | null = null;
		const targetTile = boss_position.current;
		if (chip.projectileRange) {
			const throwTile = mm_exe_position.current;
			const landCol = tileCol(throwTile) + chip.projectileRange;
			const landRow = tileRow(throwTile);
			const [refX, refY] = MMBN_CONSTS.BOSS_TILE_POSITION['top-left'];
			const targetX = refX + (landCol - 3) * MMBN_CONSTS.MM_EXE_TILE_DX;
			const targetY = refY + landRow * MMBN_CONSTS.MM_EXE_TILE_DY;
			landingTile = (Object.entries(MMBN_CONSTS.BOSS_TILE_POSITION) as [SpriteTilePosition, [number, number]][]).find(
				([, [x, y]]) => x === targetX && y === targetY,
			)?.[0] ?? null;
			if (landingTile) {
				[endX, endY] = MMBN_CONSTS.BOSS_TILE_POSITION[landingTile];
			} else {
				endX = exe_x + chip.projectileRange * MMBN_CONSTS.MM_EXE_TILE_DX;
				endY = exe_y;
			}
		} else {
			const [boss_x, boss_y] = MMBN_CONSTS.BOSS_TILE_POSITION[boss_position.current];
			endX = boss_x;
			endY = boss_y - 20;
		}

		const tick = () => {
			if (proj.destroyed || !app.current) {
				app.current?.ticker.remove(tick);
				return;
			}
			//flies in an arc
			const t = Math.min(1, (performance.now() - startTime) / duration);
			proj.x = startX + (endX - startX) * t;
			proj.y = startY + (endY - startY) * t - arc * 4 * t * (1 - t);

			if (t >= 1) {
				app.current.ticker.remove(tick);
				proj.destroy();
				let hit: boolean;
				if (chip.projectileRange) {
					if (landingTile === null) {
						hit = false;
					} else {
						const blastTiles = new Set<SpriteTilePosition>([landingTile]);
						for (const [dx, dy] of chip.blastRadius ?? []) {
							const blastTile = bossTileAtOffset(landingTile, dx, dy);
							if (blastTile) blastTiles.add(blastTile);
						}
						hit = blastTiles.has(boss_position.current);
					}
				} else {
					hit = boss_position.current === targetTile;
				}
				if (!bossDying.current && hit) {
					setBossHealth((health) => Math.max(0, Math.round(health - chip.damage)));
				}
				if (chip.blastRadius) {
					showBlast(chip, endX, endY);
				} else if (hit && !bossDying.current) {
					showChipImpact(chip, endX, endY);
				}
			}
		};
		app.current.ticker.add(tick);
		return true;
	};

	//same teleport ghost as the bosses
	const playMmTeleport = (fromPos: [number, number], toPos: [number, number]) => {
		if (!objects.current || !spritesheet.current) return;
		const ghostFrom = objects.current.mmMoveGhostFrom as PIXI.AnimatedSprite;
		const ghostTo = objects.current.mmMoveGhostTo as PIXI.AnimatedSprite;
		if (ghostFrom.destroyed || ghostTo.destroyed) return;
		const anim = spritesheet.current.animations.movement_ghost;
		if (!anim) return;

		const [fx, fy] = fromPos;
		const [tx, ty] = toPos;

		ghostFrom.textures = anim;
		ghostTo.textures = [...anim].reverse();
		ghostFrom.anchor.set(0.5, 1);
		ghostTo.anchor.set(0.5, 1);
		ghostFrom.x = fx + MMBN_CONSTS.MM_EXE_TILE_DX / 2;
		ghostFrom.y = fy;
		ghostFrom.visible = true;
		ghostFrom.play();
		ghostTo.x = tx + MMBN_CONSTS.MM_EXE_TILE_DX / 2;
		ghostTo.y = ty;
		ghostTo.visible = true;
		ghostTo.play();

		let completed = 0;
		const onGhostDone = () => {
			completed++;
			if (completed < 2) return;
			ghostFrom.visible = false;
			ghostTo.visible = false;
		};
		ghostFrom.onComplete = onGhostDone;
		ghostTo.onComplete = onGhostDone;
	};

	const useChip = (chip: BattleChipDef) => {
		if (!objects.current || !spritesheet.current) return;
		const megaMan = objects.current.megaMan as PIXI.AnimatedSprite;
		if (megaMan.destroyed) return;

		chargeState.current = 0;
		window.clearTimeout(chargeTimeout.current);
		stopCharge();

		if (chip.repeat && chipRepeatLeft.current === 0) {
			chipRepeatLeft.current = chip.repeat;
		}

		const [exe_x, exe_y] = MMBN_CONSTS.MM_EXE_TILE_POSITION[mm_exe_position.current];
		projectileFired.current = chip.projectileAnim ? fireChipProjectile(chip) : false;
		const anim = spritesheet.current.animations[chip.useAnim];
		if (!anim) {
			applyChipEffect(chip);
			return;
		}

		const [anchor_x, anchor_y] = chip.animationAnchor;
		const [off_x, off_y] = chip.animationOffset ?? [0, 0];
		const [step_x, step_y] = chip.preUseOffset ?? [0, 0];
		const stepPxX = step_x * MMBN_CONSTS.MM_EXE_TILE_DX;
		const stepPxY = step_y * MMBN_CONSTS.MM_EXE_TILE_DY;
		//for step sword, step cross, etc
		if (step_x !== 0 || step_y !== 0) {
			playMmTeleport([exe_x, exe_y], [exe_x + stepPxX, exe_y + stepPxY]);
		}
		chipUsing.current = true;
		megaMan.animationSpeed = chip.animationSpeed;
		megaMan.textures = anim;
		megaMan.anchor.set(anchor_x, anchor_y);
		megaMan.x = exe_x + off_x * MMBN_CONSTS.SPRITE_SCALE + stepPxX;
		megaMan.y = exe_y + off_y * MMBN_CONSTS.SPRITE_SCALE + stepPxY;

		megaMan.loop = false;
		megaMan.play();

		//for chips that have secondary animations (swords have the sword slash trail for example)
		let secondary: PIXI.AnimatedSprite | null = null;
		if (chip.secondaryAnim) {
			const secAnim = spritesheet.current.animations[chip.secondaryAnim];
			if (secAnim) {
				const container = objects.current.container as PIXI.Container;
				const [sec_x, sec_y] = chip.secondaryAnimOffset ?? [0, 0];
				secondary = new PIXI.AnimatedSprite(secAnim);
				secondary.scale.set(MMBN_CONSTS.SPRITE_SCALE);
				const [sec_anchor_x, sec_anchor_y] = chip.secondaryAnimAnchor ?? [0.5, 1];
				secondary.anchor.set(sec_anchor_x, sec_anchor_y);
				const secAnimSpeed = chip.secondaryAnimSpeed ?? 1/2;
				secondary.animationSpeed = secAnimSpeed;
				secondary.x = exe_x + sec_x * MMBN_CONSTS.SPRITE_SCALE + stepPxX;
				secondary.y = exe_y + sec_y * MMBN_CONSTS.SPRITE_SCALE + stepPxY;
				secondary.loop = false;
				secondary.play();
				container.addChild(secondary);
			}
		}

		megaMan.onComplete = () => {
			if (megaMan.destroyed) return;
			if (secondary && !secondary.destroyed) secondary.destroy();
			const [cx, cy] = MMBN_CONSTS.MM_EXE_TILE_POSITION[mm_exe_position.current];
			if (step_x !== 0 || step_y !== 0) {
				playMmTeleport([cx + stepPxX, cy + stepPxY], [cx, cy]);
			}
			megaMan.textures = spritesheet.current!.animations.mm_exe_idle;
			megaMan.animationSpeed = 1/2;
			megaMan.loop = true;
			megaMan.anchor.set(0, 0);
			megaMan.x = cx;
			megaMan.y = cy - megaMan.height;
			megaMan.play();
			megaMan.onComplete = null;
			chipUsing.current = false;
			applyChipEffect(chip);
		};
	};

	const applyChipEffect = (chip: BattleChipDef) => {
		const fired = projectileFired.current;
		projectileFired.current = false;
		if (!fired) {
			const [boss_x, boss_y] = MMBN_CONSTS.BOSS_TILE_POSITION[boss_position.current];
			const inZone = bossInChipZone(chip, mm_exe_position.current, boss_position.current);
			if (inZone) {
				setBossHealth((health) => Math.max(0, Math.round(health - chip.damage)));
			}
			if (chip.blastRadius) {
				const [exe_x, exe_y] = MMBN_CONSTS.MM_EXE_TILE_POSITION[mm_exe_position.current];
				const [zx, zy] = chip.hitZone[0] ?? [0, 0];
				showBlast(chip, exe_x + zx * MMBN_CONSTS.MM_EXE_TILE_DX, exe_y + zy * MMBN_CONSTS.MM_EXE_TILE_DY);
			} else if (inZone) {
				showChipImpact(chip, boss_x, boss_y);
			}
		}
		if (chipRepeatLeft.current > 1) {
			chipRepeatLeft.current--;
			window.clearTimeout(chipRepeatTimeout.current);
			chipRepeatTimeout.current = window.setTimeout(() => {
				if (chipRepeatLeft.current > 0 && !chipUsing.current && chipQueue.current.length > 0) {
					useChip(chipQueue.current[0]);
				}
			}, MMBN_CONSTS.CHIP_REPEAT_INTERVAL_MS);
			return;
		}
		chipRepeatLeft.current = 0;
		chipQueue.current.shift();
		updateChipSprites();
		updateChipInfoText();
		armChipTimeout();
	};

	const tryUseChip = (): boolean => {
		if (chipQueue.current.length === 0 || chipUsing.current) return false;
		const chip = chipQueue.current[0];
		if (chipRepeatLeft.current > 0) {
			window.clearTimeout(chipUseTimeout.current);
			return true;
		}
		if (bossDying.current) return false;
		const inZone = bossInChipZone(chip, mm_exe_position.current, boss_position.current);
		const timeoutExpired = performance.now() - chipQueuedAt.current >= MMBN_CONSTS.CHIP_USE_TIMEOUT_MS;
		if (inZone || timeoutExpired) {
			window.clearTimeout(chipUseTimeout.current);
			useChip(chip);
			return true;
		}
		return false;
	};

	const armChipTimeout = () => {
		window.clearTimeout(chipUseTimeout.current);
		if (chipQueue.current.length === 0) return;
		chipQueuedAt.current = performance.now();
		chipUseTimeout.current = window.setTimeout(() => {
			if (
				chipQueue.current.length > 0 &&
				!chipUsing.current &&
				!bossDying.current &&
				!busterFiring.current &&
				!mmMoving.current
			) {
				useChip(chipQueue.current[0]);
			}
		}, MMBN_CONSTS.CHIP_USE_TIMEOUT_MS);
	};

	//megaman moves randomly to adjacent tiles only. He's more likely to
	//move to the row the boss is on, and if he has a chip he's more likely
	//to move so the boss is in-range for whatever chip he's using
	const moveMegaMan = () => {
		if (!objects.current || !spritesheet.current) return;
		if (mmMoving.current || busterFiring.current || chipUsing.current || chipRepeatLeft.current > 0) return;

		const megaMan = objects.current.megaMan as PIXI.AnimatedSprite;

		const currentTile = mm_exe_position.current;
		const candidates = adjacentTiles(currentTile);
		if (candidates.length === 0) return;

		const frontChip = chipQueue.current[0];

		const targetTile = weightedRandomTile(candidates, (tile) => {
			if (frontChip && bossInChipZone(frontChip, tile, boss_position.current)) {
				return MMBN_CONSTS.MM_MOVE_WEIGHT_CHIP_ZONE;
			}
			return tileRow(tile) === tileRow(boss_position.current)
				? MMBN_CONSTS.MM_MOVE_WEIGHT_SAME_ROW
				: MMBN_CONSTS.MM_MOVE_WEIGHT_OTHER_ROW;
		});
		if (!targetTile) return;

		const [cx, cy] = MMBN_CONSTS.MM_EXE_TILE_POSITION[currentTile];
		const [nx, ny] = MMBN_CONSTS.MM_EXE_TILE_POSITION[targetTile];

		mmMoving.current = true;
		megaMan.anchor.set(0, 0);
		megaMan.x = cx;
		megaMan.y = cy - megaMan.height;
		megaMan.textures = spritesheet.current.animations.mm_exe_moving;
		megaMan.animationSpeed = MMBN_CONSTS.MM_EXE_MOVE_SPEED;
		megaMan.loop = false;
		megaMan.play();
		megaMan.onComplete = () => {
			if (megaMan.destroyed) return;
			mm_exe_position.current = targetTile;
			megaMan.x = nx;
			megaMan.y = ny - megaMan.height;
			megaMan.textures = [...spritesheet.current!.animations.mm_exe_moving].reverse();
			megaMan.loop = false;
			megaMan.play();
			megaMan.onComplete = () => {
				if (megaMan.destroyed) return;
				mmMoving.current = false;
				megaMan.textures = spritesheet.current!.animations.mm_exe_idle;
				megaMan.animationSpeed = 1 / 2;
				megaMan.loop = true;
				megaMan.play();
				megaMan.onComplete = null;
			};
		};
	};

	const scheduleFire = () => {
		window.clearTimeout(mmFireTimeout.current);
		mmFireTimeout.current = window.setTimeout(() => {
			fireMegaBuster();
			scheduleFire();
		}, MMBN_CONSTS.MM_FIRE_BASE_DELAY_MS + Math.random() * MMBN_CONSTS.MM_FIRE_JITTER_MS);
	};

	const scheduleMove = () => {
		window.clearTimeout(mmMoveTimeout.current);
		mmMoveTimeout.current = window.setTimeout(() => {
			moveMegaMan();
			scheduleMove();
		}, MMBN_CONSTS.MM_MOVE_BASE_DELAY_MS + Math.random() * MMBN_CONSTS.MM_MOVE_JITTER_MS);
	};

	/****************************************************
	 * Main useEffect that gets loaded on mount
	 *
	 ******************************************************/
	useEffect(() => {
		if (!app.current) return;
		let cancelled = false;

		const container = new PIXI.Container();
		app.current.stage.addChild(container);

		const battleGridSprite = new PIXI.Sprite(PIXI.Texture.from(battleGrid));
		battleGridSprite.scale.set(MMBN_CONSTS.SPRITE_SCALE);
		battleGridSprite.x = (MMBN_CONSTS.CANVAS_W - MMBN_CONSTS.BATTLE_GRID_W * 2) / 2 + MMBN_CONSTS.BATTLE_GRID_OFFSET_X;
		battleGridSprite.y = (MMBN_CONSTS.CANVAS_H - MMBN_CONSTS.BATTLE_GRID_H * 2) / 2 + MMBN_CONSTS.BATTLE_GRID_OFFSET_Y;
		container.addChild(battleGridSprite);

		spritesheet.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(sheetTexture), sheetAtlas);
		spritesheet.current.parse().then(async () => {
			if (cancelled || !spritesheet.current) return;

			await Promise.all([
				document.fonts.load('700 28px bn6boss'),
				document.fonts.load('100 26px bn6speaking'),
			]);

			objects.current = {
				container,
				megaMan: new PIXI.AnimatedSprite(spritesheet.current.animations.mm_exe_idle),
				boss: new PIXI.AnimatedSprite(spritesheet.current.animations[boss.idleAnim]),
				cust_gauge: new PIXI.AnimatedSprite(spritesheet.current.animations.custom),
				dialogSprite: new PIXI.AnimatedSprite(spritesheet.current.animations.Lan_talking),
				busterCharge: new PIXI.AnimatedSprite(spritesheet.current.animations.buster_charge_1),
				bossName: new PIXI.Text(boss.name, {
					fontFamily: 'bn6boss',
					fontSize: 28,
					fontWeight: '700',
					fill: 0xffffff,
					stroke: 0x000000,
					strokeThickness: 4,
					dropShadow: true,
					dropShadowDistance: 2,
					dropShadowAngle: Math.PI / 4,
				}),
				bossHealth: new PIXI.Text(bossHealth, {
					fontFamily: 'bn6boss',
					fontSize: 28,
					fontWeight: '700',
					fill: 0xffffff,
					stroke: 0x000000,
					strokeThickness: 4,
					dropShadow: true,
					dropShadowDistance: 2,
					dropShadowAngle: Math.PI / 4,
				}),
				currentChipInfo: new PIXI.Text('', {
					fontFamily: 'bn6boss',
					fontSize: 24,
					fontWeight: '700',
					fill: 0xffffff,
					stroke: 0x000000,
					strokeThickness: 4,
				}),
				busterImpact: new PIXI.AnimatedSprite(spritesheet.current.animations.mm_buster_impact),
				mmMoveGhostFrom: new PIXI.AnimatedSprite(spritesheet.current.animations.movement_ghost),
				mmMoveGhostTo: new PIXI.AnimatedSprite([...spritesheet.current.animations.movement_ghost].reverse()),
				bossMoveGhostFrom: new PIXI.AnimatedSprite(spritesheet.current.animations[boss.moveAnim]),
				bossMoveGhostTo: new PIXI.AnimatedSprite([...spritesheet.current.animations[boss.moveAnim]].reverse()),
				deathBling: new PIXI.AnimatedSprite(spritesheet.current.animations.bling),
			};

			const [exe_x, exe_y] = MMBN_CONSTS.MM_EXE_TILE_POSITION[mm_exe_position.current];
			const [boss_x, boss_y] = MMBN_CONSTS.BOSS_TILE_POSITION[boss_position.current];

			const megaMan = objects.current.megaMan as PIXI.AnimatedSprite;
			megaMan.animationSpeed = 1/2;
			megaMan.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			megaMan.play();
			megaMan.x = exe_x;
			megaMan.y = exe_y - megaMan.height;
			container.addChild(megaMan);

			const busterCharge = objects.current.busterCharge as PIXI.AnimatedSprite;
			busterCharge.animationSpeed = 1 / 2;
			busterCharge.alpha = 0.6;
			busterCharge.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			busterCharge.anchor.set(0.5, 0.5);
			busterCharge.x = megaMan.x + megaMan.width / 2;
			busterCharge.y = megaMan.y + megaMan.height / 2;
			busterCharge.visible = false;
			container.addChild(busterCharge);

			const bossSprite = objects.current.boss as PIXI.AnimatedSprite;
			bossSprite.animationSpeed = boss.animationSpeed;
			bossSprite.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			bossSprite.play();
			bossSprite.anchor.set(boss.anchor[0], boss.anchor[1]);
			bossSprite.x = boss_x;
			bossSprite.y = boss_y;
			container.addChild(bossSprite);

			const bossMoveGhostFrom = objects.current.bossMoveGhostFrom as PIXI.AnimatedSprite;
			bossMoveGhostFrom.animationSpeed = 1/2;
			bossMoveGhostFrom.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			bossMoveGhostFrom.anchor.set(0.5, 1);
			bossMoveGhostFrom.visible = false;
			bossMoveGhostFrom.loop = false;
			container.addChild(bossMoveGhostFrom);

			const bossMoveGhostTo = objects.current.bossMoveGhostTo as PIXI.AnimatedSprite;
			bossMoveGhostTo.animationSpeed = 1/2;
			bossMoveGhostTo.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			bossMoveGhostTo.anchor.set(0.5, 1);
			bossMoveGhostTo.visible = false;
			bossMoveGhostTo.loop = false;
			container.addChild(bossMoveGhostTo);

			const mmMoveGhostFrom = objects.current.mmMoveGhostFrom as PIXI.AnimatedSprite;
			mmMoveGhostFrom.animationSpeed = MMBN_CONSTS.MM_GHOST_ANIMATION_SPEED;
			mmMoveGhostFrom.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			mmMoveGhostFrom.anchor.set(0.5, 1);
			mmMoveGhostFrom.visible = false;
			mmMoveGhostFrom.loop = false;
			container.addChild(mmMoveGhostFrom);

			const mmMoveGhostTo = objects.current.mmMoveGhostTo as PIXI.AnimatedSprite;
			mmMoveGhostTo.animationSpeed = MMBN_CONSTS.MM_GHOST_ANIMATION_SPEED;
			mmMoveGhostTo.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			mmMoveGhostTo.anchor.set(0.5, 1);
			mmMoveGhostTo.visible = false;
			mmMoveGhostTo.loop = false;
			container.addChild(mmMoveGhostTo);

			const custom = objects.current.cust_gauge as PIXI.AnimatedSprite;
			custom.animationSpeed = 1/12;
			custom.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			custom.play();
			custom.x = MMBN_CONSTS.CUSTOM_GAUGE_X;
			custom.y = MMBN_CONSTS.CUSTOM_GAUGE_Y;
			container.addChild(custom);

			const hp_gauge_box = new PIXI.Sprite(spritesheet.current.textures['hp_gauge_box.png']);
			hp_gauge_box.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			hp_gauge_box.x = MMBN_CONSTS.HP_GAUGE_BOX_X;
			hp_gauge_box.y = MMBN_CONSTS.HP_GAUGE_BOX_Y;
			container.addChild(hp_gauge_box);

			const MM_HEALTH = MMBN_CONSTS.MM_HEALTH;
			const DIGIT_W = MMBN_CONSTS.MM_HEALTH_DIGIT_W;
			const DIGIT_SPACING = MMBN_CONSTS.MM_HEALTH_DIGIT_SPACING;
			const mmHealth = new PIXI.Container();
			for (let i = 0; i < MM_HEALTH.length; i++) {
				const digit = new PIXI.Sprite(spritesheet.current.textures[`${MM_HEALTH[i]}.png`]);
				digit.x = i * (DIGIT_W + DIGIT_SPACING);
				mmHealth.addChild(digit);
			}
			mmHealth.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			const mmHealthW = (MM_HEALTH.length * DIGIT_W + (MM_HEALTH.length - 1) * DIGIT_SPACING) * MMBN_CONSTS.SPRITE_SCALE;
			mmHealth.x = MMBN_CONSTS.MM_HEALTH_X - mmHealthW - MMBN_CONSTS.MM_HEALTH_GAP;
			mmHealth.y = MMBN_CONSTS.MM_HEALTH_Y;
			container.addChild(mmHealth);

			const bossNameText = objects.current.bossName as PIXI.Text;
			bossNameText.anchor.set(1, 0);
			bossNameText.x = MMBN_CONSTS.CANVAS_W - MMBN_CONSTS.BOSS_NAME_MARGIN_X;
			bossNameText.y = MMBN_CONSTS.BOSS_NAME_Y;
			container.addChild(bossNameText);

			const currentChipInfo = objects.current.currentChipInfo as PIXI.Text;
			currentChipInfo.anchor.set(0, 0);
			currentChipInfo.x = MMBN_CONSTS.CANVAS_W / 4 + 30;
			currentChipInfo.y = MMBN_CONSTS.CHIP_INFO_Y;
			currentChipInfo.visible = false;
			container.addChild(currentChipInfo);

			const bossHealthText = objects.current.bossHealth as PIXI.Text;
			bossHealthText.anchor.set(0.5, 0);
			bossHealthText.x = bossSprite.x;
			bossHealthText.y = bossSprite.y;
			container.addChild(bossHealthText);

			const dialogSprite = objects.current.dialogSprite as PIXI.AnimatedSprite;
			dialogSprite.animationSpeed = 1 / 5;
			dialogSprite.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			dialogSprite.anchor.set(0, 1);
			dialogSprite.x = MMBN_CONSTS.DIALOG_PORTRAIT_X;
			dialogSprite.y = MMBN_CONSTS.DIALOG_PORTRAIT_Y;
			dialogSprite.visible = false;
			container.addChild(dialogSprite);

			const busterImpact = objects.current.busterImpact as PIXI.AnimatedSprite;
			busterImpact.animationSpeed = 1 / 2;
			busterImpact.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			busterImpact.anchor.set(0, 1);
			busterImpact.x = bossSprite.x;
			busterImpact.y = bossSprite.y;
			busterImpact.visible = false;
			busterImpact.play();
			container.addChild(busterImpact);

			const deathBling = objects.current.deathBling as PIXI.AnimatedSprite;
			deathBling.animationSpeed = 1/4;
			deathBling.scale.set(MMBN_CONSTS.SPRITE_SCALE);
			deathBling.anchor.set(0.5, 0.5);
			deathBling.x = bossSprite.x;
			deathBling.y = bossSprite.y;
			deathBling.visible = false;
			deathBling.play();
			container.addChild(deathBling);

			//bosses get a set number of explosions on death. I've set it at 11 initially, to try and match the game
			explosions.current = [];
			for (let i = 0; i < MMBN_CONSTS.BOSS_DEATH_EXPLOSION_COUNT; i++) {
				const explosion = new PIXI.AnimatedSprite(
					spritesheet.current.animations[MMBN_CONSTS.BOSS_DEATH_EXPLOSION_ANIM],
				);
				explosion.animationSpeed = .75;
				explosion.scale.set(MMBN_CONSTS.SPRITE_SCALE);
				explosion.anchor.set(0.5, 0.5);
				explosion.loop = false;
				explosion.visible = false;
				container.addChild(explosion);
				explosions.current.push(explosion);
			}

			chipExplosions.current = [];
			for (let i = 0; i < MMBN_CONSTS.CHIP_EXPLOSION_POOL_SIZE; i++) {
				const explosion = new PIXI.AnimatedSprite(
					spritesheet.current.animations[MMBN_CONSTS.BOSS_DEATH_EXPLOSION_ANIM],
				);
				explosion.animationSpeed = 1 / 2;
				explosion.scale.set(MMBN_CONSTS.SPRITE_SCALE);
				explosion.anchor.set(0.5, 0.5);
				explosion.loop = false;
				explosion.visible = false;
				container.addChild(explosion);
				chipExplosions.current.push(explosion);
			}

			//this is for the death bling animation
			const tileSize = 16 * MMBN_CONSTS.SPRITE_SCALE;
			lineContainers.current = [];
			for (const { texture, dir, startOffset } of MMBN_CONSTS.LINE_DIRECTIONS) {
				const lineContainer = new PIXI.Container();
				for (let n = 0; n < MMBN_CONSTS.LINE_SEGMENTS; n++) {
					const spr = new PIXI.Sprite(
						spritesheet.current.animations[texture][n],
					);
					const d = MMBN_CONSTS.LINE_CIRCLE_RADIUS + n * tileSize;
					spr.x = dir[0] * d - startOffset[0] * tileSize;
					spr.y = dir[1] * d - startOffset[1] * tileSize;
					spr.scale.set(MMBN_CONSTS.SPRITE_SCALE);
					spr.visible = false;
					lineContainer.addChild(spr);
				}
				container.addChild(lineContainer);
				lineContainers.current.push(lineContainer);
			}

			bossMoveTimeout.current = window.setTimeout(moveBoss, MMBN_CONSTS.BOSS_MOVE_BASE_DELAY_MS + Math.random() * MMBN_CONSTS.BOSS_MOVE_JITTER_MS);
			scheduleFire();
			scheduleMove();

			updateChipSprites();

			setReady(true);
		});

		return () => {
			cancelled = true;
			window.clearTimeout(bossMoveTimeout.current);
			window.clearTimeout(mmFireTimeout.current);
			window.clearTimeout(mmMoveTimeout.current);
			window.clearTimeout(chargeTimeout.current);
			window.clearTimeout(chipUseTimeout.current);
			window.clearTimeout(dialogSetGapTimeout.current);
			window.clearTimeout(chipRepeatTimeout.current);
			for (const id of deathTimeouts.current) window.clearTimeout(id);
			deathTimeouts.current = [];
			for (const s of chipSprites.current) {
				if (!s.destroyed) s.destroy();
			}
			chipSprites.current = [];
			chipQueue.current = [];
			chipRepeatLeft.current = 0;
			chipExplosions.current = [];
			explosions.current = [];
			lineContainers.current = [];
			bossMoving.current = false;
			bossDying.current = false;
			mmMoving.current = false;
			busterFiring.current = false;
			chargeState.current = 0;
			chipUsing.current = false;
			projectileFired.current = false;
			container.destroy(true);
			objects.current = null;
			spritesheet.current?.destroy(true);
			spritesheet.current = null;
		};
	}, [app]);

	useEffect(() => {
		bossRef.current = boss;
	}, [boss]);

	useEffect(() => {
		const bossSprite = objects.current?.boss as PIXI.AnimatedSprite | undefined;
		if (!bossSprite || bossSprite.destroyed || !spritesheet.current) return;
		bossSprite.textures = spritesheet.current.animations[boss.idleAnim];
		bossSprite.anchor.set(boss.anchor[0], boss.anchor[1]);
		bossSprite.animationSpeed = boss.animationSpeed;
		bossSprite.loop = true;
		bossSprite.onComplete = null;
		bossSprite.play();
		resetLines();
		setBossHealth(boss.health);
	}, [boss]);

	//boss death useEffect
	useEffect(() => {
		if (bossHealth > 0) return;

		const bossSprite = objects.current?.boss as PIXI.AnimatedSprite | undefined;
		const deathBling = objects.current?.deathBling as PIXI.AnimatedSprite | undefined;
		if (!bossSprite || bossSprite.destroyed || !spritesheet.current) return;
		if (bossDying.current) return;

		bossDying.current = true;

		bossSprite.textures = spritesheet.current.animations[bossRef.current.deathAnim];
		bossSprite.loop = true;
		bossSprite.play();

		const [ax, ay] = bossRef.current.anchor;
		const cx = bossSprite.x - ax * bossSprite.width + bossSprite.width / 2;
		const cy = bossSprite.y - ay * bossSprite.height + bossSprite.height / 2;
		for (const c of lineContainers.current) {
			c.x = cx;
			c.y = cy;
		}
		resetLines();
		const fireExplosion = () => {
			const spr = explosions.current[Math.floor(Math.random() * explosions.current.length)];
			if (!spr || spr.destroyed) return;
			const jitter = MMBN_CONSTS.BOSS_DEATH_EXPLOSION_JITTER;
			spr.x = cx + (Math.random() * 2 - 1) * jitter;
			spr.y = cy + (Math.random() * 2 - 1) * jitter;
			spr.visible = true;
			spr.loop = false;
			spr.gotoAndPlay(0);
			spr.onComplete = () => {
				if (spr.destroyed) return;
				spr.visible = false;
				spr.onComplete = null;
			};

		};

		const duration = MMBN_CONSTS.BOSS_DEATH_DURATION_MS;
		const count = MMBN_CONSTS.BOSS_DEATH_EXPLOSION_COUNT;
		for (let i = 0; i < count; i++) {
			deathTimeouts.current.push(
				window.setTimeout(fireExplosion, (duration / count) * i),
			);
		}

		if (!deathBling || deathBling.destroyed || !spritesheet.current) return;
		deathBling.visible = true;
		deathBling.x = cx
		deathBling.y = cy
		deathBling.gotoAndPlay(0);

		deathTimeouts.current.push(
			window.setTimeout(() => {
				for (const e of explosions.current) {
					if (e && !e.destroyed) e.visible = false;
				}
				deathBling.visible = false;
				bossDying.current = false;
				setBoss((prev) => {
					const pool = MMBN_CONSTS.BOSSES.length > 1 ? MMBN_CONSTS.BOSSES.filter((b) => b.name !== prev.name) : MMBN_CONSTS.BOSSES;
					const next = pool[Math.floor(Math.random() * pool.length)];
					return { ...next };
				});
				window.clearTimeout(bossMoveTimeout.current);
				bossMoveTimeout.current = window.setTimeout(moveBoss, MMBN_CONSTS.BOSS_MOVE_BASE_DELAY_MS + Math.random() * MMBN_CONSTS.BOSS_MOVE_JITTER_MS);
				deathTimeouts.current = [];
			}, duration),
		);
	}, [bossHealth]);

	useEffect(() => {
		const bossNameText = objects.current?.bossName as PIXI.Text | undefined;
		if (!bossNameText || bossNameText.destroyed) return;
		bossNameText.text = boss.name;
	}, [boss]);

	useEffect(() => {
		updateChipInfoText();
	}, [chipVersion, ready]);

	useEffect(() => {
		const bossHealthText = objects.current?.bossHealth as PIXI.Text | undefined;
		if (!bossHealthText || bossHealthText.destroyed) return;
		bossHealthText.text = String(bossHealth);
		bossHealthText.visible = !bossDying.current;
	}, [bossHealth]);

	useEffect(() => {
		if (!ready || dialogText) return;
		const queue = dialogQueue.current;
		const dropped = queue.length > 0 && queue[0].length === 0;
		while (queue.length > 0 && queue[0].length === 0) queue.shift();
		if (queue.length === 0) return;
		if (dropped) {
			window.clearTimeout(dialogSetGapTimeout.current);
			dialogSetGapTimeout.current = window.setTimeout(() => {
				const next = dialogQueue.current[0]?.shift();
				if (next) speak(next.speaker, next.text);
			}, MMBN_CONSTS.DIALOG_SET_GAP_MS);
			return;
		}
		const next = queue[0].shift();
		if (next) speak(next.speaker, next.text);
	}, [dialogText, ready]);

	useEffect(() => {
		if (!dialogDone) return;

		const sprite = objects.current?.dialogSprite as PIXI.AnimatedSprite | undefined;
		if (!sprite || sprite.destroyed) return;
		sprite.textures = spritesheet.current!.animations[MMBN_CONSTS.SPEAKER_ANIMATIONS[speaker].blinking];
		sprite.loop = false;
		sprite.play();
		sprite.onComplete = () => {
			if (sprite.destroyed) return;
			sprite.textures = spritesheet.current!.animations[MMBN_CONSTS.SPEAKER_ANIMATIONS[speaker].idle];
		};

		const id = window.setTimeout(() => {
			setDialogText('');
		}, MMBN_CONSTS.DIALOG_AUTO_HIDE_MS);
		return () => window.clearTimeout(id);
	}, [dialogDone, speaker]);

	useEffect(() => {
		const sprite = objects.current?.dialogSprite as PIXI.AnimatedSprite | undefined;
		if (!sprite || sprite.destroyed) return;

		if (dialogText) {
			const anim = spritesheet.current?.animations[MMBN_CONSTS.SPEAKER_ANIMATIONS[speaker].talking];
			if (anim) sprite.textures = anim;
			sprite.loop = true;
			sprite.play();
			sprite.visible = true;
		} else {
			sprite.visible = false;
			sprite.stop();
		}
	}, [dialogText, speaker, ready]);

	//background scrolls in a specific direction (can change depending on the background)
	//only 1 background every time the channel mounts, and it's random from the pool
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const [dx, dy] = MMBN_CONSTS.BG_DIRECTION_VECTORS[background.direction];
		const speed = MMBN_CONSTS.BG_SCROLL_SPEED;
		const tileSize = background.tileSize;
		let posX = 0;
		let posY = 0;
		let last = performance.now();
		let raf = 0;

		const frame = (now: number) => {
			const dt = (now - last) / 1000;
			last = now;
			posX = (posX + dx * speed * dt) % tileSize;
			posY = (posY + dy * speed * dt) % tileSize;
			el.style.backgroundPosition = `${posX}px ${posY}px`;
			raf = requestAnimationFrame(frame);
		};
		raf = requestAnimationFrame(frame);

		return () => cancelAnimationFrame(raf);
	}, [background]);

	useListenFor('donation', (donation: FormattedDonation) => {
		setLastDonation(donation.rawAmount);
		setShownTotal(donation.rawNewTotal);

		chipQueue.current.push(randomChip());
		updateChipSprites();
		updateChipInfoText();
		setChipVersion((v) => v + 1);
		armChipTimeout();
	});

	return (
		<Container ref={containerRef} bg={background.src}>
			<Canvas width={MMBN_CONSTS.CANVAS_W} height={MMBN_CONSTS.CANVAS_H} ref={canvasRef} />
			<TotalEl>
				$<TweenNumber value={Math.floor(shownTotal)} />
			</TotalEl>
			<SideBoxLeft>
				<SideBoxText>Latest Donation (thank you!!):<br></br>${lastDonation}</SideBoxText>
			</SideBoxLeft>
			{dialogText && (
				<DialogBox>
					<DialogText>{typedDialog}</DialogText>
				</DialogBox>
			)}
		</Container>
	);
}

const Container = styled.div<{ bg: string }>`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	background-image: url(${(p) => p.bg});
	background-repeat: repeat;
	background-position: 0 0;
`;

const Canvas = styled.canvas`
	position: absolute;
	width: 100% !important;
	height: 100% !important;
`;

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 54px;
	color: white;

	position: absolute;

	left: 32px;
	top: 26px;
	background: rgba(0, 0, 0, 0.6);
	filter: drop-shadow(0 4px 0 black);
`;

const DialogBox = styled.div`
	position: absolute;
	right: 5px;
	top: calc(50% - 20px);
	transform: none;

	box-sizing: border-box;
	width: 295px;
	padding: 10px 10px;
	background: #ffffff;
	border: 2px solid #000000;
	box-shadow: 0 0 0 2px #ffffff, 0 6px 0 rgba(0, 0, 0, 0.4);
`;

const DialogText = styled.div`
	font-family: bn6speaking;
	font-size: 26px;
	font-weight: 100;
	color: #000000;
	line-height: 1.4;
`;

const SideBoxLeft = styled.div`
	position: absolute;
	left: 16px;
	top: calc(50% - 20px);
	transform: none;

	box-sizing: border-box;
	width: 270px;
	height: 150px;
	padding: 8px;
	background: rgba(0, 0, 0, 0.6);
	border: 2px solid #ffffff;
`;

const SideBoxText = styled.div`
	font-family: bn6boss;
	font-size: 26px;
	color: #ffffff;
	line-height: 1.5;
	white-space: pre-wrap;
`;
