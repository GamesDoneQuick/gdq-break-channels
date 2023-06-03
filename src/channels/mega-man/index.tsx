import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import { MegaManDonationQueueEntry, MegaManDonationState, MegaManEnemyList } from './types';

import { useListenFor } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { useEffect, useRef, useState } from 'react';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import * as PIXI from 'pixi.js';

import sheetTexture from './assets/atlas.png';
import sheetAtlas from './assets/atlas.json';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';
import { ScrollingBackground } from "./backgrounds";
import backgroundFactoryMM2Wily1 from "./backgrounds/mm2-wily1";

registerChannel('Mega Man', 87, MegaMan, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'Suyooo',
});

const MEGA_MAN_CONSTS = {
	QUEUE_INTERVAL: 55,
	MAX_QUEUE_LENGTH: 1,
	LARGE_PICKUP_DONATION_THRESHOLD: 100,
	MOVE_SPEED_FOREGROUND: 1,
	MOVE_SPEED_ENEMY: 2,
	MOVE_SPEED_BULLET: 4,
	MOVE_SPEED_TELEPORT: 4,
	JUMP_MEGA_MAN_INITIAL: -4,
	JUMP_MEGA_MAN_GRAVITY: 0.25,
	JUMP_PICKUP_INITIAL: -2,
	JUMP_PICKUP_GRAVITY: 0.25,
};

