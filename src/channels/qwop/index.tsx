/**
 * @file QWOP Channel. Used with permission from Bennett Foddy.
 * @copyright Foddy.net 2008-2015.
 * @author Bennett Foddy
 * @author Dillon Pentz <dillon@vodbox.io>
 */

/**
 * This code has been reverse-engineered and adapted from the
 * HTML5/WebGL port of QWOP.
 *
 * Care has been taken to use only game code and assets owned by
 * Bennett Foddy. All links to proprietary engine and library code has
 * either been removed or entirely reworked to use open-source or
 * compatibly licensed equivalents (i.e. PIXI for rendering and
 * box2d-wasm for physics).
 *
 * While this source is being made available publicly, all rights to
 * the game QWOP and its assets are still copyright of Bennett Foddy,
 * and are used here with permission.
 */

import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import { ChannelProps, registerChannel } from '../channels';
import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import {
	QWOPGuy,
	QWOPPhysics,
	WorldData,
	enableLimit,
	enableMotor,
	setLimits,
	setMotorSpeed,
	usePhysicsBody,
	useQWOPGuy,
} from './qwop-guy';
import { GradientBevelShader } from './gradient-bevel-shader';
import { useHurdles, useWorld } from './world';
import { Container as PIXIContainer } from 'pixi.js';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { useReplicant } from 'use-nodecg';
import { Total } from '@gdq/types/tracker';
import { useBox2D } from './useBox2D';
import { useListenForFn } from '@gdq/lib/hooks/useListenForFn';

import ribbon from './assets/images/ribbon.png';

registerChannel('QWOP', 8, QWOP, {
	handle: '\xA9 Foddy.net — used with permission',
	position: 'bottomRight',
});

const keysRep = nodecg.Replicant('qwop-keys', {
	defaultValue: {
		QDown: false,
		WDown: false,
		ODown: false,
		PDown: false,
	},
});

const recordRep = nodecg.Replicant('qwop-record', {
	defaultValue: -90,
	persistent: true,
});

const state = {
	Fallen: false,
};

