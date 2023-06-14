/**
 *  @author Edmond Soun <edmond.soun@gmail.com>
 */

import { useEffect, useRef } from 'react';
import { useListenFor, useReplicant } from 'use-nodecg';

import * as PIXI from 'pixi.js';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';

import { ChannelProps, registerChannel } from '..';

import TweenNumber from '@gdq/lib/components/TweenNumber';
import type { FormattedDonation, Total } from '@gdq/types/tracker';

import styled from '@emotion/styled';

// Assets:
import background from './assets/galaga-scroll.gif';
import sheetTexture from './assets/sprites.png';
import { atlas as sheetAtlas } from './assets/atlas';

// Types:
import { GalagaEnemySpawn, GalagaEnemyState } from './types';

// Constants:
const CANVAS_WIDTH = 1092;
const CANVAS_HEIGHT = 332;
const CANVAS_TOP = 0;

const PLAYER_SHIP_X_DEFAULT = CANVAS_WIDTH / 2;
const PLAYER_SHIP_Y_DEFAULT = CANVAS_HEIGHT - 32; // 32: just padding
const PLAYER_SHIP_X_STEP = 3;
const PLAYER_SHIP_LINE_OF_SIGHT = 60;

const ENEMY_Y_STEP = 2;
const ENEMY_LOWER_BOUND = CANVAS_HEIGHT - 116;

const ENEMY_COLUMN_WIDTH = 40;
const ENEMY_COLUMN_COUNT = 18;
const ENEMY_CELL_HEIGHT = 36;
const ACTIVE_ENEMY_FIELD_WIDTH = ENEMY_COLUMN_COUNT * ENEMY_COLUMN_WIDTH;
const ACTIVE_ENEMY_FIELD_PADDING = (CANVAS_WIDTH - ACTIVE_ENEMY_FIELD_WIDTH) / 2;

const DECO_ENEMY_FIELD_WIDTH = ACTIVE_ENEMY_FIELD_PADDING;
const DECO_ENEMY_Y_OFFSET_MULTIPLIER = 20;
const DECO_ENEMY_Y_STEP = 3;

const MISSILE_SPEED = 16;
const MISSILE_SHIP_OFFSET = 16;

const DONO_FONT_SIZE = 15;

registerChannel('Galaga', 81, Galaga, {
	position: 'bottomLeft',
	handle: 'edmondsoun',
	site: 'GitHub',
});

// ================================================

