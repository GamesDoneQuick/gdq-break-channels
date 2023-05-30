import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import * as PIXI from 'pixi.js';
import { useEffect, useRef, useState } from 'react';

import bgImage from './bg.png';
import battle_bgImage from './battle_bg.png';
import playerImage from './player.png';
import textBoxImage from './text_box.png';
import slimesImage from './slimes.png';

registerChannel('Dragon Warrior', 86, DragonWarrior);

const BATTLE_BG_FRAMES: any = {};
for (let i = 0; i < 49; i++) {
	BATTLE_BG_FRAMES[`tile_${i}`] = {
		frame: { x: (i % 7) * 16, y: Math.floor(i / 7) * 16, w: 16, h: 16 },
		sourceSize: { w: 16, h: 16 },
	};
}

const PLAYER_FRAMES = {
	Walk1: {
		frame: { x: 0, y: 0, w: 16, h: 16 },
		sourceSize: { w: 16, h: 16 },
	},
	Walk2: {
		frame: { x: 16, y: 0, w: 16, h: 16 },
		sourceSize: { w: 16, h: 16 },
	},
};

const SLIME_FRAMES = {
	Blue: {
		frame: { x: 0, y: 0, w: 19, h: 18 },
		sourceSize: { w: 19, h: 18 },
	},
	Red: {
		frame: { x: 19, y: 0, w: 19, h: 18 },
		sourceSize: { w: 19, h: 18 },
	},
	Metal: {
		frame: { x: 38, y: 0, w: 19, h: 18 },
		sourceSize: { w: 19, h: 18 },
	},
};

const SPIRAL_MAP = [
	[3, 3],
	[3, 4],
	[2, 4],
	[2, 3],
	[2, 2],
	[3, 2],
	[4, 2],
	[4, 3],
	[4, 4],
	[4, 5],
	[3, 5],
	[2, 5],
	[1, 5],
	[1, 4],
	[1, 3],
	[1, 2],
	[1, 1],
	[2, 1],
	[3, 1],
	[4, 1],
	[5, 1],
	[5, 2],
	[5, 3],
	[5, 4],
	[5, 5],
	[5, 6],
	[4, 6],
	[3, 6],
	[2, 6],
	[1, 6],
	[0, 6],
	[0, 5],
	[0, 4],
	[0, 3],
	[0, 2],
	[0, 1],
	[0, 0],
	[1, 0],
	[2, 0],
	[3, 0],
	[4, 0],
	[5, 0],
	[6, 0],
	[6, 1],
	[6, 2],
	[6, 3],
	[6, 4],
	[6, 5],
	[6, 6],
];

