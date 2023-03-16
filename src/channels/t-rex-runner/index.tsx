import type { FormattedDonation, Total } from '@/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import { usePIXICanvas } from '@/lib/hooks/usePIXICanvas';
import * as PIXI from 'pixi.js';

import spriteSheetImage from './trex.png';

import { useCallback, useEffect, useRef } from 'react';
import { useIncrementNumber } from '@/lib/hooks/useIncrementNumber';

const OBSTACLE_TYPES = ['CactusSmall', 'CactusLarge', 'Pterodactyl'] as const;

type TRexState = 'walk' | 'duck' | 'jump';
type ObstacleType = (typeof OBSTACLE_TYPES)[number];

const TREX_CONSTS = {
	BG_CLOUD_SPEED: 0.2,
	BOTTOM_PAD: 10,
	CLEAR_TIME: 3000,
	CLOUD_FREQUENCY: 0.5,
	DROP_VELOCITY: -5.0,
	GAP_COEFFICIENT: 0.6,
	GRAVITY: 0.6,
	INITIAL_JUMP_VELOCITY: -12.5,
	MAX_CLOUDS: 6,
	MAX_OBSTACLE_LENGTH: 3,
	MAX_SPEED: 13,
	MAX_JUMP_HEIGHT: 35,
	SPEED: 6,
	SPEED_DROP_COEFFICIENT: 3,
	HORIZON_BUMP_THRESHOLD: 0.5,
	CLOUD_MIN_SKY_LEVEL: 71,
	CLOUD_MAX_SKY_LEVEL: 30,
	CLOUD_MIN_GAP: 100,
	CLOUD_MAX_GAP: 400,
	MIN_OBSTACLE_GAP: 170,
	GROUND_Y_POS: 93,
	DINO_X_POS: 50,
	DODGE_X_POS: 120,
	DONATION_DIGITS_DISPLAYED: 9,
};

const SPRITE_DEFINITIONS = {
	CactusLarge: {
		frame: { x: 332, y: 2, w: 150, h: 50 },
		sourceSize: { w: 150, h: 50 },
		subspriteSize: { w: 25, h: 50 },
	},
	CactusSmall: {
		frame: { x: 228, y: 2, w: 102, h: 35 },
		sourceSize: { w: 102, h: 35 },
		subspriteSize: { w: 17, h: 35 },
	},
	Cloud: {
		frame: { x: 86, y: 2, w: 46, h: 14 },
		sourceSize: { w: 46, h: 14 },
	},
	HorizonA: {
		frame: { x: 2, y: 54, w: 600, h: 12 },
		sourceSize: { w: 600, h: 12 },
	},
	HorizonB: {
		frame: { x: 602, y: 54, w: 600, h: 12 },
		sourceSize: { w: 600, h: 12 },
	},
	Pterodactyl1: {
		frame: { x: 134, y: 2, w: 46, h: 40 },
		sourceSize: { w: 46, h: 40 },
	},
	Pterodactyl2: {
		frame: { x: 180, y: 2, w: 46, h: 40 },
		sourceSize: { w: 46, h: 40 },
	},
	TRexJump: {
		frame: { x: 848, y: 2, w: 44, h: 44 },
		sourceSize: { w: 44, h: 44 },
	},
	TRexWalk1: {
		frame: { x: 936, y: 2, w: 44, h: 44 },
		sourceSize: { w: 44, h: 44 },
	},
	TRexWalk2: {
		frame: { x: 980, y: 2, w: 44, h: 44 },
		sourceSize: { w: 44, h: 44 },
	},
	TRexDuck1: {
		frame: { x: 1112, y: 24, w: 59, h: 25 },
		sourceSize: { w: 59, h: 25 },
	},
	TRexDuck2: {
		frame: { x: 1171, y: 24, w: 59, h: 25 },
		sourceSize: { w: 59, h: 25 },
	},
	Numeral0: {
		frame: { x: 655, y: 2, w: 10, h: 13 },
		sourceSize: { w: 10, h: 13 },
	},
	Numeral1: {
		frame: { x: 665, y: 2, w: 10, h: 13 },
		sourceSize: { w: 10, h: 13 },
	},
	Numeral2: {
		frame: { x: 675, y: 2, w: 10, h: 13 },
		sourceSize: { w: 10, h: 13 },
	},
	Numeral3: {
		frame: { x: 685, y: 2, w: 10, h: 13 },
		sourceSize: { w: 10, h: 13 },
	},
	Numeral4: {
		frame: { x: 695, y: 2, w: 10, h: 13 },
		sourceSize: { w: 10, h: 13 },
	},
	Numeral5: {
		frame: { x: 705, y: 2, w: 10, h: 13 },
		sourceSize: { w: 10, h: 13 },
	},
	Numeral6: {
		frame: { x: 715, y: 2, w: 10, h: 13 },
		sourceSize: { w: 10, h: 13 },
	},
	Numeral7: {
		frame: { x: 725, y: 2, w: 10, h: 13 },
		sourceSize: { w: 10, h: 13 },
	},
	Numeral8: {
		frame: { x: 735, y: 2, w: 10, h: 13 },
		sourceSize: { w: 10, h: 13 },
	},
	Numeral9: {
		frame: { x: 745, y: 2, w: 10, h: 13 },
		sourceSize: { w: 10, h: 13 },
	},
	Numeral$: {
		frame: { x: 775, y: 2, w: 10, h: 13 },
		sourceSize: { w: 10, h: 13 },
	},
	'Numeral,': {
		frame: { x: 785, y: 2, w: 4, h: 13 },
		sourceSize: { w: 4, h: 13 },
	},
} as const;

