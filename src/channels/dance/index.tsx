import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import * as PIXI from 'pixi.js';
import TweenNumber from '@gdq/lib/components/TweenNumber';

import { useCallback, useEffect, useRef } from 'react';

import spritesImage from './sprites.png';
import backgroundImages from './backgrounds.png';

const CONSTS = {
	LEFT_PAD: 150,
	TOP_PAD: 20,
	COLUMN_WIDTH: 64,
	COLUMN_PAD: 3,
	DOUBLE_RARITY: 4,
	TARGET_BPM: 100,
	QUARTER_SPACING: 70, // pixel distance between quarter notes
	HIT_FADE_MILLIS: 1000, // how long hit/combo messages appear
	DONO_HIT_MESSAGES: [
		['GREAT!', 0x38ff2e],
		['GREAT!', 0x38ff2e],
		['GREAT!', 0x38ff2e],
		['GREAT!', 0x38ff2e],
		['PERFECT!', 0xedd21f],
		['PERFECT!', 0xedd21f],
		['MARVELOUS!', 0xf6ffa6],
	],
	DONO_HIT_SIZE: 42,
	DEFAULT_HIT_MESSAGE: 'GOOD!',
	DEFAULT_HIT_COLOR: 0x46b4e3,
	DEFAULT_HIT_SIZE: 28,
	HIT_X: 450,
	HIT_Y: 100,
	COMBO_THRESHOLD: 4,
	COMBO_MESSAGE: ' COMBO',
	COMBO_COLOR: 0xffa826,
	COMBO_SIZE: 32,
	COMBO_MIN_ALPHA: 0.9,
	COMBO_X: 450,
	COMBO_Y: 155,
	MAX_COMBO_MESSAGE: 'MAX COMBO: ',
	MAX_COMBO_COLOR: 0xffffff,
	MAX_COMBO_SIZE: 24,
	MAX_COMBO_X: 450,
	MAX_COMBO_Y: 290,
};

const BEATS_PER_MILLIS = CONSTS.TARGET_BPM / (60 * 1000);

const BACKGROUNDS = ['b4u', 'butterfly', 'cantStop', 'kickTheCan', 'max300'];

const BACKGROUNDS_ATLAS = {
	frames: {
		b4u: {
			frame: { x: 0, y: 0, w: 546, h: 166 },
			sourceSize: { w: 546, h: 166 },
		},
		butterfly: {
			frame: { x: 0, y: 166, w: 546, h: 166 },
			sourceSize: { w: 546, h: 166 },
		},
		cantStop: {
			frame: { x: 0, y: 332, w: 546, h: 166 },
			sourceSize: { w: 546, h: 166 },
		},
		kickTheCan: {
			frame: { x: 0, y: 498, w: 546, h: 166 },
			sourceSize: { w: 546, h: 166 },
		},
		max300: {
			frame: { x: 0, y: 664, w: 546, h: 166 },
			sourceSize: { w: 546, h: 166 },
		},
	},
	meta: {
		scale: '.5',
	},
};