export function QWOP(_: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);

	const containerRef = useRef<PIXIContainer | null>(null);
	const keysRef = useRef<HTMLDivElement>(null);
	const hsRef = useRef<HTMLDivElement>(null);
	const currentPos = useRef(0);

	const [card, setCard] = useState<number | null>(null);

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		if (
			!box2d ||
			!qwopGuy.current ||
			!qwopPhysics.current ||
			!worldSprites.current ||
			!containerRef.current ||
			!floor.current ||
			!keysRep.value ||
			!recordLeak
		)
			return;

		if (keysRef.current) {
			const qEl = keysRef.current.children[0];
			const wEl = keysRef.current.children[1];
			const oEl = keysRef.current.children[3];
			const pEl = keysRef.current.children[4];

			if (keysRep.value.QDown) {
				qEl.classList.remove('unpressed');
			} else {
				qEl.classList.add('unpressed');
			}

			if (keysRep.value.WDown) {
				wEl.classList.remove('unpressed');
			} else {
				wEl.classList.add('unpressed');
			}

			if (keysRep.value.ODown) {
				oEl.classList.remove('unpressed');
			} else {
				oEl.classList.add('unpressed');
			}

			if (keysRep.value.PDown) {
				pEl.classList.remove('unpressed');
			} else {
				pEl.classList.add('unpressed');
			}
		}

		const {
			leftShoulder,
			leftHip,
			leftElbow,
			leftKnee,
			rightShoulder,
			rightHip,
			rightElbow,
			rightKnee,
			contactListener,

			head,
			rFArm,
			lFArm,
			rUArm,
			lUArm,

			body,

			reset,
		} = qwopPhysics.current;

		const score = Math.round(body.GetWorldCenter().x) / 10;

		if (keysRef.current) {
			keysRef.current.children[2].innerHTML = `${score} metres`;
		}

		if (!state.Fallen) {
			head.ApplyTorque(-8 * (head.GetAngle() + 0.2), true);

			if (keysRep.value.QDown) {
				setMotorSpeed(box2d, rightHip, 2.5);
				setMotorSpeed(box2d, leftHip, -2.5);
				setMotorSpeed(box2d, rightShoulder, -2);
				setMotorSpeed(box2d, rightElbow, -10);
				setMotorSpeed(box2d, leftShoulder, 2);
				setMotorSpeed(box2d, leftElbow, -10);
			} else if (keysRep.value.WDown) {
				setMotorSpeed(box2d, rightHip, -2.5);
				setMotorSpeed(box2d, leftHip, 2.5);
				setMotorSpeed(box2d, rightShoulder, 2);
				setMotorSpeed(box2d, rightElbow, 10);
				setMotorSpeed(box2d, leftShoulder, -2);
				setMotorSpeed(box2d, leftElbow, 10);
			} else {
				setMotorSpeed(box2d, rightHip, 0);
				setMotorSpeed(box2d, leftHip, 0);
				setMotorSpeed(box2d, leftShoulder, 0);
				setMotorSpeed(box2d, rightShoulder, 0);
			}

			if (keysRep.value.ODown) {
				setMotorSpeed(box2d, rightKnee, 2.5);
				setMotorSpeed(box2d, leftKnee, -2.5);
				setLimits(box2d, leftHip, -1, 1);
				setLimits(box2d, rightHip, -1.3, 0.7);
			} else if (keysRep.value.PDown) {
				setMotorSpeed(box2d, rightKnee, -2.5);
				setMotorSpeed(box2d, leftKnee, 2.5);
				setLimits(box2d, leftHip, -1.5, 0.5);
				setLimits(box2d, rightHip, -0.8, 1.2);
			} else {
				setMotorSpeed(box2d, rightKnee, 0);
				setMotorSpeed(box2d, leftKnee, 0);
			}
		}

		qwopPhysics.current.world.Step(0.016, 5, 5);

		const updateSprite = (key: keyof QWOPPhysics & keyof QWOPGuy) => {
			const physics = qwopPhysics.current![key];
			const sprite = qwopGuy.current![key];

			const pos = recordLeak(physics.GetPosition());
			sprite.position.set(pos.x * WorldData.worldScale, pos.y * WorldData.worldScale);
			sprite.rotation = physics.GetAngle();

			const filter = sprite.filters![0] as GradientBevelShader;
			filter.lightVec = {
				x: Math.cos(physics.GetAngle() - 1),
				y: Math.sin(physics.GetAngle() - 1),
			};
		};

		updateSprite('body');
		updateSprite('head');
		updateSprite('lFArm');
		updateSprite('lThigh');
		updateSprite('lUArm');
		updateSprite('lCalf');
		updateSprite('lFoot');
		updateSprite('rFArm');
		updateSprite('rUArm');
		updateSprite('rCalf');
		updateSprite('rFoot');
		updateSprite('rThigh');

		hurdleSprites.forEach(([baseSprite, topSprite], idx) => {
			const [basePhysics, topPhysics] = hurdlePhysics[idx];

			const basePos = recordLeak(basePhysics.GetPosition());
			const topPos = recordLeak(topPhysics.GetPosition());

			baseSprite.position.set(basePos.x * WorldData.worldScale, basePos.y * WorldData.worldScale);
			baseSprite.rotation = basePhysics.GetAngle();

			topSprite.position.set(topPos.x * WorldData.worldScale, topPos.y * WorldData.worldScale);
			topSprite.rotation = topPhysics.GetAngle();
		});

		if (!state.Fallen) {
			containerRef.current.position.set(350 - qwopGuy.current.body.position.x, 200 - 64);
			worldSprites.current.underground.tilePosition.set(-qwopGuy.current.body.position.x, 0);
			worldSprites.current.startingLine.position.set(450 - qwopGuy.current.body.position.x, 281.5);
			worldSprites.current.highScoreLine.position.set(
				413 + (recordRep.value ?? -90) * 10 * WorldData.worldScale - qwopGuy.current.body.position.x,
				281.5,
			);

			if (hsRef.current) {
				hsRef.current.style.transform = `translateX(-50%) translateX(${
					(recordRep.value ?? -90) * 10 * WorldData.worldScale - qwopGuy.current.body.position.x
				}px)`;

				const scoreText = `Best: ${recordRep.value}m`;
				if (hsRef.current.innerText !== scoreText) hsRef.current.innerText = scoreText;
			}
		}

		/**
		 * This method of keeping a floor under QWOP guy is not accurate to the original.
		 * Frankly, this is quite bad, but it gets things close enough to the real deal.
		 *
		 * At some point in the future, a method utilizing multiple unmoving floor pieces
		 * would be better.
		 */
		const physicsPos = recordLeak(qwopPhysics.current.body.GetPosition());
		const pos1 = new box2d.b2Vec2(physicsPos.x, 10.74275);
		floor.current.SetTransform(pos1, 0);
		box2d.destroy(pos1);

		if (!state.Fallen) currentPos.current = physicsPos.x;

		if (!contactListener.callback) {
			contactListener.callback = (contact) => {
				if (state.Fallen) return;

				const bodyA = recordLeak(contact.GetFixtureA().GetBody());
				const bodyB = recordLeak(contact.GetFixtureB().GetBody());

				if (
					bodyA !== head &&
					(bodyB !== floor.current ||
						(bodyA !== rFArm && bodyA !== rUArm && bodyA !== lFArm && bodyA !== lUArm))
				)
					return;

				if (bodyA === head && bodyB !== floor.current) {
					const speed = recordLeak(bodyB.GetLinearVelocity());
					if (speed.Length() < 75) return;
				}

				state.Fallen = true;

				const score = Math.round(body.GetWorldCenter().x) / 10;

				if (score > (recordRep.value ?? -90)) {
					recordRep.value = score;
				}

				setCard(score);

				setMotorSpeed(box2d, rightHip, 0);
				enableMotor(box2d, rightHip, false);
				setMotorSpeed(box2d, leftHip, 0);
				enableMotor(box2d, leftHip, false);
				enableLimit(box2d, rightKnee, false);
				enableMotor(box2d, rightKnee, false);
				enableLimit(box2d, leftKnee, false);
				enableMotor(box2d, leftKnee, false);
				enableLimit(box2d, rightShoulder, false);
				enableMotor(box2d, rightShoulder, false);
				enableLimit(box2d, leftShoulder, false);
				enableMotor(box2d, leftShoulder, false);

				setTimeout(() => {
					state.Fallen = false;
					setCard(null);
					resetHurdles();
					reset();
				}, 4000);
			};
		}
	});

	const [box2d, world, recordLeak] = useBox2D();
	const qwopGuy = useQWOPGuy(app);
	const qwopPhysics = usePhysicsBody(box2d, world, recordLeak);
	const [worldSprites, floor] = useWorld(app, box2d, world, recordLeak);
	const [hurdleSprites, hurdlePhysics, addHurdle, resetHurdles] = useHurdles(
		containerRef,
		currentPos,
		box2d,
		world,
		recordLeak,
	);

	useEffect(() => {
		if (!app.current || !qwopGuy.current || !worldSprites.current) return;

		const stage = app.current.stage;

		const worldContainer = new PIXIContainer();
		worldContainer.position.set(350, 200);
		worldContainer.addChild(qwopGuy.current.container);

		stage.addChild(worldContainer);

		containerRef.current = worldContainer;

		return () => {
			stage.removeChild(worldContainer);
			worldContainer.destroy(true);
		};
	}, [app, qwopGuy]);

	useListenForFn('donation', addHurdle);

	useEffect(() => {
		const listener = (ev: KeyboardEvent) => {
			if (ev.key.toLocaleLowerCase() === 'q') keysRep.value!.QDown = ev.type === 'keydown';
			if (ev.key.toLocaleLowerCase() === 'w') keysRep.value!.WDown = ev.type === 'keydown';
			if (ev.key.toLocaleLowerCase() === 'o') keysRep.value!.ODown = ev.type === 'keydown';
			if (ev.key.toLocaleLowerCase() === 'p') keysRep.value!.PDown = ev.type === 'keydown';
		};

		window.addEventListener('keyup', listener);
		window.addEventListener('keydown', listener);

		return () => {
			window.removeEventListener('keyup', listener);
			window.removeEventListener('keydown', listener);
		};
	}, []);

	return (
		<Container>
			<Canvas width={1092} height={332} ref={canvasRef} />

			<HighScoreText ref={hsRef}>Best: {recordRep.value ?? -90}m</HighScoreText>

			<Keys ref={keysRef}>
				<Key>Q</Key>
				<Key>W</Key>
				<Score>0.0 metres</Score>
				<Key>O</Key>
				<Key>P</Key>
			</Keys>

			<TotalText>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalText>

			{card && (
				<ScoreCard>
					<h1>PARTICIPANT</h1>
					<p>showing real courage, you ran:</p>
					<h2>{card} metres</h2>
					<p>(I believe in you Twitch Chat.)</p>
					<h3>record: {recordRep.value}m</h3>
				</ScoreCard>
			)}
		</Container>
	);
}

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	overflow: hidden;
	background: #42cfce;
