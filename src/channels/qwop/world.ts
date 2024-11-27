import asset_springBg from './assets/images/assets_sprintbg.jpg';
import asset_underground from './assets/images/assets_underground.png';
import asset_uiSprites from './assets/images/assets_UISprites.png';
import uiSheet from './assets/data/assets_UISprites.json';

import { Application, BaseTexture, Container, Sprite, Spritesheet, Texture, TilingSprite } from 'pixi.js';
import { MutableRefObject, useCallback, useEffect, useReducer, useRef } from 'react';
import { WorldData } from './qwop-guy';
import { WorldWithDestroy } from './useBox2D';

export interface World {
	background: Sprite;
	startingLine: Sprite;
	highScoreLine: Sprite;
	underground: TilingSprite;
}

export function useWorld(
	app: MutableRefObject<Application | undefined>,
	box2d?: typeof Box2D,
	world?: WorldWithDestroy,
	recordLeak?: Box2D.LeakMitigator['recordLeak'],
) {
	const spriteRef = useRef<World | null>(null);
	const physicsRef = useRef<Box2D.b2Body | null>(null);
	const spritesheet = useRef<Spritesheet>();

	useEffect(() => {
		if (!app.current) return;

		const uiSprites = new Spritesheet(BaseTexture.from(asset_uiSprites), uiSheet);
		uiSprites.parse();

		spritesheet.current = uiSprites;

		const backgroundTexture = Texture.from(asset_springBg);

		const background = new Sprite(backgroundTexture);
		background.position.set(0, -80);
		background.width = 1092;
		app.current.stage.addChild(background);

		const undergroundTexture = Texture.from(asset_underground);

		const underground = new TilingSprite(undergroundTexture, 128, 64);
		underground.position.set(0, 320);
		underground.width = 1092;
		underground.height = 64;
		app.current.stage.addChild(underground);

		const startingLine = new Sprite(spritesheet.current.textures.Starting_Line0000);
		startingLine.anchor.set(0.5);
		startingLine.scale.y = 0.7;
		app.current.stage.addChild(startingLine);

		const highScoreLine = new Sprite(spritesheet.current.textures.Starting_Line0000);
		highScoreLine.anchor.set(0.5);
		highScoreLine.scale.y = 0.7;
		app.current.stage.addChild(highScoreLine);

		spriteRef.current = {
			background,
			underground,
			startingLine,
			highScoreLine,
		};

		return () => {
			if (!background.destroyed) background.destroy(true);
			if (!underground.destroyed) underground.destroy(true);
			if (!startingLine.destroyed) startingLine.destroy(true);
			if (!highScoreLine.destroyed) highScoreLine.destroy(true);
			uiSprites.destroy(true);
		};
	}, [app]);

	useEffect(() => {
		if (!box2d || !world || !recordLeak) return;

		const pos = new box2d.b2Vec2(0, 10.74275);

		const floorDef = new box2d.b2BodyDef();
		floorDef.set_type(box2d.b2_staticBody);
		floorDef.set_position(pos);

		const floor = recordLeak(world.CreateBody(floorDef));
		const shape = new box2d.b2PolygonShape();
		shape.SetAsBox(1000, 32 / WorldData.worldScale);

		const fixture = recordLeak(floor.CreateFixture(shape, 30));
		fixture.SetFriction(0.2);
		fixture.SetRestitution(0);

		const filterData = new box2d.b2Filter();
		filterData.set_categoryBits(1);
		filterData.set_maskBits(65535);

		fixture.SetFilterData(filterData);

		box2d.destroy(filterData);
		box2d.destroy(pos);
		box2d.destroy(shape);
		box2d.destroy(floorDef);

		physicsRef.current = floor;
	}, [box2d, world, recordLeak]);

	return [spriteRef, physicsRef] as const;
}

