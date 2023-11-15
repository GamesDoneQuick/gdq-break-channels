import asset_playerColor from './assets/images/assets_playercolor.png';
import asset_playerNormal from './assets/images/assets_playerbump.jpg';
import asset_bodyGradient from './assets/images/assets_bodygradient.png';
import asset_skinGradient from './assets/images/assets_skingradient.png';
import qwopSheet from './assets/data/assets_playercolor.json';

import { MutableRefObject, useCallback, useEffect, useRef } from 'react';

import { Application, BaseTexture, Container, Sprite, Spritesheet, Texture } from 'pixi.js';
import { GradientBevelShader } from './gradient-bevel-shader';
import { WorldWithDestroy } from './useBox2D';

export const WorldData = {
	densityFactor: 1,
	gravity: 10,
	torqueFactor: 1,
	worldScale: 20,
};

export interface QWOPGuy {
	container: Container;

	body: Sprite;
	head: Sprite;
	lFArm: Sprite;
	lUArm: Sprite;
	lThigh: Sprite;
	lCalf: Sprite;
	lFoot: Sprite;
	rFArm: Sprite;
	rUArm: Sprite;
	rThigh: Sprite;
	rCalf: Sprite;
	rFoot: Sprite;
}

interface QWOPGuyPrivate extends QWOPGuy {
	playerColor: Spritesheet;
	playerNormal: Spritesheet;
	bodyGradient: Texture;
	skinGradient: Texture;
}

export function useQWOPGuy(app: MutableRefObject<Application | undefined>) {
	const ref = useRef<QWOPGuy | null>(null);

	useEffect(() => {
		if (!app.current) return;

		const container = new Container();

		const playerColor = new Spritesheet(BaseTexture.from(asset_playerColor), qwopSheet);
		playerColor.parse();
		const playerNormal = new Spritesheet(BaseTexture.from(asset_playerNormal), qwopSheet);
		playerNormal.parse();

		const bodyGradient = Texture.from(asset_bodyGradient);
		const skinGradient = Texture.from(asset_skinGradient);

		const createSprite = (key: string, body?: boolean) => {
			const sprite = new Sprite(playerColor.textures[key]);
			const normalSprite = new Sprite(playerNormal.textures[key]);
			sprite.addChild(normalSprite);

			sprite.filters = [new GradientBevelShader(normalSprite, body ? bodyGradient : skinGradient)];

			sprite.anchor.set(0.5);
			normalSprite.anchor.set(0.5);

			container.addChild(sprite);
			return sprite;
		};

		const lUArm = createSprite('LUarm');
		const lFArm = createSprite('LFarm');
		const lCalf = createSprite('Lcalf');
		const lThigh = createSprite('LThigh');
		const lFoot = createSprite('Lfoot');
		const body = createSprite('Body', true);
		const head = createSprite('Head');
		const rCalf = createSprite('Rcalf');
		const rThigh = createSprite('Rthigh');
		const rFoot = createSprite('Rfoot');
		const rUArm = createSprite('RUArm');
		const rFArm = createSprite('RFarm');

		const qwopGuy: QWOPGuyPrivate = {
			container,
			playerColor,
			playerNormal,
			bodyGradient,
			skinGradient,
			body,
			head,
			lFArm,
			lUArm,
			lThigh,
			lCalf,
			lFoot,
			rFArm,
			rUArm,
			rThigh,
			rCalf,
			rFoot,
		};

		ref.current = qwopGuy;

		return () => {
			container.destroy(true);
			playerColor.destroy(true);
			playerNormal.destroy(true);
			bodyGradient.destroy(true);
			skinGradient.destroy(true);
		};
	}, [app]);

	return ref;
}

export interface QWOPPhysics {
	reset: () => void;

	world: Box2D.b2World;

	body: Box2D.b2Body;
	head: Box2D.b2Body;
	lFArm: Box2D.b2Body;
	lUArm: Box2D.b2Body;
	lThigh: Box2D.b2Body;
	lCalf: Box2D.b2Body;
	lFoot: Box2D.b2Body;
	rFArm: Box2D.b2Body;
	rUArm: Box2D.b2Body;
	rThigh: Box2D.b2Body;
	rCalf: Box2D.b2Body;
	rFoot: Box2D.b2Body;

	neck: Box2D.b2Joint;
	leftShoulder: Box2D.b2Joint;
	leftHip: Box2D.b2Joint;
	leftElbow: Box2D.b2Joint;
	leftKnee: Box2D.b2Joint;
	leftAnkle: Box2D.b2Joint;
	rightShoulder: Box2D.b2Joint;
	rightHip: Box2D.b2Joint;
	rightElbow: Box2D.b2Joint;
	rightKnee: Box2D.b2Joint;
	rightAnkle: Box2D.b2Joint;

