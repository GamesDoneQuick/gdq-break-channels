import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import * as PIXI from 'pixi.js';
import TweenNumber from '@gdq/lib/components/TweenNumber';

import { useCallback, useEffect, useRef } from 'react';

import spritesImage from './sprites.png';

import b4u from './b4u.png';
import butterfly from './butterfly.png';
import csfilsm from './cant-stop-falling-in-love-speed-mix.png';
import kickTheCan from './kick-the-can.png';
import max300 from './max-300.png';

const BACKGROUNDS = [b4u, butterfly, csfilsm, kickTheCan, max300];

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
};

const BEATS_PER_MILLIS = CONSTS.TARGET_BPM / (60 * 1000);

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
	hasDonation: Boolean;
	arrows: Arrow[];
}

interface Receptor {
	direction: Direction;
	noteReceived: Boolean;
	sprite: PIXI.AnimatedSprite;
}

function directionOffset(direction: Direction) {
	return direction * (CONSTS.COLUMN_WIDTH + CONSTS.COLUMN_PAD);
}

function timeToScroll(delta: number) {
	if (delta == 0) return 0;
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
	const background = useRef('');
	const spritesheet = useRef<PIXI.Spritesheet | null>(null);

	const fieldContainer = useRef<PIXI.Container | null>(null);
	const noteContainer = useRef<PIXI.Container | null>(null);
	const noteHit = useRef<PIXI.Text | null>(null);
	const combo = useRef<PIXI.Text | null>(null);

	const pendingDonations = useRef(0);
	const noteHitRemaining = useRef(0);
	const comboCount = useRef(0);
	const nextBeat = useRef(0);
	const receptors = useRef<Receptor[]>([]);
	const notes = useRef<Note[]>([]);

	const addNote = useCallback((beat: Beat) => {
		if (!app.current || !notes.current || !spritesheet.current || !noteContainer.current) return;

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
				timeToScroll(nextBeat.current) +
				beat * 0.25 * CONSTS.QUARTER_SPACING +
				(332 / CONSTS.QUARTER_SPACING + 2) * CONSTS.QUARTER_SPACING,
			hasDonation: false,
			arrows: arrows,
		};

		notes.current.push(note);
		note.arrows.forEach((arrow) => {
			noteContainer.current?.addChildAt(arrow.sprite, 0);
		});
	}, []);

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		if (
			!app.current ||
			!notes.current ||
			!spritesheet.current ||
			!noteContainer.current ||
			!noteHit.current ||
			!combo.current
		)
			return;

		const delta = app.current.ticker.deltaMS;
		const scroll = timeToScroll(delta);

		let doNoteHit = false;
		let doDonation = false;

		// scroll notes, check for hits/hits with donos
		for (const [index, note] of notes.current.entries()) {
			note.y = note.y - scroll;

			if (!note.hasDonation && pendingDonations.current > 0) {
				note.hasDonation = true;
				pendingDonations.current -= 1;
			}

			if (note.y < 5) {
				doNoteHit = true;
				if (note.hasDonation) doDonation = true;

				for (const arrow of note.arrows) {
					noteContainer.current.removeChild(arrow.sprite);
					receptors.current[arrow.direction].noteReceived = true;
				}
				notes.current.splice(index, 1);
			}
		}

		// update nextBeat and add notes if needed
		nextBeat.current = nextBeat.current - delta;
		if (nextBeat.current < 0) {
			if (pendingDonations.current == 0) {
				addNote(Beat.Quarter);
			} else if (pendingDonations.current <= 4) {
				// we don't have enough notes for all the donos
				addNote(Beat.Quarter);
				addNote(Beat.Eighth);
			} else {
				// we _really_ don't have enough notes for all the donos
				addNote(Beat.Quarter);
				addNote(Beat.FirstSixteenth);
				addNote(Beat.Eighth);
				addNote(Beat.SecondSixteenth);
			}
			nextBeat.current = nextBeat.current + 1 / BEATS_PER_MILLIS;
		}

		// handle rendering of hit messages/dono combos
		if (doDonation) {
			const [msg, color] = CONSTS.DONO_HIT_MESSAGES[getRandomInt(CONSTS.DONO_HIT_MESSAGES.length)];
			noteHit.current.text = msg;
			noteHit.current.style.fill = color;
			noteHit.current.style.fontSize = CONSTS.DONO_HIT_SIZE;
			noteHitRemaining.current = CONSTS.HIT_FADE_MILLIS;
			comboCount.current += 1;
			if (comboCount.current >= CONSTS.COMBO_THRESHOLD) {
				combo.current.text = comboCount.current + CONSTS.COMBO_MESSAGE;
				combo.current.alpha = 1;
			}
		} else if (doNoteHit) {
			noteHit.current.text = CONSTS.DEFAULT_HIT_MESSAGE;
			noteHit.current.style.fill = CONSTS.DEFAULT_HIT_COLOR;
			noteHit.current.style.fontSize = CONSTS.DEFAULT_HIT_SIZE;
			noteHitRemaining.current = CONSTS.HIT_FADE_MILLIS;
			comboCount.current = 0;
			combo.current.alpha = 0;
		} else {
			noteHitRemaining.current = Math.max(noteHitRemaining.current - delta, 0);
			if (comboCount.current >= CONSTS.COMBO_THRESHOLD) {
				combo.current.alpha = Math.max(
					noteHitRemaining.current / CONSTS.HIT_FADE_MILLIS,
					CONSTS.COMBO_MIN_ALPHA,
				);
			}
		}
		noteHit.current.alpha = noteHitRemaining.current / CONSTS.HIT_FADE_MILLIS;

		// update note sprites
		notes.current.forEach((note) => {
			note.arrows.forEach((arrow) => {
				arrow.sprite.position.set(directionOffset(arrow.direction), note.y);
			});
		});

		// play receptor animation for hits
		receptors.current.forEach((receptor) => {
			if (receptor.noteReceived) {
				receptor.noteReceived = false;
				receptor.sprite.gotoAndPlay(0);
			}
		});
	});

	useEffect(() => {
		if (!app.current) return;

		background.current = BACKGROUNDS[getRandomInt(BACKGROUNDS.length)];

		spritesheet.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(spritesImage), SPRITES);
		spritesheet.current.parse();

		fieldContainer.current = new PIXI.Container();
		fieldContainer.current.position.set(CONSTS.LEFT_PAD, CONSTS.TOP_PAD);

		for (const dir of [Direction.Left, Direction.Down, Direction.Up, Direction.Right]) {
			const receptorSprite = new PIXI.AnimatedSprite(spritesheet.current.animations[Direction[dir] + 'Receptor']);
			receptorSprite.position.set(directionOffset(dir), 0);
			receptorSprite.loop = false;
			receptorSprite.animationSpeed = 0.4;
			const receptor = { direction: dir, noteReceived: false, sprite: receptorSprite };
			receptors.current.push(receptor);
			fieldContainer.current.addChild(receptorSprite);
		}

		noteContainer.current = new PIXI.Container();
		fieldContainer.current.addChild(noteContainer.current);

		addNote(Beat.Quarter);
		nextBeat.current = 1 / BEATS_PER_MILLIS;

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

		app.current.stage.addChild(noteHit.current);
		app.current.stage.addChild(combo.current);
		app.current.stage.addChild(fieldContainer.current);

		return () => {
			if (!combo.current?.destroyed) combo.current?.destroy();
			combo.current = null;

			if (!noteHit.current?.destroyed) noteHit.current?.destroy();
			noteHit.current = null;

			notes.current?.forEach((note) => {
				note.arrows.forEach((arrow) => {
					if (!arrow.sprite.destroyed) arrow.sprite.destroy();
				});
			});
			notes.current = [];
			if (!noteContainer.current?.destroyed) noteContainer.current?.destroy();
			noteContainer.current = null;

			receptors.current?.forEach((receptor) => {
				if (!receptor.sprite.destroyed) receptor.sprite.destroy();
			});
			receptors.current = [];

			if (!fieldContainer.current?.destroyed) fieldContainer.current?.destroy();
			fieldContainer.current = null;

			if (spritesheet.current) spritesheet.current?.destroy();
			spritesheet.current = null;

			nextBeat.current = 0;
			comboCount.current = 0;
			noteHitRemaining.current = 0;
			pendingDonations.current = 0;
		};
	}, [app]);

	useListenFor('donation', (donation: FormattedDonation) => {
		pendingDonations.current += 1;
	});

	return (
		<Container ref={containerRef}>
			<Background src={background.current} />
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

const Background = styled.img`
	position: absolute;
	width: 1092px;
	height: 1092px;
	object-fit: cover;
	filter: brightness(0.5);
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
`;