export function useHurdles(
	container: MutableRefObject<Container | null>,
	currentPos: MutableRefObject<number>,
	box2d?: typeof Box2D,
	world?: WorldWithDestroy,
	recordLeak?: Box2D.LeakMitigator['recordLeak'],
) {
	const spritesheet = useRef<Spritesheet>();

	const sprites = useRef<[Sprite, Sprite][]>([]);
	const hurdles = useRef<[Box2D.b2Body, Box2D.b2Body, Box2D.b2Joint][]>([]);

	useEffect(() => {
		if (!container.current) return;

		const uiSprites = new Spritesheet(BaseTexture.from(asset_uiSprites), uiSheet);
		uiSprites.parse();

		spritesheet.current = uiSprites;

		return () => {
			sprites.current
				.splice(0, sprites.current.length)
				.flat()
				.forEach((sprite) => {
					if (!sprite.destroyed) sprite.destroy(true);
				});

			uiSprites.destroy(true);
		};
	}, [container.current]);

	useEffect(() => {
		if (!box2d || !world || !recordLeak) return;

		return () => {
			if (world.destroyed) return;

			hurdles.current.splice(0, hurdles.current.length).forEach((hurdle) => {
				world.DestroyJoint(hurdle[2]);
				world.DestroyBody(hurdle[0]);
				world.DestroyBody(hurdle[1]);
			});
		};
	}, [box2d, world, recordLeak]);

	const addHurdle = useCallback(() => {
		if (!container.current || !box2d || !world || !recordLeak || !spritesheet.current) return;

		const toFree: {
			__destroy__(): void;
		}[] = [];
		const addToFree = <
			T extends {
				__destroy__(): void;
			},
		>(
			obj: T,
		) => {
			toFree.push(obj);
			return obj;
		};

		const baseSprite = new Sprite(spritesheet.current.textures.hurdlebase);
		const topSprite = new Sprite(spritesheet.current.textures.hurdletop);
		baseSprite.anchor.set(0.5);
		topSprite.anchor.set(0.5);

		baseSprite.scale.set(0.5);
		topSprite.scale.set(0.5);

		container.current.addChild(baseSprite);
		container.current.addChild(topSprite);

		const randomOffset = 37 * Math.random();

		const hurdleTopPos = addToFree(
			new box2d.b2Vec2(
				currentPos.current + randomOffset + 17.3 / WorldData.worldScale,
				101.15 / WorldData.worldScale - 20,
			),
		);
		const hurdleBasePos = addToFree(
			new box2d.b2Vec2(currentPos.current + randomOffset, 175.5 / WorldData.worldScale - 20),
		);

		const velocity = addToFree(new box2d.b2Vec2(0, 200));

		const hurdleBaseDef = addToFree(new box2d.b2BodyDef());
		hurdleBaseDef.set_type(box2d.b2_dynamicBody);
		hurdleBaseDef.set_position(hurdleBasePos);
		hurdleBaseDef.set_linearVelocity(velocity);
		hurdleBaseDef.set_angularVelocity(0);

		const hurdleBase = recordLeak(world.CreateBody(hurdleBaseDef));
		const hurdleBaseShape = addToFree(new box2d.b2PolygonShape());
		hurdleBaseShape.SetAsBox((0.5 * 67) / WorldData.worldScale, (0.5 * 12) / WorldData.worldScale);

		const hurdleBaseFixture = recordLeak(hurdleBase.CreateFixture(hurdleBaseShape, WorldData.densityFactor));

		const hurdleBaseFilterData = addToFree(new box2d.b2Filter());
		//hurdleBaseFilterData.set_categoryBits(4);
		//hurdleBaseFilterData.set_maskBits(65529);

		hurdleBaseFixture.SetFilterData(hurdleBaseFilterData);

		const hurdleTopDef = addToFree(new box2d.b2BodyDef());
		hurdleTopDef.set_type(box2d.b2_dynamicBody);
		hurdleTopDef.set_position(hurdleTopPos);
		hurdleTopDef.set_linearVelocity(velocity);
		hurdleTopDef.set_angularVelocity(0);

		const hurdleTop = recordLeak(world.CreateBody(hurdleTopDef));
		const hurdleTopShape = addToFree(new box2d.b2PolygonShape());
		hurdleTopShape.SetAsBox((0.5 * 21.5) / WorldData.worldScale, (0.5 * 146) / WorldData.worldScale);

		const hurdleTopFixture = recordLeak(hurdleTop.CreateFixture(hurdleTopShape, WorldData.densityFactor));

		const hurdleTopFilterData = addToFree(new box2d.b2Filter());
		//hurdleTopFilterData.set_categoryBits(4);
		//hurdleTopFilterData.set_maskBits(65531);

		hurdleTopFixture.SetFilterData(hurdleTopFilterData);

		const jointDef = addToFree(new box2d.b2RevoluteJointDef());
		jointDef.set_bodyA(hurdleTop);
		jointDef.set_bodyB(hurdleBase);

		jointDef.localAnchorA.Set(3.6 / WorldData.worldScale, 74.6 / WorldData.worldScale);
		jointDef.localAnchorB.Set(20.9 / WorldData.worldScale, 0.25 / WorldData.worldScale);
		jointDef.set_enableLimit(true);

		const joint = recordLeak(world.CreateJoint(jointDef));

		toFree.forEach(box2d.destroy);

		sprites.current.push([baseSprite, topSprite]);
		hurdles.current.push([hurdleBase, hurdleTop, joint]);
	}, [container, box2d, world, recordLeak, spritesheet]);

	const resetHurdles = useCallback(() => {
		if (!container.current || !box2d || !world) return;

		const stage = container.current;

		sprites.current
			.splice(0, sprites.current.length)
			.flat()
			.forEach((sprite) => {
				stage.removeChild(sprite);
				sprite.destroy(false);
			});

		if (world.destroyed) return;

		hurdles.current.splice(0, hurdles.current.length).forEach((hurdle) => {
			world.DestroyJoint(hurdle[2]);
			world.DestroyBody(hurdle[0]);
			world.DestroyBody(hurdle[1]);
		});
	}, [container, box2d, world]);

	return [sprites.current, hurdles.current, addHurdle, resetHurdles] as const;
}