	contactListener: QWOPListener;
}

type QWOPListener = Box2D.JSContactListener & {
	callback?: (contact: Box2D.b2Contact) => void;
};

export function usePhysicsBody(
	box2d?: typeof Box2D,
	world?: WorldWithDestroy,
	recordLeak?: Box2D.LeakMitigator['recordLeak'],
): MutableRefObject<QWOPPhysics | null> {
	const ref = useRef<QWOPPhysics | null>(null);

	const callback = useCallback(() => {
		if (!ref.current || !box2d) return;

		const {
			body,
			head,
			lFArm,
			lThigh,
			lUArm,
			lCalf,
			lFoot,
			rFArm,
			rUArm,
			rCalf,
			rFoot,
			rThigh,
			neck,
			rightShoulder,
			leftShoulder,
			leftHip,
			rightHip,
			leftElbow,
			rightElbow,
			leftKnee,
			rightKnee,
			leftAnkle,
			rightAnkle,
		} = ref.current;

		const resetBody = (body: Box2D.b2Body, x: number, y: number, angle: number) => {
			const pos = new box2d.b2Vec2(x, y);
			body.SetTransform(pos, angle);
			box2d.destroy(pos);
		};

		resetBody(body, 2.5111726226000157, -1.8709517533957938, -1.2514497119301329);
		resetBody(head, 3.888130278719558, -5.621802929095265, 0.06448415835225099);
		resetBody(lFArm, 5.830008603424893, -2.8733539631159584, -1.2049772618421237);
		resetBody(lThigh, 2.5648987628203876, 1.648090668682522, -2.0177234426823394);
		resetBody(lUArm, 4.417861014480877, -2.806563606410589, 0.9040095895272826);
		resetBody(lCalf, 3.12585731974087, 5.525511655361298, -1.5903971528225265);
		resetBody(lFoot, 3.926921842806667, 8.08884032049622, 0.12027524643408766);
		resetBody(rFArm, 0.4078206420797428, -1.0599953233084172, -1.7553358283857299);
		resetBody(rUArm, 1.1812303663272852, -3.5000256518601014, -0.5222217404634386);
		resetBody(rCalf, -0.07253905736790486, 5.347881871063159, -0.7588859967104447);
		resetBody(rFoot, -1.1254742643908706, 7.567193169625567, 0.5897605418219602);
		resetBody(rThigh, 1.6120186135678773, 2.0615320561881516, 1.4849422964528027);

		const resetJoint = (joint: Box2D.b2Joint, upperAngle: number, lowerAngle: number, motorEnable: boolean) => {
			setLimits(box2d, joint, lowerAngle, upperAngle);
			enableMotor(box2d, joint, motorEnable);
			enableLimit(box2d, joint, true);
		};

		resetJoint(neck, 0, -0.5, false);
		resetJoint(rightShoulder, 1.5, -0.5, true);
		resetJoint(leftShoulder, 0, -2, true);
		resetJoint(leftHip, 0.5, -1.5, true);
		resetJoint(rightHip, 0.7, -1.3, true);
		resetJoint(leftElbow, 0.5, -0.1, false);
		resetJoint(rightElbow, 0.5, -0.1, false);
		resetJoint(leftKnee, 0, -1.6, true);
		resetJoint(rightKnee, 0.3, -1.3, true);
		resetJoint(leftAnkle, 0.5, -0.5, false);
		resetJoint(rightAnkle, 0.5, -0.5, false);
	}, [ref, box2d]);

	useEffect(() => {
		if (!box2d || !world || !recordLeak) return;

		const createBody = (key: string, x: number, y: number, angle: number, densityMultiplier = 1) => {
			const spriteDef = qwopSheet.frames[key];
			const sourceSize = spriteDef.sourceSize;

			const pos = new box2d.b2Vec2(x, y);

			const bodyDef = new box2d.b2BodyDef();
			bodyDef.set_type(box2d.b2_dynamicBody);
			bodyDef.set_position(pos);
			bodyDef.set_angle(angle);

			const body = recordLeak(world.CreateBody(bodyDef));
			const shape = new box2d.b2PolygonShape();
			shape.SetAsBox((0.5 * sourceSize.w) / WorldData.worldScale, (0.5 * sourceSize.h) / WorldData.worldScale);

			const fixture = recordLeak(body.CreateFixture(shape, densityMultiplier * WorldData.densityFactor));
			fixture.SetFriction(0.2);
			fixture.SetRestitution(0);

			const filterData = new box2d.b2Filter();
			filterData.set_categoryBits(2);
			filterData.set_maskBits(65533);

			fixture.SetFilterData(filterData);

			box2d.destroy(filterData);
			box2d.destroy(pos);
			box2d.destroy(shape);
			box2d.destroy(bodyDef);

			return body;
		};

		const body = createBody('Body', 2.5111726226000157, -1.8709517533957938, -1.2514497119301329);
		const head = createBody('Head', 3.888130278719558, -5.621802929095265, 0.06448415835225099);
		const lFArm = createBody('LFarm', 5.830008603424893, -2.8733539631159584, -1.2049772618421237);
		const lThigh = createBody('LThigh', 2.5648987628203876, 1.648090668682522, -2.0177234426823394);
		const lUArm = createBody('LUarm', 4.417861014480877, -2.806563606410589, 0.9040095895272826);
		const lCalf = createBody('Lcalf', 3.12585731974087, 5.525511655361298, -1.5903971528225265);
		const lFoot = createBody('Lfoot', 3.926921842806667, 8.08884032049622, 0.12027524643408766, 3);
		const rFArm = createBody('RFarm', 0.4078206420797428, -1.0599953233084172, -1.7553358283857299);
		const rUArm = createBody('RUArm', 1.1812303663272852, -3.5000256518601014, -0.5222217404634386);
		const rCalf = createBody('Rcalf', -0.07253905736790486, 5.347881871063159, -0.7588859967104447);
		const rFoot = createBody('Rfoot', -1.1254742643908706, 7.567193169625567, 0.5897605418219602, 3);
		const rThigh = createBody('Rthigh', 1.6120186135678773, 2.0615320561881516, 1.4849422964528027);

		const createJoint = (
			bodyA: Box2D.b2Body,
			bodyB: Box2D.b2Body,
			pointA: { x: number; y: number },
			pointB: { x: number; y: number },
			upperAngle: number,
			lowerAngle: number,
			enableMotor: boolean,
			maxMotorTorque: number,
			referenceAngle: number,
		) => {
			const jointDef = new box2d.b2RevoluteJointDef();
			jointDef.set_bodyA(bodyA);
			jointDef.set_bodyB(bodyB);

			const worldPointA = new box2d.b2Vec2(pointA.x, pointA.y);
			const worldPointB = new box2d.b2Vec2(pointB.x, pointB.y);
			jointDef.set_localAnchorA(recordLeak(bodyA.GetLocalPoint(worldPointA)));
			jointDef.set_localAnchorB(recordLeak(bodyB.GetLocalPoint(worldPointB)));

			jointDef.set_enableLimit(true);
			jointDef.set_upperAngle(upperAngle);
			jointDef.set_lowerAngle(lowerAngle);
			jointDef.set_enableMotor(enableMotor);
			jointDef.set_maxMotorTorque(maxMotorTorque);
			jointDef.set_referenceAngle(referenceAngle);

			const joint = recordLeak(world.CreateJoint(jointDef));

			box2d.destroy(worldPointA);
			box2d.destroy(worldPointB);
			box2d.destroy(jointDef);

			return joint;
		};

		const neck = createJoint(
			head,
			body,
			{ x: 3.5885141908253755, y: -4.526224223627244 },
			{ x: 3.588733341630704, y: -4.526434658500262 },
			0,
			-0.5,
			false,
			0,
			-1.308996406363529,
		);

		const rightShoulder = createJoint(
			rUArm,
			body,
			{ x: 2.228476821818547, y: -4.086468732185028 },
			{ x: 2.228929993886102, y: -4.08707555939957 },
			1.5,
			-0.5,
			true,
			1e3 * WorldData.torqueFactor,
			-0.7853907065463961,
		);

		const leftShoulder = createJoint(
			lUArm,
			body,
			{ x: 3.6241979856895377, y: -3.5334881618011442 },
			{ x: 3.6241778782207157, y: -3.533950434531982 },
			0,
			-2,
			true,
			1e3 * WorldData.torqueFactor,
			-2.09438311816829,
		);

		const leftHip = createJoint(
			lThigh,
			body,
			{ x: 2.0030339754142847, y: 0.23737160622781284 },
			{ x: 2.003367181376716, y: 0.23802590387419476 },
			0.5,
			-1.5,
			true,
			6e3 * WorldData.torqueFactor,
			0.7258477508944043,
		);

		const rightHip = createJoint(
			rThigh,
			body,
			{ x: 1.2475900729227194, y: -0.011046642863645761 },
			{ x: 1.2470052823973599, y: -0.011635347168778898 },
			0.7,
			-1.3,
			true,
			6e3 * WorldData.torqueFactor,
			-2.719359381718199,
		);

		const leftElbow = createJoint(
			lFArm,
			lUArm,
			{ x: 5.525375332758792, y: -1.63856204930891 },
			{ x: 5.52537532948459, y: -1.6385620366077662 },
			0.5,
			-0.1,
			false,
			0,
			2.09438311816829,
		);

		const rightElbow = createJoint(
			rFArm,
			rUArm,
			{ x: -0.006090859076100963, y: -2.8004758838752157 },
			{ x: -0.0060908611708438976, y: -2.8004758929205846 },
			0.5,
			-0.1,
			false,
			0,
			1.2968199012274688,
		);

		const leftKnee = createJoint(
			lCalf,
			lThigh,
			{ x: 3.384323411985692, y: 3.5168931240916876 },
			{ x: 3.3844684376952108, y: 3.5174122997898016 },
			0,
			-1.6,
			true,
			3e3 * WorldData.torqueFactor,
			-0.3953113764119829,
		);

		const rightKnee = createJoint(
			rCalf,
			rThigh,
			{ x: 1.4982369235492752, y: 4.175600306005656 },
			{ x: 1.4982043532615996, y: 4.17493520671361 },
			0.3,
			-1.3,
			true,
			3e3 * WorldData.torqueFactor,
			2.2893406247158676,
		);

		const leftAnkle = createJoint(
			lFoot,
			lCalf,
			{ x: 3.312322507818897, y: 7.947704853895541 },
			{ x: 3.3123224825088817, y: 7.947704836256229 },
			0.5,
			-0.5,
			false,
			2e3 * WorldData.torqueFactor,
			-1.7244327585010226,
		);

		const rightAnkle = createJoint(
			rFoot,
			rCalf,
			{ x: -1.6562855402197227, y: 6.961551452557676 },
			{ x: -1.655726670462596, y: 6.961493826969391 },
			0.5,
			-0.5,
			false,
			2e3 * WorldData.torqueFactor,
			-1.5708045825942758,
		);

		const contactListener = Object.assign(new box2d.JSContactListener(), {
			BeginContact: (contact: Box2D.b2Contact | number) => {
				if (typeof contact === 'number') {
					contact = box2d.wrapPointer(contact, box2d.b2Contact);
				}

				contactListener.callback?.(contact);
			},
			EndContact: () => {},
			PreSolve: () => {},
			PostSolve: () => {},
			callback: undefined,
		}) as QWOPListener;

		world.SetContactListener(contactListener);

		ref.current = {
			reset: callback,

			box2d,
			world,
			body,
			head,
			lFArm,
			lThigh,
			lUArm,
			lCalf,
			lFoot,
			rFArm,
			rUArm,
			rCalf,
			rFoot,
			rThigh,

			neck,
			leftShoulder,
			leftHip,
			leftElbow,
			leftKnee,
			leftAnkle,
			rightShoulder,
			rightHip,
			rightElbow,
			rightKnee,
			rightAnkle,

			contactListener,
		} as QWOPPhysics;

		return () => {
			box2d.destroy(contactListener);

			if (world.destroyed) return;

			world.DestroyBody(body);
			world.DestroyBody(head);
			world.DestroyBody(lFArm);
			world.DestroyBody(lThigh);
			world.DestroyBody(lUArm);
			world.DestroyBody(lCalf);
			world.DestroyBody(lFoot);
			world.DestroyBody(rFArm);
			world.DestroyBody(rUArm);
			world.DestroyBody(rCalf);
			world.DestroyBody(rFoot);
			world.DestroyBody(rThigh);

			world.DestroyJoint(neck);
			world.DestroyJoint(leftShoulder);
			world.DestroyJoint(leftHip);
			world.DestroyJoint(leftElbow);
			world.DestroyJoint(leftKnee);
			world.DestroyJoint(leftAnkle);
			world.DestroyJoint(rightShoulder);
			world.DestroyJoint(rightHip);
			world.DestroyJoint(rightElbow);
			world.DestroyJoint(rightKnee);
			world.DestroyJoint(rightAnkle);
		};
	}, [box2d, recordLeak]);

	return ref;
}

export function setMotorSpeed(box2d: typeof Box2D, joint: Box2D.b2Joint, motorSpeed: number) {
	box2d.b2RevoluteJoint.prototype.SetMotorSpeed.call(joint, motorSpeed);
}

export function setLimits(box2d: typeof Box2D, joint: Box2D.b2Joint, lowerLimit: number, upperLimit: number) {
	box2d.b2RevoluteJoint.prototype.SetLimits.call(joint, lowerLimit, upperLimit);
}

export function enableMotor(box2d: typeof Box2D, joint: Box2D.b2Joint, enable: boolean) {
	box2d.b2RevoluteJoint.prototype.EnableMotor.call(joint, enable);
}

export function enableLimit(box2d: typeof Box2D, joint: Box2D.b2Joint, enable: boolean) {
	box2d.b2RevoluteJoint.prototype.EnableLimit.call(joint, enable);
}