function DragonWarrior(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);

	const battle_bg = useRef<PIXI.Spritesheet | null>(null);
	const slimes = useRef<PIXI.Spritesheet | null>(null);
	const player = useRef<PIXI.Spritesheet | null>(null);

	const map_left = useRef<PIXI.Sprite | null>(null);
	const map_right = useRef<PIXI.Sprite | null>(null);
	const battle_bg_sprites = useRef<PIXI.Sprite[] | null>(null);
	const blueSlime = useRef<PIXI.Sprite | null>(null);
	const redSlime = useRef<PIXI.Sprite | null>(null);
	const metalSlime = useRef<PIXI.Sprite | null>(null);
	const currentSlime = useRef<PIXI.Sprite | null>(null);
	const textBox = useRef<PIXI.Sprite | null>(null);

	const [message, setMessage] = useState('');
	const donationText = useRef<string>('');

	const frame = useRef<number>(0);
	const gameState = useRef<'overworld' | 'pending' | 'fade_in' | 'encounter' | 'fade_out'>('overworld');

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		if (gameState.current === 'overworld' || gameState.current === 'pending') {
			map_left.current?.position.set((map_left.current?.position.x - 2) % 1568, 0);

			map_right.current?.position.set((map_left.current?.position.x || 0) + 1568, 0);

			if (gameState.current === 'pending' && ((map_left.current?.position.x || 0) + 12) % 32 === 0) {
				gameState.current = 'fade_in';
			}
		} else if (gameState.current === 'fade_in') {
			frame.current += 2;

			if (battle_bg_sprites.current) {
				for (let i = 0; i < 49; i++) {
					let [x, y] = SPIRAL_MAP[i];
					let new_i = y * 7 + x;
					battle_bg_sprites.current[new_i].visible = i < frame.current;
				}
			}

			if (frame.current > 49 && frame.current < 49 + donationText.current.length + 1) {
				// Done animating background spiral, currently animating text
				if (currentSlime.current) {
					currentSlime.current.visible = true;
				}

				if (textBox.current) {
					textBox.current.visible = true;
					setMessage(donationText.current.slice(0, frame.current - 48));
				}
			} else if (frame.current >= 49) {
				// Done animating everything
				gameState.current = 'encounter';

				setTimeout(() => {
					gameState.current = 'fade_out';
				}, 1500);
			}
		} else if (gameState.current === 'fade_out') {
			if (textBox.current) {
				textBox.current.visible = false;
				setMessage('');
			}
			if (currentSlime.current) {
				currentSlime.current.visible = false;
			}

			frame.current -= 7;

			if (battle_bg_sprites.current) {
				for (let i = 0; i < 49; i++) {
					battle_bg_sprites.current[i].visible = i < frame.current;
				}
			}

			if (frame.current <= 0) {
				gameState.current = 'overworld';
			}
		}
	});

	useEffect(() => {
		if (!app || !app.current?.stage) return;

		// Load Sprite Sheets
		battle_bg.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(battle_bgImage), {
			frames: BATTLE_BG_FRAMES,
			meta: {
				scale: '0.5',
			},
		});
		battle_bg.current.parse();

		slimes.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(slimesImage), {
			frames: SLIME_FRAMES,
			meta: {
				scale: '0.5',
			},
		});
		slimes.current.parse();

		player.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(playerImage), {
			frames: PLAYER_FRAMES,
			meta: {
				scale: '0.5',
			},
			animations: {
				walk: ['Walk1', 'Walk2'],
			},
		});
		player.current.parse();

		// Load Sprites
		map_left.current = PIXI.Sprite.from(bgImage);
		map_left.current.x = 0;
		map_left.current.y = 0;
		map_left.current.width = 1568;
		map_left.current.height = 332;

		map_right.current = PIXI.Sprite.from(bgImage);
		map_right.current.x = 0;
		map_right.current.y = 1568;
		map_right.current.width = 1568;
		map_right.current.height = 332;

		blueSlime.current = new PIXI.Sprite(slimes.current.textures['Blue']);
		blueSlime.current.visible = false;
		blueSlime.current.position.set(546 - 19, 150);

		redSlime.current = new PIXI.Sprite(slimes.current.textures['Red']);
		redSlime.current.position.set(546 - 19, 150);
		redSlime.current.visible = false;

		metalSlime.current = new PIXI.Sprite(slimes.current.textures['Metal']);
		metalSlime.current.position.set(546 - 19, 150);
		metalSlime.current.visible = false;

		textBox.current = PIXI.Sprite.from(textBoxImage);
		textBox.current.width = 384;
		textBox.current.height = 112;
		textBox.current.x = 354;
		textBox.current.y = 200;
		textBox.current.visible = false;

		battle_bg_sprites.current = [];
		for (let i = 0; i < 49; i++) {
			let tile = new PIXI.Sprite(battle_bg.current.textures[`tile_${i}`]);
			tile.position.set((i % 7) * 32 + 434, Math.floor(i / 7) * 32 + 55);
			tile.visible = false;
			battle_bg_sprites.current.push(tile);
		}

		// Animate Player
		const anim = new PIXI.AnimatedSprite(player.current.animations.walk);
		anim.animationSpeed = 1 / 16;
		anim.position.set(530, 152);
		anim.play();

		const container = new PIXI.Container();

		// Add nodes
		container.addChild(map_left.current);
		container.addChild(map_right.current);
		container.addChild(anim);

		for (let tile of battle_bg_sprites.current) {
			container.addChild(tile);
		}

		container.addChild(textBox.current);
		container.addChild(blueSlime.current);
		container.addChild(redSlime.current);
		container.addChild(metalSlime.current);

		app.current?.stage.addChild(container);

		return () => {
			if (!map_left.current?.destroyed) map_left.current?.destroy();
			if (!map_right.current?.destroyed) map_right.current?.destroy();
			if (!blueSlime.current?.destroyed) blueSlime.current?.destroy();
			if (!redSlime.current?.destroyed) redSlime.current?.destroy();
			if (!metalSlime.current?.destroyed) metalSlime.current?.destroy();
			if (!currentSlime.current?.destroyed) currentSlime.current?.destroy();
			if (!textBox.current?.destroyed) textBox.current?.destroy();

			for (let sprite of battle_bg_sprites.current || []) {
				if (!sprite.destroyed) sprite.destroy();
			}

			if (!anim.destroyed) anim.destroy();

			if (battle_bg.current) battle_bg.current.destroy();
			if (slimes.current) slimes.current.destroy();
			if (player.current) player.current.destroy();

			if (!container.destroyed) container.destroy(true);
		};
	}, [app]);

	useListenFor('donation', (donation: FormattedDonation) => {
		if (gameState.current === 'overworld') {
			// Get donation without dollar sign because it doesn't exist in the NES font
			let amount = (Math.round(donation.rawAmount * 100) / 100).toString();
			let a = amount.startsWith('8') ? 'An' : 'A';

			frame.current = 0;
			gameState.current = 'pending';
			donationText.current = `${a} ${amount} dollar donation draws near!`;

			currentSlime.current = blueSlime.current;

			if (donation.rawAmount >= 100) {
				currentSlime.current = redSlime.current;
			} else if (donation.rawAmount >= 1000) {
				currentSlime.current = metalSlime.current;
			}
		}
	});

	return (
		<Container>
			<Canvas width={1092} height={332} ref={canvasRef} />
			<TextBox>{message}</TextBox>
			<TotalEl>
				$<TweenNumber value={total?.raw} />
			</TotalEl>
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
`;

const TextBox = styled.div`
	font-family: DragonWarrior;
	font-size: 14px;
	line-height: 16px;
	color: white;

	position: absolute;

	left: 372px;
	top: 204px;
	width: 352px;
	transform: translate(0px, 15px);
`;

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;
	text-shadow: 3px 3px black, -3px -3px black, 3px -3px black, -3px 3px black;

	position: absolute;

	right: 20px;
	top: 20px;
	transform: translate(0px, 15px);
`;