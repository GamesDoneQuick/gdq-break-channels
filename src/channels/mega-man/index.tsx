import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import { MegaManCloudRow, MegaManDonationQueueEntry, MegaManDonationState, MegaManEnemyList } from './types';

import { useListenFor } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { useEffect, useRef, useState } from 'react';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import * as PIXI from 'pixi.js';

import sheetTexture from './assets/atlas.png';
import { atlas as sheetAtlas } from './assets/atlas';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';

registerChannel('Mega Man', 88, MegaMan, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'Suyooo',
});

const MEGA_MAN_CONSTS = {
	MAX_QUEUE_LENGTH: 5,
	LARGE_PICKUP_DONATION_THRESHOLD: 100,
	MOVE_SPEED_CLOUDS: 0.25,
	MOVE_SPEED_BUILDING: 0.5,
	MOVE_SPEED_FOREGROUND: 1,
	MOVE_SPEED_BULLET: 4,
	MOVE_SPEED_TELEPORT: 4,
	JUMP_MEGA_MAN_INITIAL: -4,
	JUMP_MEGA_MAN_GRAVITY: 0.25,
	JUMP_PICKUP_INITIAL: -2,
	JUMP_PICKUP_GRAVITY: 0.25,
	PARK_POSITION: 400,
};

function MegaMan(props: ChannelProps) {
	const [shownTotal, setShownTotal] = useState<number>(
		usePreloadedReplicant<Total | null>('total', null)[0]?.raw ?? 0,
	);
	const introRunning = useRef<boolean>(true);
	const donationQueue = useRef<MegaManDonationQueueEntry[]>([]);

	const megaManYSpeed = useRef<number>(0);
	const pickupYSpeed = useRef<number>(0);

	const objects = useRef<Record<string, PIXI.DisplayObject> | null>(null);
	const cloudRows = useRef<MegaManCloudRow[]>([]);
	const spritesheet = useRef<PIXI.Spritesheet | null>(null);

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		if (!objects.current || !spritesheet.current) return;

		// We must enter the cloudRow updates even if the intro is running, to set up initial cloud positions
		for (const cloudRow of cloudRows.current) {
			if (!introRunning.current) {
				cloudRow.minNextX -= MEGA_MAN_CONSTS.MOVE_SPEED_CLOUDS;
			}
			for (const cloud of cloudRow.clouds) {
				if (cloud.right.x <= -16) {
					// When setting up initial cloud positions, allow them to be placed on-screen
					const rightSide = cloudRow.initialDist ? Math.floor(Math.random() * 8) * 16 : 288;
					cloud.left.x = Math.floor(Math.random() * 8) * 16 + Math.max(rightSide, cloudRow.minNextX);
					cloud.middle.x = cloud.left.x + 16;
					cloud.middle.width = Math.floor(Math.random() * 5) * 16;
					cloud.right.x = cloud.middle.x + cloud.middle.width;
					cloudRow.minNextX = cloud.right.x + 16;
				}
				if (!introRunning.current) {
					cloud.left.x -= MEGA_MAN_CONSTS.MOVE_SPEED_CLOUDS;
					cloud.middle.x -= MEGA_MAN_CONSTS.MOVE_SPEED_CLOUDS;
					cloud.right.x -= MEGA_MAN_CONSTS.MOVE_SPEED_CLOUDS;
				}
			}
			cloudRow.initialDist = false;
		}

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
							introRunning.current = false;
							megaMan.textures = spritesheet.current!.animations.walk;
							megaMan.play();
						}, 1000);
					};
				}
			}
			return;
		}

		if (objects.current.building.x <= -64) {
			objects.current.building.x += (Math.floor(Math.random() * 32) + 32) * 16 + 288;
		}
		objects.current.building.x -= MEGA_MAN_CONSTS.MOVE_SPEED_BUILDING;

		(objects.current.ground as PIXI.TilingSprite).tilePosition.x -= MEGA_MAN_CONSTS.MOVE_SPEED_FOREGROUND;

		const enemy = objects.current.enemy as PIXI.AnimatedSprite;
		const bullet = objects.current.bullet as PIXI.Sprite;
		const destroy = objects.current.destroy as PIXI.AnimatedSprite;
		const pickup = objects.current.pickup as PIXI.AnimatedSprite;

		if (bullet.x < MEGA_MAN_CONSTS.PARK_POSITION) {
			bullet.x += MEGA_MAN_CONSTS.MOVE_SPEED_BULLET;
		}

		if (pickup.x < MEGA_MAN_CONSTS.PARK_POSITION) {
			pickup.x -= MEGA_MAN_CONSTS.MOVE_SPEED_FOREGROUND;

			if (pickup.y + pickup.height < 65 || pickupYSpeed.current <= 0) {
				pickup.y += pickupYSpeed.current;
				pickupYSpeed.current += MEGA_MAN_CONSTS.JUMP_PICKUP_GRAVITY;
				if (pickup.y + pickup.height > 65 && pickupYSpeed.current > 0) {
					pickup.y = 65 - pickup.height;
				}
			}
		}

		if (donationQueue.current.length > 0) {
			const currentDonation = donationQueue.current[0];

			if (currentDonation.state === MegaManDonationState.WAITING) {
				// Beginning to handle a new donation: Prepare the enemy sprite
				currentDonation.state = MegaManDonationState.STARTED;

				enemy.textures = spritesheet.current.animations[currentDonation.enemy.animName];
				enemy.play();
				enemy.x = 288;
				if (currentDonation.enemy.isGrounded) {
					enemy.y = 65 - enemy.height;
				} else {
					enemy.y = 25 - enemy.height / 2;
				}
			} else if (
				currentDonation.state === MegaManDonationState.STARTED ||
				currentDonation.state === MegaManDonationState.FIRED
			) {
				// Enemy is still alive in these states - move it
				enemy.x -= MEGA_MAN_CONSTS.MOVE_SPEED_FOREGROUND;

				// Wait for a bit until firing the bullet
				if (currentDonation.state === MegaManDonationState.STARTED) {
					// If hitting the enemy requires a jump, set YSpeed
					if (currentDonation.enemy.mustJump && megaMan.y >= 41 && enemy.x <= 220) {
						megaManYSpeed.current = MEGA_MAN_CONSTS.JUMP_MEGA_MAN_INITIAL;
						megaMan.textures = [spritesheet.current.textures.jump];
					}

					// Is it time to fire?
					if (enemy.x <= 210) {
						currentDonation.state = MegaManDonationState.FIRED;
						bullet.x = 64;
						bullet.y = megaMan.y + 9;
						megaMan.textures =
							megaMan.y < 41
								? [spritesheet.current.textures.s_jump]
								: spritesheet.current.animations.s_walk;
						megaMan.play();
					}
				} else {
					// Bullet has been fired and is travelling, check for collision
					if (bullet.x + bullet.width >= enemy.x + enemy.width / 2 - 8) {
						destroy.x = enemy.x + enemy.width / 2;
						destroy.y = enemy.y + enemy.height / 2;
						if (currentDonation.enemy == MegaManEnemyList.BATTON) {
							destroy.y -= 6;
						}
						destroy.alpha = 1;
						destroy.gotoAndPlay(0);

						megaMan.textures = spritesheet.current.animations.walk;
						megaMan.play();
						bullet.x = MEGA_MAN_CONSTS.PARK_POSITION;
						enemy.x = MEGA_MAN_CONSTS.PARK_POSITION;

						if (currentDonation.bigPickup) {
							pickup.textures =
								Math.random() < 0.5
									? spritesheet.current.animations.pickup_hl
									: spritesheet.current.animations.pickup_el;
						} else {
							pickup.textures =
								Math.random() < 0.5
									? spritesheet.current.animations.pickup_hs
									: spritesheet.current.animations.pickup_es;
						}
						pickup.play();
						pickup.x = destroy.x - pickup.width / 2;
						pickup.y = destroy.y - pickup.height / 2;
						pickupYSpeed.current = MEGA_MAN_CONSTS.JUMP_PICKUP_INITIAL;
						currentDonation.state = MegaManDonationState.HIT;
					}
				}
			} else {
				// currentDonation.state == MegaManDonationState.HIT
				// Check for pickup x Mega Man collision
				if (pickup.x <= 54) {
					pickup.x = MEGA_MAN_CONSTS.PARK_POSITION;
					donationQueue.current.shift();

					// Pause all animations for 500ms (the time it takes for TweenNumber to count up)
					// By pausing the main PIXI ticker, animated sprites are also stopped
					setShownTotal(currentDonation.newTotal);
					app.current?.ticker.stop();
					setTimeout(() => app.current?.ticker.start(), 500);
				}
			}
		}

		if (destroy.alpha > 0) {
			destroy.x -= MEGA_MAN_CONSTS.MOVE_SPEED_FOREGROUND;
		}

		if (megaMan.y < 41 || megaManYSpeed.current < 0) {
			megaMan.y += megaManYSpeed.current;
			megaManYSpeed.current += MEGA_MAN_CONSTS.JUMP_MEGA_MAN_GRAVITY;
			if (megaMan.y >= 41 && megaManYSpeed.current > 0) {
				megaMan.y = 41;
				megaMan.textures = spritesheet.current.animations.s_walk;
				megaMan.play();
			}
		}
	});

	useEffect(() => {
		if (!app.current) return;

		const container = new PIXI.Container();
		app.current.stage.addChild(container);
		container.setTransform(0, 0, 4, 4);

		spritesheet.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(sheetTexture), sheetAtlas);
		spritesheet.current.parse().then(() => {
			if (!spritesheet.current) return;

			objects.current = {
				background: new PIXI.Graphics(),
				building: new PIXI.Sprite(spritesheet.current.textures.building),
				ground: new PIXI.TilingSprite(spritesheet.current.textures.ground, 273, 19),
				enemy: new PIXI.AnimatedSprite(spritesheet.current.animations.enemy_mettool),
				bullet: new PIXI.Sprite(spritesheet.current.textures.bullet),
				megaMan: new PIXI.AnimatedSprite([spritesheet.current.textures.teleport1]),
				destroy: new PIXI.AnimatedSprite(spritesheet.current.animations.destroy),
				pickup: new PIXI.AnimatedSprite(spritesheet.current.animations.pickup_hs),
				ready: new PIXI.Sprite(spritesheet.current.textures.ready),
			};

			const background = objects.current.background as PIXI.Graphics;
			background.beginFill(0x183c5c);
			background.drawRect(0, 0, 273, 83);
			background.endFill();
			container.addChild(objects.current.background);

			function createCloudRow(cloudCount: number, y: number) {
				if (!spritesheet.current) return;

				const row: MegaManCloudRow = { initialDist: true, minNextX: 0, clouds: [] };
				for (let i = 0; i < cloudCount; i++) {
					const cloud = {
						left: new PIXI.Sprite(spritesheet.current.textures.cloud_left),
						middle: new PIXI.TilingSprite(spritesheet.current.textures.cloud_middle, 16, 16),
						right: new PIXI.Sprite(spritesheet.current.textures.cloud_right),
					};

					cloud.left.x = cloud.middle.x = cloud.right.x = -16;
					cloud.left.y = cloud.middle.y = cloud.right.y = y;
					container.addChild(cloud.left);
					container.addChild(cloud.middle);
					container.addChild(cloud.right);
					row.clouds.push(cloud);
				}
				cloudRows.current.push(row);
			}

			createCloudRow(3, -8);
			createCloudRow(2, 8);
			createCloudRow(1, 24);

			objects.current.building.x = -64;
			container.addChild(objects.current.building);

			objects.current.ground.y = 64;
			container.addChild(objects.current.ground);

			const enemy = objects.current.enemy as PIXI.AnimatedSprite;
			enemy.x = MEGA_MAN_CONSTS.PARK_POSITION;
			enemy.animationSpeed = 1 / 8;
			container.addChild(enemy);

			objects.current.bullet.x = MEGA_MAN_CONSTS.PARK_POSITION;
			objects.current.bullet.y = 50;
			container.addChild(objects.current.bullet);

			// Intro animation: Mega Man starts in the teleport sprite
			// Placed far above the camera frame, so he drops in the exact right moment
			const megaMan = objects.current.megaMan as PIXI.AnimatedSprite;
			megaMan.animationSpeed = 1 / 2;
			megaMan.play();
			megaMan.x = 32;
			megaMan.y = -32 - MEGA_MAN_CONSTS.MOVE_SPEED_TELEPORT * 180;
			megaMan.loop = false;
			container.addChild(megaMan);

			const destroy = objects.current.destroy as PIXI.AnimatedSprite;
			destroy.alpha = 0;
			destroy.loop = false;
			destroy.onComplete = () => (destroy.alpha = 0);
			destroy.animationSpeed = 1 / 4;
			destroy.pivot.x = destroy.width / 2;
			destroy.pivot.y = destroy.height / 2;
			container.addChild(destroy);

			const pickup = objects.current.pickup as PIXI.AnimatedSprite;
			pickup.x = MEGA_MAN_CONSTS.PARK_POSITION;
			pickup.animationSpeed = 1 / 6;
			container.addChild(pickup);

			const ready = objects.current.ready as PIXI.Sprite;
			ready.x = (273 - ready.width) / 2;
			ready.y = (83 - ready.height) / 2;
			ready.alpha = 0;
			container.addChild(ready);

			// Intro animation: "READY" is blinked here
			for (let i = 0; i < 3000; i += 250) {
				setTimeout(() => (ready.alpha = 1), i + 125);
				setTimeout(() => (ready.alpha = 0), i + 250);
			}
		});

		return () => {
			for (const key in objects.current) {
				const obj = objects.current[key];
				if (!obj.destroyed) obj.destroy(true);
			}

			for (const cloudRow of cloudRows.current) {
				for (const cloud of cloudRow.clouds) {
					if (!cloud.left.destroyed) cloud.left.destroy(true);
					if (!cloud.middle.destroyed) cloud.middle.destroy(true);
					if (!cloud.right.destroyed) cloud.right.destroy(true);
				}
			}

			spritesheet.current?.destroy(true);

			if (!container.destroyed) container.destroy(true);
		};
	}, [app]);

	useListenFor('donation', (donation: FormattedDonation) => {
		if (donationQueue.current.length >= MEGA_MAN_CONSTS.MAX_QUEUE_LENGTH) {
			// Avoid making the queue too long during donation trains, but start dropping big pickups
			const latestDonation = donationQueue.current.at(-1)!;
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
				$<TweenNumber value={shownTotal} />
			</TotalShadow>
			<TotalEl>
				$<TweenNumber value={shownTotal} />
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
