import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import * as PIXI from 'pixi.js';
import { useCallback, useEffect, useRef } from 'react';

import backgroundImage from './background/background.png';
import mountainImage from './background/mountains.png';
import cloudImage from './background/cloud.png';
import madelineImage from './background/madeline.png';

import strawberrySpriteSheetImage from './strawberries/strawberry-spritesheet.png';
import goldStrawberrySpriteSheetImage from './strawberries/goldStrawberry-spritesheet.png';

import baseHairSpriteSheetImage from './hair/baseHair-spritesheet-25.png';
import frontHairSpriteSheetImage from './hair/frontHair-spritesheet-25.png';

import starASpriteSheetImage from './background/star-a-spritesheet-25.png';
import starBSpriteSheetImage from './background/star-b-spritesheet-25.png';
import starCSpriteSheetImage from './background/star-c-spritesheet-25.png';

registerChannel('Celeste', 24, Celeste, {
	position: 'bottomLeft',
	site: 'Twitter',
	handle: 'TarnishedStella',
});

const STRAWBERRY_SPRITE_DEFINITIONS = {
	flapWings0: {
		frame: { x: 0, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	flapWings1: {
		frame: { x: 40, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	flapWings2: {
		frame: { x: 80, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	flapWings3: {
		frame: { x: 120, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	flapWings4: {
		frame: { x: 120, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	flapWings5: {
		frame: { x: 160, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	flapWings6: {
		frame: { x: 200, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	flapWings7: {
		frame: { x: 240, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
} as const;

const GOLD_STRAWBERRY_SPRITE_DEFINITIONS = {
	goldFlapWings0: {
		frame: { x: 0, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	goldFlapWings1: {
		frame: { x: 40, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	goldFlapWings2: {
		frame: { x: 80, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	goldFlapWings3: {
		frame: { x: 120, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	goldFlapWings4: {
		frame: { x: 120, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	goldFlapWings5: {
		frame: { x: 160, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	goldFlapWings6: {
		frame: { x: 200, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
	goldFlapWings7: {
		frame: { x: 240, y: 0, w: 40, h: 24 },
		sourceSize: { w: 40, h: 24 },
	},
} as const;

const HAIR_SPRITE_DEFINITIONS = {
	baseHair0: {
		frame: { x: 0, y: 0, w: 534, h: 325 },
	},
	baseHair1: {
		frame: { x: 534, y: 0, w: 534, h: 325 },
	},
	baseHair2: {
		frame: { x: 534 * 2, y: 0, w: 534, h: 325 },
	},
	baseHair3: {
		frame: { x: 534 * 3, y: 0, w: 534, h: 325 },
	},
	baseHair4: {
		frame: { x: 534 * 4, y: 0, w: 534, h: 325 },
	},
	baseHair5: {
		frame: { x: 534 * 5, y: 0, w: 534, h: 325 },
	},
	baseHair6: {
		frame: { x: 534 * 6, y: 0, w: 534, h: 325 },
	},
	baseHair7: {
		frame: { x: 534 * 7, y: 0, w: 534, h: 325 },
	},
} as const;

const HAIR_FRONT_SPRITE_DEFINITIONS = {
	frontHair0: {
		frame: { x: 0, y: 0, w: 534, h: 325 },
	},
	frontHair1: {
		frame: { x: 534, y: 0, w: 534, h: 325 },
	},
	frontHair2: {
		frame: { x: 534 * 2, y: 0, w: 534, h: 325 },
	},
	frontHair3: {
		frame: { x: 534 * 3, y: 0, w: 534, h: 325 },
	},
} as const;

const STARS_A_SPRITE_DEFINITIONS = {
	starA0: {
		frame: { x: 0, y: 0, w: 534, h: 325 },
	},
	starA1: {
		frame: { x: 534, y: 0, w: 534, h: 325 },
	},
	starA2: {
		frame: { x: 534 * 2, y: 0, w: 534, h: 325 },
	},
	starA3: {
		frame: { x: 534, y: 0, w: 534, h: 325 },
	},
} as const;

const STARS_B_SPRITE_DEFINITIONS = {
	starB0: {
		frame: { x: 0, y: 0, w: 534, h: 325 },
	},
	starB1: {
		frame: { x: 534, y: 0, w: 534, h: 325 },
	},
	starB2: {
		frame: { x: 534 * 2, y: 0, w: 534, h: 325 },
	},
	starB3: {
		frame: { x: 534, y: 0, w: 534, h: 325 },
	},
} as const;

const STARS_C_SPRITE_DEFINITIONS = {
	starC0: {
		frame: { x: 0, y: 0, w: 534, h: 325 },
	},
	starC1: {
		frame: { x: 534, y: 0, w: 534, h: 325 },
	},
	starC2: {
		frame: { x: 534 * 2, y: 0, w: 534, h: 325 },
	},
	starC3: {
		frame: { x: 534, y: 0, w: 534, h: 325 },
	},
} as const;

const CONST = {
	STRAWBERRY_MIN_HEIGHT: 0,
	STRAWBERRY_MAX_HEIGHT: 100,
	STRAWBERRIES_MAX_COUNT: 5,
	STRAWBERRY_SPEED: 1,
	STRAWBERRY_MIN_GAP: 20,
	CLOUD_MIN_SKY_LEVEL: 25,
	CLOUD_MAX_SKY_LEVEL: 20,
	CLOUD_MIN_GAP: 500,
	CLOUD_MAX_GAP: 1000,
	CLOUD_SPEED: 0.2,
	CLOUD_FREQUENCY: 0.5,
	CLOUD_MAX_COUNT: 6,
};

function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const STRAWBERRY_TYPES = ['normal', 'golden'] as const;
type StrawberryType = (typeof STRAWBERRY_TYPES)[number];

interface CloudData {
	x: number;
	y: number;
	cloudGap: number;
	sprite: PIXI.Sprite;
}

interface StrawberryData {
	x: number;
	y: number;
	gap: number;
	sprite: PIXI.DisplayObject;
}

function Celeste(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);

	const containerRef = useRef<HTMLDivElement>(null);
	const objects = useRef<Record<string, PIXI.DisplayObject> | null>(null);
	const strawberrySpriteSheet = useRef<PIXI.Spritesheet | null>(null);
	const goldStrawberrySpriteSheet = useRef<PIXI.Spritesheet | null>(null);
	const baseHairSpriteSheet = useRef<PIXI.Spritesheet | null>(null);
	const frontHairSpriteSheet = useRef<PIXI.Spritesheet | null>(null);
	const starASpriteSheet = useRef<PIXI.Spritesheet | null>(null);
	const starBSpriteSheet = useRef<PIXI.Spritesheet | null>(null);
	const starCSpriteSheet = useRef<PIXI.Spritesheet | null>(null);

	const pendingStrawberriesToMake = useRef<StrawberryType[]>([]);
	const strawberries = useRef<StrawberryData[]>([]);
	const clouds = useRef<CloudData[]>([]);
	const textures = useRef<Record<string, PIXI.Texture> | null>(null);

	useListenFor('donation', (donation: FormattedDonation) => {
		if (donation.rawAmount >= 100.0) {
			pendingStrawberriesToMake.current.push('golden');
		} else {
			pendingStrawberriesToMake.current.push('normal');
		}
	});

	const addStrawberry = useCallback(() => {
		if (
			!strawberrySpriteSheet.current ||
			!goldStrawberrySpriteSheet.current ||
			!objects.current ||
			pendingStrawberriesToMake.current.length < 1
		) {
			return;
		}

		const strawberryContainer = objects.current.strawberries as PIXI.Container;

		// Do not spawn if there is not enough space
		if (strawberries.current.length > 0) {
			const lastObstacle = strawberries.current[strawberries.current.length - 1];

			if (600 - (lastObstacle.x + 40) <= CONST.STRAWBERRY_MIN_GAP) return;
		}

		const toMake = pendingStrawberriesToMake.current.pop();
		let sprite;
		if (toMake == 'golden') {
			sprite = new PIXI.AnimatedSprite(goldStrawberrySpriteSheet.current.animations.goldFlapWings);
		} else {
			sprite = new PIXI.AnimatedSprite(strawberrySpriteSheet.current.animations.flapWings);
		}

		sprite.animationSpeed = 0.1;
		sprite.scale.set(1.25, 1.25);
		sprite.play();

		const strawberryData = {
			x: 620,
			y: getRandomInt(CONST.STRAWBERRY_MIN_HEIGHT, CONST.STRAWBERRY_MAX_HEIGHT),
			gap: getRandomInt(CONST.CLOUD_MIN_GAP, CONST.CLOUD_MAX_GAP),
			sprite: sprite,
		};

		strawberries.current.push(strawberryData);

		strawberryContainer.addChild(strawberryData.sprite);
	}, []);

	const addCloud = useCallback(() => {
		if (!textures.current || !objects.current) return;

		const cloudContainer = objects.current.clouds as PIXI.Container;

		const cloudSprite = new PIXI.Sprite(textures.current.backgroundCloud2);
		cloudSprite.scale.set(0.25, 0.25);
		const cloudData = {
			x: 600,
			y: getRandomInt(CONST.CLOUD_MAX_SKY_LEVEL, CONST.CLOUD_MIN_SKY_LEVEL),
			cloudGap: getRandomInt(CONST.CLOUD_MIN_GAP, CONST.CLOUD_MAX_GAP),
			sprite: cloudSprite,
		};

		clouds.current.push(cloudData);

		cloudContainer.addChild(cloudData.sprite);
	}, []);

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		if (!objects.current || !strawberrySpriteSheet.current) return;

		addStrawberry();

		// Update strawberries
		if (strawberries.current.length > 0) {
			const strawberryContainer = objects.current.strawberries as PIXI.Container;
			const obstacleCopies = [...strawberries.current];

			for (const [index, strawberry] of obstacleCopies.entries()) {
				const obstacleIsVisible = strawberry.x + 40 > 0;

				if (obstacleIsVisible) {
					strawberry.x -= CONST.STRAWBERRY_SPEED;
				} else {
					// Destroy this strawberry
					strawberryContainer.removeChild(strawberry.sprite);

					strawberries.current.splice(index, 1);
				}
			}
		}

		// Update clouds
		if (clouds.current.length > 0) {
			const cloudContainer = objects.current.clouds as PIXI.Container;
			const cloudCopies = [...clouds.current];
			for (const [index, cloud] of cloudCopies.entries()) {
				const cloudIsVisible = cloud.x + 100 > 0;

				if (cloudIsVisible) {
					cloud.x -= CONST.CLOUD_SPEED;
				} else {
					// Destroy this cloud
					cloudContainer.removeChild(cloud.sprite);

					clouds.current.splice(index, 1);
				}
			}

			// Possibly spawn another cloud
			const lastCloud = cloudCopies[cloudCopies.length - 1];
			if (
				cloudCopies.length < CONST.CLOUD_MAX_COUNT &&
				600 - lastCloud.x > lastCloud.cloudGap &&
				CONST.CLOUD_FREQUENCY > Math.random()
			) {
				addCloud();
			}
		} else {
			addCloud();
		}

		strawberries.current.forEach((strawberry) => {
			strawberry.sprite.position.set(strawberry.x, strawberry.y);
		});

		clouds.current.forEach((cloud) => {
			cloud.sprite.position.set(cloud.x, cloud.y);
		});
	});

	useEffect(() => {
		if (!app) return;

		textures.current = {
			background: PIXI.Texture.from(backgroundImage),
			backgroundCloud: PIXI.Texture.from(mountainImage),
			backgroundCloud2: PIXI.Texture.from(cloudImage),
			madeline: PIXI.Texture.from(madelineImage),
			normalStrawberry: PIXI.Texture.from(strawberrySpriteSheetImage),
			goldenStrawberry: PIXI.Texture.from(goldStrawberrySpriteSheetImage),
			baseHair: PIXI.Texture.from(baseHairSpriteSheetImage),
			frontHair: PIXI.Texture.from(frontHairSpriteSheetImage),
			starA: PIXI.Texture.from(starASpriteSheetImage),
			starB: PIXI.Texture.from(starBSpriteSheetImage),
			starC: PIXI.Texture.from(starCSpriteSheetImage),
		};

		// Init berries
		strawberrySpriteSheet.current = new PIXI.Spritesheet(textures.current.normalStrawberry, {
			frames: STRAWBERRY_SPRITE_DEFINITIONS,
			meta: {
				scale: '0.75',
			},
			animations: {
				flapWings: [
					'flapWings0',
					'flapWings1',
					'flapWings2',
					'flapWings3',
					'flapWings4',
					'flapWings5',
					'flapWings6',
					'flapWings7',
				],
			},
		});
		strawberrySpriteSheet.current.parse();

		goldStrawberrySpriteSheet.current = new PIXI.Spritesheet(textures.current.goldenStrawberry, {
			frames: GOLD_STRAWBERRY_SPRITE_DEFINITIONS,
			meta: {
				scale: '0.75',
			},
			animations: {
				goldFlapWings: [
					'goldFlapWings0',
					'goldFlapWings1',
					'goldFlapWings2',
					'goldFlapWings3',
					'goldFlapWings4',
					'goldFlapWings5',
					'goldFlapWings6',
					'goldFlapWings7',
				],
			},
		});
		goldStrawberrySpriteSheet.current.parse();

		// Init hair
		baseHairSpriteSheet.current = new PIXI.Spritesheet(textures.current.baseHair, {
			frames: HAIR_SPRITE_DEFINITIONS,
			meta: {
				scale: '1',
			},
			animations: {
				hair: [
					'baseHair0',
					'baseHair1',
					'baseHair2',
					'baseHair3',
					'baseHair4',
					'baseHair5',
					'baseHair6',
					'baseHair7',
				],
			},
		});
		baseHairSpriteSheet.current.parse();

		frontHairSpriteSheet.current = new PIXI.Spritesheet(textures.current.frontHair, {
			frames: HAIR_FRONT_SPRITE_DEFINITIONS,
			meta: {
				scale: '1',
			},
			animations: {
				hair: ['frontHair0', 'frontHair1', 'frontHair2', 'frontHair3'],
			},
		});
		frontHairSpriteSheet.current.parse();

		const hairContainer = new PIXI.Container();
		const hairSprite = new PIXI.AnimatedSprite(baseHairSpriteSheet.current.animations.hair);
		hairSprite.animationSpeed = 0.1;
		hairSprite.play();
		hairContainer.addChild(hairSprite);

		const frontHairContainer = new PIXI.Container();
		const frontHairSprite = new PIXI.AnimatedSprite(frontHairSpriteSheet.current.animations.hair);
		frontHairSprite.animationSpeed = 0.075;
		frontHairSprite.play();
		frontHairContainer.addChild(frontHairSprite);

		// init stars
		starASpriteSheet.current = new PIXI.Spritesheet(textures.current.starA, {
			frames: STARS_A_SPRITE_DEFINITIONS,
			meta: {
				scale: '1',
			},
			animations: {
				twinkle: ['starA0', 'starA1', 'starA2', 'starA3'],
			},
		});
		starASpriteSheet.current.parse();

		starBSpriteSheet.current = new PIXI.Spritesheet(textures.current.starB, {
			frames: STARS_B_SPRITE_DEFINITIONS,
			meta: {
				scale: '1',
			},
			animations: {
				twinkle: ['starB1', 'starB2', 'starB3', 'starB0'],
			},
		});
		starBSpriteSheet.current.parse();

		starCSpriteSheet.current = new PIXI.Spritesheet(textures.current.starC, {
			frames: STARS_C_SPRITE_DEFINITIONS,
			meta: {
				scale: '1',
			},
			animations: {
				twinkle: ['starC2', 'starC3', 'starC0', 'starC1'],
			},
		});
		starCSpriteSheet.current.parse();

		const starContainer = new PIXI.Container();
		const starASprite = new PIXI.AnimatedSprite(starASpriteSheet.current.animations.twinkle);
		starASprite.animationSpeed = 0.01;
		starASprite.play();
		starContainer.addChild(starASprite);

		const starBSprite = new PIXI.AnimatedSprite(starBSpriteSheet.current.animations.twinkle);
		starBSprite.animationSpeed = 0.01;
		starBSprite.play();
		starContainer.addChild(starBSprite);

		const starCSprite = new PIXI.AnimatedSprite(starCSpriteSheet.current.animations.twinkle);
		starCSprite.animationSpeed = 0.01;
		starCSprite.play();
		starContainer.addChild(starCSprite);

		objects.current = {
			strawberries: new PIXI.Container(),
			backgroundSprite: new PIXI.Sprite(textures.current.background),
			backgroundCloudSprite: new PIXI.Sprite(textures.current.backgroundCloud),
			madeline: new PIXI.Sprite(textures.current.madeline),
			hair: hairContainer,
			frontHair: frontHairContainer,
			stars: starContainer,
			clouds: new PIXI.Container(),
		};

		objects.current.madeline.scale.set(0.25, 0.25);
		objects.current.hair.scale.set(0.9, 0.9);
		objects.current.hair.position.x = 15;
		objects.current.hair.position.y = 5;
		objects.current.frontHair.scale.set(0.9, 0.9);
		objects.current.frontHair.position.x = 10;
		objects.current.frontHair.position.y = 5;
		objects.current.stars.scale.set(0.9, 0.9);
		objects.current.backgroundSprite.scale.set(0.65, 0.28);
		objects.current.backgroundCloudSprite.scale.set(0.75, 0.75);
		objects.current.backgroundCloudSprite.position.x = 100;
		objects.current.backgroundCloudSprite.position.y = -300;

		const container = new PIXI.Container();
		container.addChild(objects.current.backgroundSprite);
		container.addChild(objects.current.stars);
		container.addChild(objects.current.backgroundCloudSprite);
		container.addChild(objects.current.clouds);
		container.addChild(objects.current.strawberries);
		container.addChild(objects.current.frontHair);
		container.addChild(objects.current.madeline);
		container.addChild(objects.current.hair);

		app.current?.stage.addChild(container);

		container.setTransform(0, 0, 2, 2);

		return () => {
			for (const key in objects.current) {
				const obj = objects.current[key];
				if (!obj.destroyed) obj.destroy(true);
			}

			for (const key in textures.current) {
				const tex = textures.current[key];
				tex.destroy(true);
			}

			if (strawberrySpriteSheet.current) strawberrySpriteSheet.current.destroy(true);
			if (goldStrawberrySpriteSheet.current) goldStrawberrySpriteSheet.current.destroy(true);
			if (baseHairSpriteSheet.current) baseHairSpriteSheet.current.destroy(true);
			if (frontHairSpriteSheet.current) frontHairSpriteSheet.current.destroy(true);
			if (starASpriteSheet.current) starASpriteSheet.current.destroy(true);
			if (starBSpriteSheet.current) starBSpriteSheet.current.destroy(true);
			if (starCSpriteSheet.current) starCSpriteSheet.current.destroy(true);

			if (!starASprite.destroyed) starASprite.destroy(true);
			if (!starBSprite.destroyed) starBSprite.destroy(true);
			if (!starCSprite.destroyed) starCSprite.destroy(true);

			if (!hairSprite.destroyed) hairSprite.destroy(true);
			if (!frontHairSprite.destroyed) frontHairSprite.destroy(true);

			if (!container.destroyed) container.destroy(true);
		};
	}, [app]);

	return (
		<Container ref={containerRef}>
			<Canvas width={1092} height={332} ref={canvasRef} />
			<TotalText>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalText>
		</Container>
	);
}

const TotalText = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	text-shadow: -1px 4px black;

	position: absolute;

	top: 10%;
	right: 20px;
`;

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
	background: #42cfce;
`;