export function Galaga(props: ChannelProps) {
	// Current donation total:
	const [total] = useReplicant<Total | null>('total', null);

	// Spritesheet:
	const spritesheet = useRef<PIXI.Spritesheet | null>(null);

	// Game objects to generate on load:
	const initialGameObjects = useRef<Record<string, PIXI.DisplayObject> | null>(null);

	// Enemy refs:
	const activeEnemies = useRef<GalagaEnemySpawn[]>([]);
	const decorativeEnemies = useRef<PIXI.Sprite[]>([]);

	// Player ship target queue and current target:
	const targetQueue = useRef<GalagaEnemySpawn[]>([]);
	const activeTarget = useRef<GalagaEnemySpawn | null>(null);

	const [app, canvasRef] = usePIXICanvas(
		{
			width: 1092,
			height: 332,
			transparent: true,
		},
		() => {
			if (!initialGameObjects.current || !spritesheet.current) return;

			const playerShip = initialGameObjects.current.playerShip as PIXI.Sprite;
			const container = initialGameObjects.current.container as PIXI.Container;

			// DECORATIVE ENEMIES
			// Generate batches of decorative enemies to fly by and fill space:
			const decoEnemies = decorativeEnemies.current;

			if (decoEnemies.length < 3) {
				let enemyName: string;
				const randomValue = Math.floor(Math.random() * 10);

				if (randomValue === 0) {
					enemyName = 'enemyBoss';
				} else if (randomValue > 4) {
					enemyName = 'enemyButterfly';
				} else {
					enemyName = 'enemyBee';
				}
				const newDecoEnemy = new PIXI.Sprite(spritesheet.current.textures[enemyName]);
				const xPlacement =
					Math.random() > 0.5
						? Math.ceil((DECO_ENEMY_FIELD_WIDTH - ENEMY_COLUMN_WIDTH) * Math.random())
						: CANVAS_WIDTH - Math.floor((DECO_ENEMY_FIELD_WIDTH - ENEMY_COLUMN_WIDTH) * Math.random());

				newDecoEnemy.x = xPlacement;
				newDecoEnemy.y = CANVAS_HEIGHT * Math.ceil(Math.random() * DECO_ENEMY_Y_OFFSET_MULTIPLIER);
				newDecoEnemy.width *= 0.75;
				newDecoEnemy.height *= 0.75;

				container.addChild(newDecoEnemy);
				decoEnemies.push(newDecoEnemy);
			}

			// Move decorative enemies and destroy them when they pass the lower
			// edge of the canvas:
			if (decoEnemies.length) {
				for (let i = 0; i < decoEnemies.length; i++) {
					const decoEnemy = decoEnemies[i];
					decoEnemy.y -= DECO_ENEMY_Y_STEP;

					if (decoEnemy.y < CANVAS_TOP - ENEMY_CELL_HEIGHT) {
						decoEnemy.destroy();
						decoEnemies.splice(i, 1);
					}
				}
			}

			// ACTIVE ENEMIES (DONATIONS)
			// Loop over all active enemies and perform actions:
			for (let i = 0; i < activeEnemies.current.length; i++) {
				const currentEnemy = activeEnemies.current[i];
				const enemySprite = activeEnemies.current[i].sprite;

				if (currentEnemy.state === GalagaEnemyState.SPAWNING) {
					enemySprite.anchor.set(0.5);
					enemySprite.angle = 180;

					// Place enemy in its designated column:
					enemySprite.x = ACTIVE_ENEMY_FIELD_PADDING + ENEMY_COLUMN_WIDTH * currentEnemy.column;

					// Set spawn point slightly off-screen:
					enemySprite.y = CANVAS_TOP - enemySprite.height;

					// Add the sprite to the canvas and update state:
					container.addChild(enemySprite);
					currentEnemy.state = GalagaEnemyState.TRAVELLING;
				} else if (currentEnemy.state === GalagaEnemyState.TRAVELLING) {
					// Look at enemies ahead of currentEnemy to determine if
					// one is PARKED in the next cell. If so, do not move
					// currentEnemy forward. Switch currentEnemy state to
					// PARKED:
					for (let j = i - 1; j >= 0; j--) {
						const forwardEnemy = activeEnemies.current[j];

						if (forwardEnemy.state === GalagaEnemyState.PARKED) {
							if (
								forwardEnemy.sprite.x === enemySprite.x &&
								forwardEnemy.sprite.y < enemySprite.y + ENEMY_CELL_HEIGHT
							) {
								currentEnemy.state = GalagaEnemyState.PARKED;
							}
						}
					}

					// Enemy ship has reached the bottom bound and parks:
					if (enemySprite.y >= ENEMY_LOWER_BOUND) {
						currentEnemy.state = GalagaEnemyState.PARKED;
					}

					// When enemy becomes "visible" to playerShip,
					// add it to the targetted queue:
					if (enemySprite.y > PLAYER_SHIP_LINE_OF_SIGHT && !currentEnemy.targetted) {
						targetQueue.current.push(currentEnemy);
						currentEnemy.targetted = true;
					}

					// Travel:
					enemySprite.y += ENEMY_Y_STEP;
				} else if (currentEnemy.state === GalagaEnemyState.PARKED) {
					if (enemySprite.angle > 0) enemySprite.angle -= 15;
				}
			}

			// PLAYERSHIP
			// Return ship to home if no targets:
			if (targetQueue.current.length === 0 && playerShip.x !== PLAYER_SHIP_X_DEFAULT) {
				if (playerShip.x < PLAYER_SHIP_X_DEFAULT) {
					playerShip.x += 1;
				}
				if (playerShip.x > PLAYER_SHIP_X_DEFAULT) {
					playerShip.x -= 1;
				}
			}

			// If there are targets queued and the ship has no active target,
			// dequeue next target:
			if (targetQueue.current.length && !activeTarget.current) {
				activeTarget.current = targetQueue.current.shift()!;
			}

			// If ship has a target:
			if (activeTarget.current) {
				const enemy = activeTarget.current;
				const enemySprite = activeTarget.current.sprite;

				const enemyLeftFiringBound = enemySprite.x - enemySprite.width / 2 + 8;
				const enemyRightFiringBound = enemySprite.x + enemySprite.width / 2 - 8;

				// Ship is in the same column as the target and can fire:
				if (between(playerShip.x, enemyLeftFiringBound, enemyRightFiringBound)) {
					enemy.missile = new PIXI.Sprite(spritesheet.current.textures.missile);

					enemy.missile.anchor.set(0.5);
					enemy.missile.x = playerShip.x;
					enemy.missile.y = playerShip.y - MISSILE_SHIP_OFFSET;

					container.addChild(enemy.missile);
					activeTarget.current = null;
				}

				// Not in firing range; move ship:
				if (Math.abs(enemySprite.x - playerShip.x) > 8) {
					// Track fast when far away:
					if (playerShip.x < enemySprite.x) {
						playerShip.x += PLAYER_SHIP_X_STEP * 2;
					}
					if (playerShip.x > enemySprite.x) {
						playerShip.x -= PLAYER_SHIP_X_STEP * 2;
					}
				} else {
					// Track slow when close:
					if (playerShip.x < enemySprite.x) {
						playerShip.x += PLAYER_SHIP_X_STEP;
					}
					if (playerShip.x > enemySprite.x) {
						playerShip.x -= PLAYER_SHIP_X_STEP;
					}
				}
			}

			// MISSILES
			// Check and move missiles towards targets. Currently, a
			// missile is strictly attached to the enemy it was fired at to
			// simplify collision:
			for (let i = 0; i < activeEnemies.current.length; i++) {
				const enemy = activeEnemies.current[i];
				const missile = enemy.missile;

				if (missile) {
					missile.y -= MISSILE_SPEED;

					if (missile.y < enemy.sprite.y) {
						enemy.state = GalagaEnemyState.DESTROYED;

						enemy.sprDestroy = new PIXI.AnimatedSprite(spritesheet.current.animations.destroy);

						enemy.sprDestroy.anchor.set(0.5);
						enemy.sprDestroy.x = enemy.sprite.x;
						enemy.sprDestroy.y = enemy.sprite.y;
						enemy.sprDestroy.loop = false;
						enemy.sprDestroy.animationSpeed = 0.25;

						enemy.sprDestroy.onComplete = function () {
							// Display donation total:
							enemy.donoText = new PIXI.Text(`$${enemy.donoAmt}`, donoTextStyle);
							enemy.donoText.anchor.set(0.5);
							enemy.donoText.x = enemy.sprDestroy!.x;
							enemy.donoText.y = enemy.sprDestroy!.y;

							enemy.sprDestroy!.destroy();
							container.addChild(enemy.donoText);

							setTimeout(() => {
								if (!enemy.donoText) return;
								if (enemy.donoText.destroyed) return;

								enemy.donoText!.destroy();
							}, 5000);
						};

						container.addChild(enemy.sprDestroy);
						enemy.sprDestroy.play();

						missile.destroy();
						enemy.sprite.destroy();
						// remove enemy object from our list of active enemies
						// to examine while destroy animation plays:
						activeEnemies.current.splice(i, 1);
					}
				}
			}
		},
	);

	/**  Wait for changes to app (PIXICanvas). */
	useEffect(() => {
		if (!app.current) return;

		// Create a new container for our ship and add to canvas:
		const container = new PIXI.Container();
		app.current.stage.addChild(container);

		// Create spritesheet instance:
		spritesheet.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(sheetTexture), sheetAtlas);

		// Parse spritesheet asycronously and then set initial sprites:
		spritesheet.current.parse().then(() => {
			if (!spritesheet.current) return;

			const playerShip = new PIXI.Sprite(spritesheet.current.textures.ship);
			initialGameObjects.current = {
				container,
				playerShip,
			};

			playerShip.x = PLAYER_SHIP_X_DEFAULT;
			playerShip.y = PLAYER_SHIP_Y_DEFAULT;
			playerShip.anchor.set(0.5, 0.5);
			container.addChild(initialGameObjects.current.playerShip);
		});

		// CLEANUP
		// Tear down contents of spritesheet and objects state:
		return () => {
			for (const key in initialGameObjects.current) {
				const sprite = initialGameObjects.current[key];
				if (!sprite.destroyed) sprite.destroy(true);
			}

			for (const sprite of decorativeEnemies.current) {
				if (!sprite.destroyed) sprite.destroy(true);
			}

			for (const enemy of activeEnemies.current) {
				if (!enemy.sprite.destroyed) enemy.sprite.destroy(true);
				if (enemy.sprDestroy && !enemy.sprDestroy.destroyed) enemy.sprDestroy.destroy(true);
				if (enemy.missile && !enemy.missile.destroyed) enemy.missile.destroy(true);
				if (enemy.donoText && !enemy.donoText.destroyed) enemy.donoText.destroy(true);
			}

			for (const enemy of targetQueue.current) {
				const sprite = enemy.sprite;
				if (!sprite.destroyed) sprite.destroy(true);
			}

			if (activeTarget.current) {
				const enemy = activeTarget.current;
				if (!enemy.sprite.destroyed) enemy.sprite.destroy(true);
				if (enemy.missile && !enemy.missile.destroyed) enemy.missile.destroy(true);
			}

			spritesheet.current?.destroy(true);
		};
	}, [app]);

	/** Listen for an incoming donation.
	 *
	 * When a donation is received:
	 * - select the correct enemy type
	 * - package up enemy into object containing all relevant data for game loop
	 * - push enemy object into donation queue
	 **/
	useListenFor('donation', (donation: FormattedDonation) => {
		if (!spritesheet.current) return;

		let enemy;
		if (donation.rawAmount < 25) {
			enemy = 'enemyBee';
		} else if (donation.rawAmount < 100) {
			enemy = 'enemyButterfly';
		} else {
			enemy = 'enemyBoss';
		}

		activeEnemies.current.push({
			enemy,
			sprite: new PIXI.Sprite(spritesheet.current.textures[enemy]),
			state: GalagaEnemyState.SPAWNING,
			column: Math.ceil(Math.random() * ENEMY_COLUMN_COUNT),
			targetted: false,
			missile: null,
			sprDestroy: null,
			donoText: null,
			donoAmt: Math.floor(donation.rawAmount),
		});
	});

	return (
		<Container>
			<TopText>HIGH SCORE</TopText>
			<TotalText>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalText>
			<Canvas ref={canvasRef} />
		</Container>
	);
}

// Helper function to determine if enemy is in firing range:
function between(x: number, min: number, max: number): Boolean {
	return x >= min && x <= max;
}

// PIXI styles:
const donoTextStyle = new PIXI.TextStyle({
	fontFamily: 'gdqpixel',
	fontSize: DONO_FONT_SIZE,
	stroke: 'black',
	strokeThickness: 15,
	fill: 'red',
	padding: 5,
});

// Standard styles:
const TotalText = styled.div`
	font-family: gdqpixel;
	font-size: 15px;
	color: #ff0000;

	position: absolute;

	left: 50%;
	top: 35px;

	text-align: center;
	transform: translate(-50%, 0);
	z-index: 1;
`;

const TopText = styled.div`
	font-family: gdqpixel;
	font-size: 15px;
	color: #ffffff;

	position: absolute;

	left: 50%;
	top: 10px;

	text-align: center;
	transform: translate(-50%, 0);
	z-index: 1;
`;

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	background: url('${background}');
	background-position: center;
	padding: 0;
	margin: 0;
`;

const Canvas = styled.canvas`
	position: absolute;
	width: 100% !important;
	height: 100% !important;
`;
