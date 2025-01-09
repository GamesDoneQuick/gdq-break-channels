import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';

import sheetTexture from './assets/atlas.png';
import { atlas } from './assets/atlas';
import ewjbackground from './ewjbackground.png';
import { useCallback, useEffect, useRef } from 'react';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import * as PIXI from 'pixi.js';

registerChannel('Earthworm Jim', 94, EarthwormJim, {
	position: 'bottomLeft',
	site: 'Twitch',
	handle: 'CMOrdonis',
});

export type EnemyQueueEntry  = {
	donoAmt: number;
	enemy: string;
	status: EnemyStatus;
	enemySprite?: PIXI.AnimatedSprite;
};

export enum EnemyStatus {
	WAITING,
	STARTED,
	HIT,
}

export function EarthwormJim(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const donationCountdown = useRef<number>(0);
	const spritesheet = useRef<PIXI.Spritesheet | null>(null);
	const enemyQueue = useRef<EnemyQueueEntry[]>([]);
	const liveDonations = useRef<EnemyQueueEntry[]>([]);

	const objects = useRef<Record<string, PIXI.DisplayObject> | null>(null);

	let yCount = 0;
	let drawCount = 0;

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		if (!objects.current || !spritesheet.current) return;
		drawCount++;
		const jim = objects.current!.jimAnim as PIXI.AnimatedSprite;
		const muzzle = objects.current!.muzzleAnim as PIXI.AnimatedSprite;
		
		donationCountdown.current--;
		if (donationCountdown.current <= 0 && enemyQueue.current.length > 0) {
			liveDonations.current.push(enemyQueue.current.shift()!);
			donationCountdown.current = 125;
		}
		const container = objects.current.container as PIXI.Container;

		for(const enemy of liveDonations.current) {	
			if (enemy.status === EnemyStatus.WAITING) {	
				enemy.status = EnemyStatus.STARTED;
				let enemyObject = enemy;

				if (enemyObject!.enemy == 'crow') {
					enemy.enemySprite = new PIXI.AnimatedSprite(spritesheet.current.animations["crow"]);
					enemy.enemySprite.x = 1500;
					enemy.enemySprite.y = 105;
					enemy.enemySprite.scale.x = -1;
					enemy.enemySprite.animationSpeed = 1/5;
					enemy.enemySprite.play();
					container.addChild(enemy.enemySprite);
					yCount = 0;
					
				} else {
					enemy.enemySprite = new PIXI.AnimatedSprite(spritesheet.current.animations["fifimove"]);
					enemy.enemySprite.x = 1500;
					enemy.enemySprite.y = 175;
					enemy.enemySprite.scale.x = -1;
					enemy.enemySprite.animationSpeed = 1/5;
					enemy.enemySprite.play();
					container.addChild(enemy.enemySprite);
				}
			} else if (enemy.status === EnemyStatus.STARTED) {

				const speed = 10;
				
				enemy.enemySprite!.x = (enemy.enemySprite!.x - (speed));
				if(enemy.enemy =='fifi') {
					if(drawCount % 5 == 0) {
						enemy.enemySprite!.y = enemy.enemySprite!.y + 1;
					}
				}

				if (enemy.enemySprite!.x < 615) {
					
					jim.textures = spritesheet.current!.animations.jimshoot;
					jim.play();
					muzzle.textures = spritesheet.current!.animations.muzzle;
					muzzle.x = 265;
					muzzle.y = 115;
					muzzle.animationSpeed = 1/4;
					muzzle.play();
					container.addChild(muzzle);
					setTimeout(() => {
						jim.textures = spritesheet.current!.animations.tile;
						jim.animationSpeed = 1/4;
						jim.play();
						container.removeChild(muzzle);
					}, 500);
				}
				if (enemy.enemySprite!.x < 575) {
					enemy.status = EnemyStatus.HIT;
					if(enemy.enemy =='crow') {
						enemy.enemySprite!.scale.x *= -1;
						enemy.enemySprite!.textures = spritesheet.current!.animations.hurt;
						setTimeout(() => {
							enemy.enemySprite!.textures = spritesheet.current!.animations.crow;
							enemy.enemySprite!.play();
						}, 200);
					} else {
						enemy.enemySprite!.scale.x *= -1;
						enemy.enemySprite!.textures = spritesheet.current!.animations.fifibark;
						setTimeout(() => {
							enemy.enemySprite!.textures = spritesheet.current!.animations.fifimove;
							enemy.enemySprite!.play();
						}, 200);
					}

				}
			} else {
				const speed = 5;
				enemy.enemySprite!.x = (enemy.enemySprite!.x + (speed*2));
				if(enemy.enemy == 'crow') {
					enemy.enemySprite!.y = (enemy.enemySprite!.y + yCount);
					yCount = yCount + 1;

				} else {
					if(drawCount % 5 == 0) {
						enemy.enemySprite!.y = enemy.enemySprite!.y - 2;
					}
				}
				if (enemy.enemySprite!.x > 2000 || enemy.enemySprite!.y > 1000) {
					enemy.enemySprite!.destroy();
					liveDonations.current.shift();

				}
			}
			
		}
		
	});

	useEffect(() => {
		if (!app.current) return;

		const container = new PIXI.Container();
		app.current.stage.addChild(container);

		spritesheet.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(sheetTexture), atlas);

		spritesheet.current.parse().then(() => {
			if (!spritesheet.current) return;

			objects.current = {
				container,
				background: new PIXI.Graphics(),
				enemies: new PIXI.Container(),
				jimAnim: new PIXI.AnimatedSprite([spritesheet.current.textures.tile001]),
				crowAnim: new PIXI.AnimatedSprite([spritesheet.current.textures.crow000]),
				fifiAnim: new PIXI.AnimatedSprite([spritesheet.current.textures.fifimove000]),
				muzzleAnim: new PIXI.AnimatedSprite([spritesheet.current.textures.muzzle000])

			};
			
		

			const background = PIXI.Sprite.from(ewjbackground);
			background.scale.set(2,2);
			background.x = -650;
			background.y = -100;
			container.addChild(background);

			const jim = objects.current.jimAnim as PIXI.AnimatedSprite;
			jim.textures = spritesheet.current.animations.tile;
			jim.animationSpeed = 1/4;
			jim.x = 142;
			jim.y = 128;
			jim.play();
			container.addChild(jim);
		});

	}, [app]);
	useListenFor('donation', (donation: FormattedDonation) => {
		
		let enemyType;
		if (donation.rawAmount > 100) {
			enemyType = 'fifi';
		} else {
			enemyType = 'crow'; 
		}
		
		enemyQueue.current.push({donoAmt: donation.rawAmount, enemy: enemyType, status: EnemyStatus.WAITING});
	});

	return (
		<Container>
			<Canvas width={1092} height={332} ref={canvasRef} />
			<TotalEl>
				<span>
					$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
				</span>
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

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	position: absolute;
	right: 30px;
	top: 80%;
	transform: translate(0, -50%);
	span {
		background: linear-gradient(#ffffff, #aaaaaa);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		filter: drop-shadow(3px 3px #000000);
	}
	filter: drop-shadow(2px 2px 10px #000000) drop-shadow(2px 2px 30px #000000);
`;

const Jim = styled.img`
	position: absolute;

	transform: scale(1.5) translate(115px, 108px);
`;