function MegaMan(props: ChannelProps) {
	const [shownTotal, setShownTotal] = useState<number>(
		usePreloadedReplicant<Total | null>('total', null)[0]?.raw ?? 0,
	);
	const introRunning = useRef<boolean>(true);
	const donationCountdown = useRef<number>(0);
	const donationQueue = useRef<MegaManDonationQueueEntry[]>([]);
	const liveDonations = useRef<MegaManDonationQueueEntry[]>([]);

	const megaManYSpeed = useRef<number>(0);

	const background = useRef<ScrollingBackground | null>(null);
	const objects = useRef<Record<string, PIXI.DisplayObject> | null>(null);
	const spritesheet = useRef<PIXI.Spritesheet | null>(null);

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		if (!objects.current || !spritesheet.current) return;

		const megaMan = objects.current.megaMan as PIXI.AnimatedSprite;

		if (introRunning.current) {
			// Intro animation:
			// 1) Blink "READY" (see below)
			// 2) At t=3000, Mega Man drops into frame
			// 3) Wait for collision with the ground (y=33), then play the Teleport animation
			// 4) After the teleport animation is finished, enter an idle pose, wait a second, then we start
			if (megaMan.y < 33) {
				megaMan.y += MEGA_MAN_CONSTS.MOVE_SPEED_TELEPORT;
				if (megaMan.y > 33) {
					megaMan.y = 33;
					megaMan.textures = spritesheet.current.animations.teleport;
					megaMan.play();
					megaMan.onComplete = () => {
						megaMan.loop = true;
						megaMan.animationSpeed = 1 / 8;
						megaMan.onComplete = undefined;
						megaMan.texture = spritesheet.current!.textures.stand;
						megaMan.y = 41;
						setTimeout(() => {
							if (megaMan.destroyed) return;
							introRunning.current = false;
							megaMan.textures = spritesheet.current!.animations.walk;
							megaMan.play();
						}, 1000);
					};
				}
			}
			// Return here so during the intro, all other sprites are paused
			return;
		}

		background.current?.tick();

		donationCountdown.current--;
		if (donationCountdown.current <= 0 && donationQueue.current.length > 0) {
			liveDonations.current.push(donationQueue.current.shift()!);
			donationCountdown.current = MEGA_MAN_CONSTS.QUEUE_INTERVAL;
		}

		const container = objects.current.container as PIXI.Container;

		for (const dono of liveDonations.current) {
			if (dono.state === MegaManDonationState.WAITING) {
				// Beginning to handle a new donation: Create the enemy sprite
				dono.state = MegaManDonationState.STARTED;
				dono.sprEnemy = new PIXI.AnimatedSprite(spritesheet.current.animations[dono.enemy.animName]);
				dono.sprEnemy.play();
				dono.sprEnemy.x = 288;
				dono.sprEnemy.animationSpeed = 1 / 8;
				if (dono.enemy.isGrounded) {
					dono.sprEnemy.y = 65 - dono.sprEnemy.height;
				} else {
					dono.sprEnemy.y = 25 - dono.sprEnemy.height / 2;
				}
				container.addChild(dono.sprEnemy);
			} else if (dono.state === MegaManDonationState.STARTED || dono.state === MegaManDonationState.FIRED) {
				// Enemy is still alive in these states - move it
				dono.sprEnemy!.x -= MEGA_MAN_CONSTS.MOVE_SPEED_ENEMY;

				// Wait for a bit until firing the bullet
				if (dono.state === MegaManDonationState.STARTED) {
					// If hitting the enemy requires a jump, set YSpeed
					if (dono.enemy.mustJump && megaMan.y >= 41 && dono.sprEnemy!.x <= 170) {
						megaManYSpeed.current = MEGA_MAN_CONSTS.JUMP_MEGA_MAN_INITIAL;
						megaMan.textures = [spritesheet.current.textures.jump];
					}

					// Is it time to fire?
					if (dono.sprEnemy!.x <= 150) {
						dono.state = MegaManDonationState.FIRED;
						dono.sprBullet = new PIXI.Sprite(spritesheet.current.textures.bullet);
						dono.sprBullet.x = 64;
						dono.sprBullet.y = megaMan.y + 9;
						container.addChild(dono.sprBullet);

						megaMan.textures =
							megaMan.y < 41
								? [spritesheet.current.textures.s_jump]
								: spritesheet.current.animations.s_walk;
						megaMan.play();
						setTimeout(() => {
							if (megaMan.destroyed) return;
							megaMan.textures =
								megaMan.y < 41
									? [spritesheet.current!.textures.jump]
									: spritesheet.current!.animations.walk;
							megaMan.play();
						}, 300);
					}
				} else {
					// Bullet has been fired and is travelling, check for collision
					dono.sprBullet!.x += MEGA_MAN_CONSTS.MOVE_SPEED_BULLET;
					if (dono.sprBullet!.x + dono.sprBullet!.width >= dono.sprEnemy!.x + dono.sprEnemy!.width / 2 - 8) {
						dono.sprDestroy = new PIXI.AnimatedSprite(spritesheet.current.animations.destroy);
						dono.sprDestroy.pivot.x = dono.sprDestroy.width / 2;
						dono.sprDestroy.pivot.y = dono.sprDestroy.height / 2;
						dono.sprDestroy.x = dono.sprEnemy!.x + dono.sprEnemy!.width / 2;
						dono.sprDestroy.y = dono.sprEnemy!.y + dono.sprEnemy!.height / 2;
						if (dono.enemy == MegaManEnemyList.BLOCKY) {
							dono.sprDestroy.y -= 8;
						} else if (dono.enemy == MegaManEnemyList.BATTON) {
							dono.sprDestroy.y -= 6;
						}
						dono.sprDestroy.loop = false;
						dono.sprDestroy.onComplete = () => dono.sprDestroy!.destroy();
						dono.sprDestroy.animationSpeed = 1 / 4;
						dono.sprDestroy.play();

						dono.sprEnemy!.destroy();
						dono.sprBullet!.destroy();

						let pickupAnimName: PIXI.Texture[];
						if (dono.bigPickup) {
							pickupAnimName =
								Math.random() < 0.5
									? spritesheet.current.animations.pickup_hl
									: spritesheet.current.animations.pickup_el;
						} else {
							pickupAnimName =
								Math.random() < 0.5
									? spritesheet.current.animations.pickup_hs
									: spritesheet.current.animations.pickup_es;
						}

						dono.sprPickup = new PIXI.AnimatedSprite(pickupAnimName);
						dono.sprPickup.x = dono.sprDestroy.x - dono.sprPickup.width / 2;
						dono.sprPickup.y = dono.sprDestroy.y - dono.sprPickup.height / 2;
						dono.sprPickup.animationSpeed = 1 / 6;
						dono.sprPickup.play();
						dono.sprPickupYSpeed = MEGA_MAN_CONSTS.JUMP_PICKUP_INITIAL;

						container.addChild(dono.sprDestroy, dono.sprPickup);
						dono.state = MegaManDonationState.HIT;
					}
				}
			} else {
				// currentDonation.state == MegaManDonationState.HIT
				if (!dono.sprDestroy!.destroyed) {
					dono.sprDestroy!.x -= MEGA_MAN_CONSTS.MOVE_SPEED_FOREGROUND;
				}

				dono.sprPickup!.x -= MEGA_MAN_CONSTS.MOVE_SPEED_FOREGROUND;
				if (dono.sprPickup!.y + dono.sprPickup!.height < 65 || dono.sprPickupYSpeed! <= 0) {
					dono.sprPickup!.y += dono.sprPickupYSpeed!;
					dono.sprPickupYSpeed! += MEGA_MAN_CONSTS.JUMP_PICKUP_GRAVITY;
					if (dono.sprPickup!.y + dono.sprPickup!.height > 65 && dono.sprPickupYSpeed! > 0) {
						dono.sprPickup!.y = 65 - dono.sprPickup!.height;
					}
				}

				// Check for collision between the pickup and Mega Man
				if (dono.sprPickup!.x <= 52 && megaMan.y >= 33 - dono.sprPickup!.height) {
					dono.sprPickup!.destroy();
					liveDonations.current.shift();

					// Pause all animations for 500ms (the time it takes for TweenNumber to count up)
					// By pausing the main PIXI ticker, animated sprites are also stopped
					setShownTotal(dono.newTotal);
					app.current?.ticker?.stop();
					setTimeout(() => app.current?.ticker?.start(), 500);
				}
			}
		}

		if (megaMan.y < 41 || megaManYSpeed.current < 0) {
			megaMan.y += megaManYSpeed.current;
			megaManYSpeed.current += MEGA_MAN_CONSTS.JUMP_MEGA_MAN_GRAVITY;
			if (megaMan.y >= 41 && megaManYSpeed.current > 0) {
				megaMan.y = 41;
				megaMan.textures =
					megaMan.textures[0] === spritesheet.current.textures.jump
						? spritesheet.current.animations.walk
						: spritesheet.current.animations.s_walk;
				megaMan.play();
			}
		}
	});

	useEffect(() => {
		if (!app.current) return;

		const container = new PIXI.Container();
		app.current.stage.addChild(container);
		container.setTransform(0, 0, 4, 4);

		[background.current] = backgroundFactoryMM2Wily1();
		container.addChild(background.current.getContainer());

		spritesheet.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(sheetTexture), sheetAtlas);
		spritesheet.current.parse().then(() => {
			if (!spritesheet.current) return;

			objects.current = {
				container,
				megaMan: new PIXI.AnimatedSprite([spritesheet.current.textures.teleport1]),
				ready: new PIXI.Sprite(spritesheet.current.textures.ready),
			};

			// Intro animation: Mega Man starts in the teleport sprite
			// Placed far above the camera frame, so he drops in the exact right moment
			const megaMan = objects.current.megaMan as PIXI.AnimatedSprite;
			megaMan.animationSpeed = 1 / 2;
			megaMan.play();
			megaMan.x = 32;
			megaMan.y = -32 - MEGA_MAN_CONSTS.MOVE_SPEED_TELEPORT * 180;
			megaMan.loop = false;
			container.addChild(megaMan);

			const ready = objects.current.ready as PIXI.Sprite;
			ready.x = (273 - ready.width) / 2;
			ready.y = (83 - ready.height) / 2;
			ready.alpha = 0;
			container.addChild(ready);

			// Intro animation: "READY" is blinked here
			for (let i = 0; i < 3000; i += 250) {
				setTimeout(() => {
					if (ready.destroyed) return;
					ready.alpha = 1;
				}, i + 125);
				setTimeout(() => {
					if (ready.destroyed) return;
					ready.alpha = 0;
				}, i + 250);
			}
		});

		return () => {
			background.current?.destroy();
			for (const key in objects.current) {
				const obj = objects.current[key];
				if (!obj.destroyed) obj.destroy(true);
			}

			donationQueue.current = [];
			for (const dono of liveDonations.current) {
				if (dono.sprEnemy && !dono.sprEnemy.destroyed) dono.sprEnemy.destroy(true);
				if (dono.sprBullet && !dono.sprBullet.destroyed) dono.sprBullet.destroy(true);
				if (dono.sprDestroy && !dono.sprDestroy.destroyed) dono.sprDestroy.destroy(true);
				if (dono.sprPickup && !dono.sprPickup.destroyed) dono.sprPickup.destroy(true);
			}

			spritesheet.current?.destroy(true);
		};
	}, [app]);

	useListenFor('donation', (donation: FormattedDonation) => {
		if (donationQueue.current.length >= MEGA_MAN_CONSTS.MAX_QUEUE_LENGTH) {
			// Avoid making the queue too long during donation trains, but start dropping big pickups
			const latestDonation = donationQueue.current[donationQueue.current.length - 1];
			latestDonation.newTotal = donation.rawNewTotal;
			latestDonation.bigPickup = true;
		} else {
			let enemy;
			switch (Math.floor(Math.random() * 5)) {
				case 0:
					enemy = MegaManEnemyList.METTOOL;
					break;
				case 1:
					enemy = MegaManEnemyList.SCWORM;
					break;
				case 2:
					enemy = MegaManEnemyList.BLOCKY;
					break;
				case 3:
					enemy = MegaManEnemyList.BATTON;
					break;
				default:
					enemy = MegaManEnemyList.TELLY;
					break;
			}

			donationQueue.current.push({
				state: MegaManDonationState.WAITING,
				newTotal: donation.rawNewTotal,
				enemy,
				bigPickup: donation.rawAmount >= MEGA_MAN_CONSTS.LARGE_PICKUP_DONATION_THRESHOLD,
			});
		}
	});

	return (
		<Container>
			<Canvas width={1092} height={332} ref={canvasRef} />
			<TotalShadow>
				$<TweenNumber value={Math.floor(shownTotal)} />
			</TotalShadow>
			<TotalEl>
				$<TweenNumber value={Math.floor(shownTotal)} />
			</TotalEl>
		</Container>
	);
}

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
`;

const Canvas = styled.canvas`
	position: absolute;
	width: 100% !important;
	height: 100% !important;
`;

const TotalShadow = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: black;

	position: absolute;

	left: 32px;
	top: 36px;
`;

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	position: absolute;

	left: 32px;
	top: 32px;
`;