`;

const Canvas = styled.canvas`
	position: absolute;
	width: 100% !important;
	height: 100% !important;
`;

const TotalText = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	text-shadow: -1px 4px black;

	position: absolute;

	bottom: 45%;
	right: 20px;
`;

const Keys = styled.div`
	display: flex;
	position: absolute;
	top: 14px;
	left: 14px;
	right: 14px;
	gap: 6px;
`;

const Key = styled.div`
	width: 64px;
	height: 64px;
	background: linear-gradient(135deg, white 10%, #b7aea1 40%, black);
	border-radius: 4px;

	position: relative;

	&::before {
		content: '';
		width: 54px;
		height: 54px;
		position: absolute;
		top: 5px;
		left: 5px;
		border-radius: 4px;

		background: radial-gradient(ellipse at bottom, #b8afa4 20%, #635b51);
		z-index: -1;
	}

	//transition: filter 0.1s, transform 0.1s;
	color: black;
	text-align: center;
	line-height: 66px;
	font-family: 'Arial';
	font-size: 36px;

	&.unpressed {
		filter: brightness(0.65);
		transform: scale(1) translateY(0);
	}

	filter: brightness(1);
	transform: scale(0.9) translateY(0px);
`;

const Score = styled.div`
	flex-grow: 1;
	text-align: center;
	font-family: 'Open Sans', sans-serif;
	font-weight: 800;
	font-size: 36px;
`;