const SPRITES = {
	animations: {
		LeftReceptor: [
			'LeftReceptor',
			'LeftReceptorFlash1',
			'LeftReceptorFlash1',
			'LeftReceptorFlash2',
			'LeftReceptor',
		],
		UpReceptor: ['UpReceptor', 'UpReceptorFlash1', 'UpReceptorFlash1', 'UpReceptorFlash2', 'UpReceptor'],
		DownReceptor: [
			'DownReceptor',
			'DownReceptorFlash1',
			'DownReceptorFlash1',
			'DownReceptorFlash2',
			'DownReceptor',
		],
		RightReceptor: [
			'RightReceptor',
			'RightReceptorFlash1',
			'RightReceptorFlash1',
			'RightReceptorFlash2',
			'RightReceptor',
		],
		LeftReceptorPulse: [
			'Transparent',
			'LeftReceptorPulse',
			'LeftReceptorPulse',
			'LeftReceptorPulse',
			'Transparent',
		],
		DownReceptorPulse: [
			'Transparent',
			'DownReceptorPulse',
			'DownReceptorPulse',
			'DownReceptorPulse',
			'Transparent',
		],
		UpReceptorPulse: ['Transparent', 'UpReceptorPulse', 'UpReceptorPulse', 'UpReceptorPulse', 'Transparent'],
		RightReceptorPulse: [
			'Transparent',
			'RightReceptorPulse',
			'RightReceptorPulse',
			'RightReceptorPulse',
			'Transparent',
		],
	},
	frames: {
		LeftReceptor: {
			frame: { x: 0, y: 0, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		DownReceptor: {
			frame: { x: 64, y: 0, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		UpReceptor: {
			frame: { x: 128, y: 0, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		RightReceptor: {
			frame: { x: 192, y: 0, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		LeftReceptorFlash1: {
			frame: { x: 0, y: 64, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		DownReceptorFlash1: {
			frame: { x: 64, y: 64, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		UpReceptorFlash1: {
			frame: { x: 128, y: 64, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		RightReceptorFlash1: {
			frame: { x: 192, y: 64, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		LeftReceptorFlash2: {
			frame: { x: 0, y: 128, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		DownReceptorFlash2: {
			frame: { x: 64, y: 128, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		UpReceptorFlash2: {
			frame: { x: 128, y: 128, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		RightReceptorFlash2: {
			frame: { x: 192, y: 128, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		LeftReceptorPulse: {
			frame: { x: 0, y: 384, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		DownReceptorPulse: {
			frame: { x: 64, y: 384, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		UpReceptorPulse: {
			frame: { x: 128, y: 384, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		RightReceptorPulse: {
			frame: { x: 192, y: 384, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		LeftQuarter: {
			frame: { x: 0, y: 192, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		DownQuarter: {
			frame: { x: 64, y: 192, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		UpQuarter: {
			frame: { x: 128, y: 192, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		RightQuarter: {
			frame: { x: 192, y: 192, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		LeftEighth: {
			frame: { x: 0, y: 256, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		DownEighth: {
			frame: { x: 64, y: 256, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		UpEighth: {
			frame: { x: 128, y: 256, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		RightEighth: {
			frame: { x: 192, y: 256, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		LeftSixteenth: {
			frame: { x: 0, y: 320, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		DownSixteenth: {
			frame: { x: 64, y: 320, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		UpSixteenth: {
			frame: { x: 128, y: 320, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		RightSixteenth: {
			frame: { x: 192, y: 320, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
		Transparent: {
			frame: { x: 0, y: 448, w: 64, h: 64 },
			sourceSize: { w: 64, h: 64 },
		},
	},
	meta: {
		scale: '1',
	},
};

enum Direction {
	Left,
	Down,
	Up,
	Right,
}

enum Beat {
	Quarter,
	FirstSixteenth,
	Eighth,
	SecondSixteenth,
}

interface Arrow {
	direction: Direction;
	sprite: PIXI.Sprite;
}

interface Note {
	y: number;
	beat: Beat;
	hasDonation: Boolean;
	arrows: Arrow[];
}

interface Receptor {
	direction: Direction;
	noteReceived: Boolean;
	sprite: PIXI.AnimatedSprite;
	pulseSprite: PIXI.AnimatedSprite;
}

interface World {
	pendingDonations: number;
	noteHitRemaining: number;
	comboCount: number;
	maxCombo: number;
	nextBeat: number;
	emittedNoteLastBeat: Boolean;
	receptors: Receptor[];
	notes: Note[];
}

function initWorld(): World {
	return {
		pendingDonations: 0,
		noteHitRemaining: 0,
		comboCount: 0,
		maxCombo: 0,
		nextBeat: 0,
		emittedNoteLastBeat: true,
		receptors: [],
		notes: [],
	};
}

function directionOffset(direction: Direction) {
	return direction * (CONSTS.COLUMN_WIDTH + CONSTS.COLUMN_PAD);
}

function timeToScroll(delta: number) {
	return delta * BEATS_PER_MILLIS * CONSTS.QUARTER_SPACING;
}

function getRandomInt(max: number) {
	return Math.floor(Math.random() * max);
}

registerChannel('Dance', 42, Dance, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'vzaharee',
});

function Dance(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);

	const containerRef = useRef<HTMLDivElement>(null);
	const spritesheet = useRef<PIXI.Spritesheet | null>(null);
	const backgroundSheet = useRef<PIXI.Spritesheet | null>(null);
	const background = useRef<PIXI.Sprite | null>(null);

	const fieldContainer = useRef<PIXI.Container | null>(null);
	const noteContainer = useRef<PIXI.Container | null>(null);
	const noteHit = useRef<PIXI.Text | null>(null);
	const combo = useRef<PIXI.Text | null>(null);
	const maxCombo = useRef<PIXI.Text | null>(null);

	const worldRef = useRef<World>(initWorld());

	const addNote = useCallback((beat: Beat) => {
		if (!app.current || !worldRef.current || !spritesheet.current || !noteContainer.current) return;

		const world = worldRef.current;

		const arrows = [];

		let arrowCount = 1;
		if (getRandomInt(CONSTS.DOUBLE_RARITY) == 0) arrowCount += 1;

		const dirs = [Direction.Left, Direction.Up, Direction.Down, Direction.Right];

		for (let i = 0; i < arrowCount; i++) {
			const dir = dirs.splice(getRandomInt(dirs.length), 1)[0];
			let texture = Direction[dir];
			switch (beat) {
				case Beat.Quarter:
					texture += 'Quarter';
					break;
				case Beat.Eighth:
					texture += 'Eighth';
					break;
				case Beat.FirstSixteenth:
				case Beat.SecondSixteenth:
					texture += 'Sixteenth';
					break;
			}
			arrows.push({
				direction: dir,
				sprite: new PIXI.Sprite(spritesheet.current.textures[texture]),
			});
		}

		const note = {
			y:
				timeToScroll(world.nextBeat) +
				beat * 0.25 * CONSTS.QUARTER_SPACING +
				(Math.floor(332 / CONSTS.QUARTER_SPACING) + 2) * CONSTS.QUARTER_SPACING,
			beat: beat,
			hasDonation: false,
			arrows: arrows,
		};

		world.notes.push(note);
		note.arrows.forEach((arrow) => {
			noteContainer.current?.addChildAt(arrow.sprite, 0);
		});
	}, []);

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		if (
			!app.current ||
			!worldRef.current ||
			!spritesheet.current ||
			!noteContainer.current ||
			!noteHit.current ||
			!combo.current ||
			!maxCombo.current
		)
			return;

		const world = worldRef.current;

		const delta = app.current.ticker.deltaMS;
		const scroll = timeToScroll(delta);

		let doBeat = false;
		let doDonation = false;
		let doNoteHit = false;

		// update nextBeat and add notes if needed
		world.nextBeat = world.nextBeat - delta;
		if (world.nextBeat < 0) {
			doBeat = true;

			if (world.pendingDonations == 0) {
				// emit notes every other beat by default
				if (world.emittedNoteLastBeat) {
					world.emittedNoteLastBeat = false;
				} else {
					addNote(Beat.Quarter);
					world.emittedNoteLastBeat = true;
				}
			} else if (world.pendingDonations <= 2) {
				// we don't have enough notes for all the donos
				addNote(Beat.Quarter);
				world.emittedNoteLastBeat = true;
			} else if (world.pendingDonations <= 4) {
				// we still don't have enough notes for all the donos
				addNote(Beat.Quarter);
				addNote(Beat.Eighth);
				world.emittedNoteLastBeat = true;
			} else {
				// we _really_ don't have enough notes for all the donos
				addNote(Beat.Quarter);
				addNote(Beat.FirstSixteenth);
				addNote(Beat.Eighth);
				addNote(Beat.SecondSixteenth);
				world.emittedNoteLastBeat = true;
			}
		}

		// scroll notes, check for hits/hits with donos
		for (const [index, note] of world.notes.entries()) {
			note.y = note.y - scroll;

			if (!note.hasDonation && world.pendingDonations > 0) {
				note.hasDonation = true;
				world.pendingDonations -= 1;
			}

			if (note.y < 8 && ((note.beat == Beat.Quarter && doBeat) || note.beat != Beat.Quarter)) {
				doNoteHit = true;
				if (note.hasDonation) doDonation = true;

				for (const arrow of note.arrows) {
					noteContainer.current.removeChild(arrow.sprite);
					world.receptors[arrow.direction].noteReceived = true;
				}
				world.notes.splice(index, 1);
			}
		}

		if (doBeat) {
			world.nextBeat = world.nextBeat + 1 / BEATS_PER_MILLIS;
		}

		// handle rendering of hit messages/dono combos
		if (doDonation) {
			const [msg, color] = CONSTS.DONO_HIT_MESSAGES[getRandomInt(CONSTS.DONO_HIT_MESSAGES.length)];
			noteHit.current.text = msg;
			noteHit.current.style.fill = color;
			noteHit.current.style.fontSize = CONSTS.DONO_HIT_SIZE;
			world.noteHitRemaining = CONSTS.HIT_FADE_MILLIS;
			world.comboCount += 1;
			if (world.comboCount >= CONSTS.COMBO_THRESHOLD) {
				combo.current.text = world.comboCount + CONSTS.COMBO_MESSAGE;
				combo.current.alpha = 1;
			}
			if (world.comboCount > world.maxCombo) world.maxCombo = world.comboCount;
		} else if (doNoteHit) {
			noteHit.current.text = CONSTS.DEFAULT_HIT_MESSAGE;
			noteHit.current.style.fill = CONSTS.DEFAULT_HIT_COLOR;
			noteHit.current.style.fontSize = CONSTS.DEFAULT_HIT_SIZE;
			world.noteHitRemaining = CONSTS.HIT_FADE_MILLIS;
			world.comboCount = 0;
			combo.current.alpha = 0;
		} else {
			world.noteHitRemaining = Math.max(world.noteHitRemaining - delta, 0);
			if (world.comboCount >= CONSTS.COMBO_THRESHOLD) {
				combo.current.alpha = Math.max(world.noteHitRemaining / CONSTS.HIT_FADE_MILLIS, CONSTS.COMBO_MIN_ALPHA);
			}
		}
		noteHit.current.alpha = world.noteHitRemaining / CONSTS.HIT_FADE_MILLIS;
		maxCombo.current.text = CONSTS.MAX_COMBO_MESSAGE + world.maxCombo;

		// update note sprites
		world.notes.forEach((note) => {
			note.arrows.forEach((arrow) => {
				arrow.sprite.position.set(directionOffset(arrow.direction), note.y);
			});
		});

		// play receptor animation for hits
		world.receptors.forEach((receptor) => {
			if (receptor.noteReceived) {
				receptor.noteReceived = false;
				receptor.sprite.gotoAndPlay(0);
			}
			if (doBeat) {
				receptor.pulseSprite.gotoAndPlay(0);
			}
		});
	});

	useEffect(() => {
		if (!app.current) return;

		const world = worldRef.current;

		backgroundSheet.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(backgroundImages), BACKGROUNDS_ATLAS);
		backgroundSheet.current.parse();

		const bgTexture = BACKGROUNDS[getRandomInt(BACKGROUNDS.length)];

		background.current = new PIXI.Sprite(backgroundSheet.current.textures[bgTexture]);
		background.current.tint = 0x999999;
		app.current.stage.addChild(background.current);

		spritesheet.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(spritesImage), SPRITES);
		spritesheet.current.parse();

		fieldContainer.current = new PIXI.Container();
		fieldContainer.current.position.set(CONSTS.LEFT_PAD, CONSTS.TOP_PAD);

		for (const dir of [Direction.Left, Direction.Down, Direction.Up, Direction.Right]) {
			const receptorSprite = new PIXI.AnimatedSprite(spritesheet.current.animations[Direction[dir] + 'Receptor']);
			receptorSprite.position.set(directionOffset(dir), 0);
			receptorSprite.loop = false;
			receptorSprite.animationSpeed = 0.4;

			const pulseSprite = new PIXI.AnimatedSprite(
				spritesheet.current.animations[Direction[dir] + 'ReceptorPulse'],
			);
			pulseSprite.position.set(directionOffset(dir), 0);
			pulseSprite.loop = false;
			pulseSprite.alpha = 0.5;
			pulseSprite.animationSpeed = 0.4;

			const receptor = { direction: dir, noteReceived: false, sprite: receptorSprite, pulseSprite: pulseSprite };
			world.receptors.push(receptor);
			fieldContainer.current.addChild(receptorSprite);
			fieldContainer.current.addChild(pulseSprite);
		}

		noteContainer.current = new PIXI.Container();
		fieldContainer.current.addChild(noteContainer.current);

		addNote(Beat.Quarter);
		world.nextBeat = 1 / BEATS_PER_MILLIS;

		noteHit.current = new PIXI.Text('', {
			fontFamily: 'gdqpixel',
		});
		noteHit.current.alpha = 0;
		noteHit.current.position.set(CONSTS.HIT_X, CONSTS.HIT_Y);

		combo.current = new PIXI.Text('', {
			fontFamily: 'gdqpixel',
			fontSize: CONSTS.COMBO_SIZE,
			fill: CONSTS.COMBO_COLOR,
		});
		combo.current.alpha = 0;
		combo.current.position.set(CONSTS.COMBO_X, CONSTS.COMBO_Y);

		maxCombo.current = new PIXI.Text(CONSTS.MAX_COMBO_MESSAGE + world.maxCombo, {
			fontFamily: 'gdqpixel',
			fontSize: CONSTS.MAX_COMBO_SIZE,
			fill: CONSTS.MAX_COMBO_COLOR,
		});
		maxCombo.current.position.set(CONSTS.MAX_COMBO_X, CONSTS.MAX_COMBO_Y);

		app.current.stage.addChild(noteHit.current);
		app.current.stage.addChild(combo.current);
		app.current.stage.addChild(maxCombo.current);
		app.current.stage.addChild(fieldContainer.current);

		return () => {
			const world = worldRef.current;

			if (!maxCombo.current?.destroyed) maxCombo.current?.destroy();
			maxCombo.current = null;

			if (!combo.current?.destroyed) combo.current?.destroy();
			combo.current = null;

			if (!noteHit.current?.destroyed) noteHit.current?.destroy();
			noteHit.current = null;

			world.notes.forEach((note) => {
				note.arrows.forEach((arrow) => {
					if (!arrow.sprite.destroyed) arrow.sprite.destroy();
				});
			});
			world.receptors.forEach((receptor) => {
				if (!receptor.sprite.destroyed) receptor.sprite.destroy();
			});
			worldRef.current = initWorld();

			if (!noteContainer.current?.destroyed) noteContainer.current?.destroy();
			noteContainer.current = null;

			if (!fieldContainer.current?.destroyed) fieldContainer.current?.destroy();
			fieldContainer.current = null;

			if (!background.current?.destroyed) background.current?.destroy();
			background.current = null;

			if (backgroundSheet.current) backgroundSheet.current?.destroy();
			backgroundSheet.current = null;

			if (spritesheet.current) spritesheet.current?.destroy();
			spritesheet.current = null;
		};
	}, [app]);

	useListenFor('donation', (donation: FormattedDonation) => {
		worldRef.current.pendingDonations += 1;
	});

	return (
		<Container ref={containerRef}>
			<Canvas width={1092} height={332} ref={canvasRef} />
			<TotalText>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalText>
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
`;

const TotalText = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	position: absolute;

	right: 20px;
	top: 30px;
`;