function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getYPosForObstacle(type: ObstacleType) {
	switch (type) {
		case 'Pterodactyl':
			return [50, 75][getRandomInt(0, 1)];

		case 'CactusSmall':
			return 105;

		case 'CactusLarge':
			return 90;
	}
}

function getObstacleWidth(obstacle: ObstacleData) {
	const spriteWidth = obstacle.type === 'Pterodactyl' ? 46 : SPRITE_DEFINITIONS[obstacle.type].subspriteSize.w;

	return spriteWidth * obstacle.size;
}

interface CloudData {
	x: number;
	y: number;
	cloudGap: number;
	sprite: PIXI.Sprite;
}

interface ObstacleData {
	x: number;
	y: number;
	sprite: PIXI.DisplayObject;
	size: number;
	type: ObstacleType;
}

registerChannel('T-Rex Runner', 404, TRexRunner);

export function TRexRunner(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const displayedTotal = useIncrementNumber(total?.raw ?? 0, 30);

	const containerRef = useRef<HTMLDivElement>(null);
	const objects = useRef<Record<string, PIXI.DisplayObject> | null>(null);
	const spritesheet = useRef<PIXI.Spritesheet | null>(null);
	const horizonXPos = useRef([0, 600]);
	const activeHorizonTypes = useRef([0, 0]);
	const clouds = useRef<CloudData[]>([]);
	const pendingObstacles = useRef(0);
	const trexState = useRef<TRexState>('walk');
	const trexJumpYOffset = useRef(0);
	const trexJumpVelocity = useRef(0);
	const trexIsJumping = useRef(false);
	const obstacles = useRef<ObstacleData[]>([]);

	const addCloud = useCallback(() => {
		if (!spritesheet.current || !objects.current) return;

		const cloudContainer = objects.current.clouds as PIXI.Container;

		const cloudData = {
			x: 620,
			y: getRandomInt(TREX_CONSTS.CLOUD_MAX_SKY_LEVEL, TREX_CONSTS.CLOUD_MIN_SKY_LEVEL),
			cloudGap: getRandomInt(TREX_CONSTS.CLOUD_MIN_GAP, TREX_CONSTS.CLOUD_MAX_GAP),
			sprite: new PIXI.Sprite(spritesheet.current.textures.Cloud),
		};

		clouds.current.push(cloudData);

		cloudContainer.addChild(cloudData.sprite);
	}, []);

	const addObstacle = useCallback(() => {
		if (!spritesheet.current || !objects.current || pendingObstacles.current < 1) return;

		const obstacleContainer = objects.current.obstacles as PIXI.Container;

		const type = OBSTACLE_TYPES[getRandomInt(0, OBSTACLE_TYPES.length - 1)];

		let size = 1;

		// Do not spawn an obstical if there is not enough space
		if (obstacles.current.length > 0) {
			const lastObstacle = obstacles.current[obstacles.current.length - 1];

			if (600 - (lastObstacle.x + getObstacleWidth(lastObstacle)) <= TREX_CONSTS.MIN_OBSTACLE_GAP) return;
		}

		let sprite;

		if (type === 'Pterodactyl') {
			sprite = new PIXI.AnimatedSprite(spritesheet.current.animations.Pterodactyl);
			sprite.animationSpeed = 0.1;
			sprite.play();
		} else {
			const { subspriteSize } = SPRITE_DEFINITIONS[type];

			size = getRandomInt(1, Math.min(TREX_CONSTS.MAX_OBSTACLE_LENGTH, pendingObstacles.current || 1));
			// Apply mask
			sprite = new PIXI.Container();

			const mask = new PIXI.Graphics();
			mask.lineStyle(0);
			mask.beginFill(0xffffff, 1);
			mask.drawRect(0, 0, subspriteSize.w * size, subspriteSize.h);
			mask.endFill();

			const subsprite = new PIXI.Sprite(spritesheet.current.textures[type]);

			subsprite.position.set(getRandomInt(0, 4) * -subspriteSize.w, 0);
			subsprite.mask = mask;

			sprite.addChild(mask);
			sprite.addChild(subsprite);
		}

		const obstacleData = {
			x: 620,
			y: getYPosForObstacle(type),
			type,
			size,
			sprite,
		};

		obstacles.current.push(obstacleData);

		obstacleContainer.addChild(obstacleData.sprite);

		pendingObstacles.current -= size;
	}, []);

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		if (!objects.current || !spritesheet.current) return;

		const increment = TREX_CONSTS.SPEED;

		// Update horizon line
		const line1 = horizonXPos.current[0] <= 0 ? 0 : 1;
		const line2 = line1 === 0 ? 1 : 0;

		horizonXPos.current[line1] -= increment;
		horizonXPos.current[line2] = horizonXPos.current[line1] + 600;

		if (horizonXPos.current[line1] <= -600) {
			horizonXPos.current[line1] += 1200;
			horizonXPos.current[line2] = horizonXPos.current[line1] - 600;
			activeHorizonTypes.current[line1] = Math.random() > TREX_CONSTS.HORIZON_BUMP_THRESHOLD ? 1 : 0;

			const nextSprite =
				spritesheet.current.textures[activeHorizonTypes.current[line1] === 0 ? 'HorizonA' : 'HorizonB'];

			if (line1 === 0) {
				(objects.current.horizonLine1 as PIXI.Sprite).texture = nextSprite;
			} else {
				(objects.current.horizonLine2 as PIXI.Sprite).texture = nextSprite;
			}
		}

		// Update clouds
		if (clouds.current.length > 0) {
			const cloudContainer = objects.current.clouds as PIXI.Container;
			const cloudCopies = [...clouds.current];
			for (const [index, cloud] of cloudCopies.entries()) {
				const cloudIsVisible = cloud.x + 46 > 0;

				if (cloudIsVisible) {
					cloud.x -= TREX_CONSTS.BG_CLOUD_SPEED;
				} else {
					// Destroy this cloud
					cloudContainer.removeChild(cloud.sprite);

					clouds.current.splice(index, 1);
				}
			}

			const lastCloud = cloudCopies[cloudCopies.length - 1];

			// Possibly spawn another cloud
			if (
				cloudCopies.length < TREX_CONSTS.MAX_CLOUDS &&
				600 - lastCloud.x > lastCloud.cloudGap &&
				TREX_CONSTS.CLOUD_FREQUENCY > Math.random()
			) {
				addCloud();
			}
		} else {
			addCloud();
		}

		// Update obstacles
		if (obstacles.current.length > 0) {
			const obstacleContainer = objects.current.obstacles as PIXI.Container;
			const obstacleCopies = [...obstacles.current];

			for (const [index, obstacle] of obstacleCopies.entries()) {
				const obstacleIsVisible = obstacle.x + getObstacleWidth(obstacle) > 0;

				if (obstacleIsVisible) {
					obstacle.x -= TREX_CONSTS.SPEED;
				} else {
					// Destroy this obstacle
					obstacleContainer.removeChild(obstacle.sprite);

					obstacles.current.splice(index, 1);
				}
			}
		}

		if (pendingObstacles.current > 0) addObstacle();

		// Dodge if necessary
		if (obstacles.current.length > 0) {
			const firstObstacle = obstacles.current[0];

			if (firstObstacle.x <= TREX_CONSTS.DODGE_X_POS && firstObstacle.x >= TREX_CONSTS.DINO_X_POS - 10) {
				if (firstObstacle.type === 'Pterodactyl') {
					trexState.current = 'duck';
				} else if (!trexIsJumping.current) {
					trexState.current = 'jump';
					trexJumpVelocity.current = TREX_CONSTS.INITIAL_JUMP_VELOCITY;
					trexIsJumping.current = true;
				}
			} else {
				if (!trexIsJumping.current) trexState.current = 'walk';
			}
		}

		// Apply jump velocity
		if (trexIsJumping.current) {
			trexJumpYOffset.current += Math.round(trexJumpVelocity.current);

			trexJumpVelocity.current += TREX_CONSTS.GRAVITY;

			if (
				trexJumpYOffset.current < -TREX_CONSTS.MAX_JUMP_HEIGHT &&
				trexJumpVelocity.current < TREX_CONSTS.DROP_VELOCITY
			) {
				trexJumpVelocity.current = TREX_CONSTS.DROP_VELOCITY;
			}

			if (trexJumpYOffset.current > 0) {
				trexJumpVelocity.current = 0;
				trexJumpYOffset.current = 0;
				trexIsJumping.current = false;
				trexState.current = 'walk';
			}
		}

		const background = objects.current.background as PIXI.Graphics;
		background.clear();

		background.beginFill(0xf7f7f7);
		background.drawRect(0, 0, 1092, 332);
		background.endFill();

		const horizonLine1 = objects.current.horizonLine1 as PIXI.Sprite;
		const horizonLine2 = objects.current.horizonLine2 as PIXI.Sprite;

		horizonLine1.position.set(horizonXPos.current[0], 127);
		horizonLine2.position.set(horizonXPos.current[1], 127);

		clouds.current.forEach((cloud) => {
			cloud.sprite.position.set(cloud.x, cloud.y);
		});

		obstacles.current.forEach((obstacle) => {
			obstacle.sprite.position.set(obstacle.x, obstacle.y);
		});
		const trexWalk = objects.current.trexWalk as PIXI.AnimatedSprite;
		const trexJump = objects.current.trexJump as PIXI.AnimatedSprite;
		const trexDuck = objects.current.trexDuck as PIXI.AnimatedSprite;

		trexWalk.visible = trexState.current === 'walk';
		trexJump.visible = trexState.current === 'jump';
		trexDuck.visible = trexState.current === 'duck';

		trexWalk.position.set(TREX_CONSTS.DINO_X_POS, TREX_CONSTS.GROUND_Y_POS);
		trexJump.position.set(TREX_CONSTS.DINO_X_POS, TREX_CONSTS.GROUND_Y_POS + trexJumpYOffset.current);
		trexDuck.position.set(TREX_CONSTS.DINO_X_POS, TREX_CONSTS.GROUND_Y_POS + 22);

		const donationContainer = objects.current.donationTotal as PIXI.Container;

		// Update donation total
		donationContainer.position.set(536 - (11 * TREX_CONSTS.DONATION_DIGITS_DISPLAYED - 4) * 2, 4);

		const digits = `$${Math.floor(displayedTotal).toLocaleString()}`.split('');
		const digitOffset = TREX_CONSTS.DONATION_DIGITS_DISPLAYED - digits.length - 1;

		// Set base adjustment to account for commas
		let offsetX = digits.filter((digit) => digit === ',').length * 6;

		for (let i = 0; i < TREX_CONSTS.DONATION_DIGITS_DISPLAYED; i += 1) {
			const numeralDisplay = donationContainer.children[i];

			numeralDisplay.visible = i >= digitOffset;

			let offset = 11;

			if (numeralDisplay.visible) {
				const digit = digits[i - digitOffset - 1];
				(numeralDisplay as PIXI.Sprite).texture = spritesheet.current.textures[`Numeral${digit}`];

				if (digit === ',') offset = 5;
			}

			numeralDisplay.position.set(offsetX, 0);

			offsetX += offset;
		}
	});

	useEffect(() => {
		if (!app) return;

		spritesheet.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(spriteSheetImage), {
			frames: SPRITE_DEFINITIONS,
			meta: {
				scale: '1',
			},
			animations: {
				Pterodactyl: ['Pterodactyl1', 'Pterodactyl2'],
				TRexJump: ['TRexJump'],
				TRexWalk: ['TRexWalk1', 'TRexWalk2'],
				TRexDuck: ['TRexDuck1', 'TRexDuck2'],
			},
		});

		spritesheet.current.parse();

		const donationTotal = new PIXI.Container();

		for (let i = 0; i < TREX_CONSTS.DONATION_DIGITS_DISPLAYED; i += 1) {
			const sprite = new PIXI.Sprite(spritesheet.current.textures.Numeral0);

			sprite.position.set(i * 11, 0);
			donationTotal.addChild(sprite);
		}

		donationTotal.setTransform(0, 0, 2, 2);

		const trexJump = new PIXI.AnimatedSprite(spritesheet.current.animations.TRexJump);
		const trexWalk = new PIXI.AnimatedSprite(spritesheet.current.animations.TRexWalk);
		const trexDuck = new PIXI.AnimatedSprite(spritesheet.current.animations.TRexDuck);

		trexDuck.animationSpeed = 0.1333333;
		trexWalk.animationSpeed = 0.2;

		trexDuck.play();
		trexWalk.play();

		objects.current = {
			background: new PIXI.Graphics(),
			clouds: new PIXI.Container(),
			obstacles: new PIXI.Container(),
			trexJump,
			trexWalk,
			trexDuck,
			donationTotal,
			horizonLine1: new PIXI.Sprite(spritesheet.current.textures.HorizonA),
			horizonLine2: new PIXI.Sprite(spritesheet.current.textures.HorizonB),
		};

		const container = new PIXI.Container();

		container.addChild(objects.current.background);
		container.addChild(objects.current.horizonLine1);
		container.addChild(objects.current.horizonLine2);
		container.addChild(objects.current.clouds);
		container.addChild(objects.current.obstacles);
		container.addChild(trexJump);
		container.addChild(trexWalk);
		container.addChild(trexDuck);
		container.addChild(donationTotal);

		app.current?.stage.addChild(container);

		container.setTransform(0, 0, 2, 2);

		addCloud();

		return () => {
			for (const key in objects.current) {
				const obj = objects.current[key];
				if (!obj.destroyed) obj.destroy(true);
			}

			for (const cloud of clouds.current) {
				if (!cloud.sprite.destroyed) cloud.sprite.destroy(true);
			}

			for (const obstacle of obstacles.current) {
				if (!obstacle.sprite.destroyed) obstacle.sprite.destroy(true);
			}

			if (!trexDuck.destroyed) trexDuck.destroy(true);
			if (!trexJump.destroyed) trexJump.destroy(true);
			if (!trexWalk.destroyed) trexWalk.destroy(true);
			if (!donationTotal.destroyed) donationTotal.destroy(true);

			clouds.current = [];
			obstacles.current = [];

			if (spritesheet.current) spritesheet.current.destroy(true);

			if (!container.destroyed) container.destroy(true);
		};
	}, [app]);

	useListenFor('donation', (donation: FormattedDonation) => {
		pendingObstacles.current += 1;
	});

	return (
		<Container ref={containerRef}>
			<Canvas width={1092} height={332} ref={canvasRef} />
		</Container>
	);
}

const Canvas = styled.canvas`
	position: absolute;
	width: 100% !important;
	height: 100% !important;
`;

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	overflow: hidden;

	.donationgem {
		position: absolute;
		transition: transform 3s, left 2s ease-out, top 0.6s ease-in-out;
	}
`;