const HighScoreText = styled.div`
	position: absolute;
	font-family: 'Open Sans', sans-serif;
	font-weight: 800;
	font-size: 28px;

	top: 200px;
	left: 413px;
`;

const ScoreCard = styled.div`
	position: absolute;
	border: 3px solid #9dbcd0;
	background: #ededed;
	color: #1e2c39;
	text-align: center;

	&:before,
	&:after {
		position: absolute;
		content: '';
		width: 32px;
		height: 46px;
		background: url(${ribbon});
		top: 5px;
		left: 5px;
	}

	&:after {
		left: auto;
		right: 5px;
	}

	font-family: 'Cabin', sans-serif;

	width: 400px;
	padding: 8px;

	box-shadow: 0 0 60px rgba(0, 0, 0, 1);

	display: flex;
	flex-direction: column;
	gap: 10px;
	align-items: center;
	justify-content: center;

	margin: 0 auto;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);

	h1,
	h2,
	h3,
	p {
		margin: 0;
	}

	h1 {
		font-size: 42px;
	}

	p,
	h2 {
		font-size: 22px;
	}

	h2 {
		font-size: 20px;
		background: #1d2b38;
		color: white;
		width: 180px;
		padding: 8px 40px;
		font-family: 'Open Sans', sans-serif;
	}
`;
