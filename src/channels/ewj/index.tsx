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
};

export enum EnemyStatus {
	WAITING,
	STARTED,
	DONE,
}

export function EarthwormJim(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const containerRef = useRef<HTMLDivElement>(null);
	const jim = useRef<PIXI.AnimatedSprite>(null);
	const muzzle = useRef<PIXI.AnimatedSprite>(null);
	const spritesheet = useRef<PIXI.Spritesheet | null>(null);
	const enemyQueue = useRef<EnemyQueueEntry[]>([]);
	const objects = useRef<Record<string, PIXI.DisplayObject> | null>(null);
	
	// let line = new PIXI.Graphics()
	// 		.lineStyle(1.0, 0xaaaaaa, 1)
	// 		.moveTo(1500, 115)
	// 		.lineTo(600, 150)
	// 		.lineTo(420, 115)
	// 		.endFill();
	
	// 	line.geometry.updateBatches();
	// 	let points = line.geometry.graphicsData[0].points;

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		const jim = objects.current!.jimAnim as PIXI.AnimatedSprite;
		const muzzle = objects.current!.muzzleAnim as PIXI.AnimatedSprite;
		
		

		for(const enemy of enemyQueue.current) {
			if (!objects.current || !spritesheet.current ) return;
		
			const container = objects.current.container as PIXI.Container;
			//container.addChild(line);

			let enemySprite;
			if(enemyQueue.current.length > 0){
				let enemyObject = enemyQueue.current.pop();
				if (enemyObject!.enemy == 'crow') {
					enemySprite = new PIXI.AnimatedSprite(spritesheet.current.animations.crow);
					enemySprite.x = 1500;
					enemySprite.y = 105;
					enemySprite.scale.x = -1;
					enemySprite.animationSpeed = 1/5;
					enemySprite.play();
					container.addChild(enemySprite);
					
				} else {
					enemySprite = new PIXI.AnimatedSprite(spritesheet.current.animations.fifimove);
					enemySprite.x = 1500;
					enemySprite.y = 105;
					enemySprite.scale.x = -1;
					enemySprite.animationSpeed = 1/5;
					enemySprite.play();
					container.addChild(enemySprite);
				}
				 
				let gotHit = false;
				let yCount = 0;

				let drawCount = 0;

				const renderer = app.current!.renderer as any;
				const drawElements = renderer.gl.drawElements;
				renderer.gl.drawElements = (...args: any[]) => {
				drawElements.call(renderer.gl, ...args);
				drawCount++;
				};

				app.current!.ticker.add(delta => {
					drawCount = 0;
					const speed = 5;
					
					if(!gotHit) {
						enemySprite!.x = (enemySprite!.x - (speed) * delta);
						if(enemyObject!.enemy =='fifi') {
							if(drawCount % 25 == 0) {
								enemySprite!.y = enemySprite!.y + 0.20;
							}
						}
					} else {
						enemySprite!.x = (enemySprite!.x + (speed*2) * delta);
						if(enemyObject!.enemy == 'crow') {
							enemySprite!.y = (enemySprite!.y + delta + yCount);
							yCount = yCount + 1;

						} else {
							if(drawCount % 25 == 0) {
								enemySprite!.y = enemySprite!.y - 0.40;
							}
						}
					}	
					if (enemySprite!.x < 615 && !gotHit) {
						
						jim.textures = spritesheet.current!.animations.jimshoot;
						jim.play();
						muzzle.textures = spritesheet.current!.animations.muzzle;
						muzzle.x = 200;
						muzzle.y = 150;
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
					if (enemySprite!.x < 575) {
						gotHit = true;
						if(enemyObject!.enemy =='crow') {
							enemySprite!.scale.x *= -1;
							enemySprite!.textures = spritesheet.current!.animations.hurt;
							setTimeout(() => {
								enemySprite!.textures = spritesheet.current!.animations.crow;
								enemySprite!.play();
							}, 200);
						} else {
							enemySprite!.scale.x *= -1;
							enemySprite!.textures = spritesheet.current!.animations.fifibark;
							setTimeout(() => {
								enemySprite!.textures = spritesheet.current!.animations.fifimove;
								enemySprite!.play();
							}, 200);
						}

					}
					
				});
				
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
			container.addChild(background);

			const jim = objects.current.jimAnim as PIXI.AnimatedSprite;
			jim.textures = spritesheet.current.animations.tile;
			jim.animationSpeed = 1/4;
			jim.x = 138;
			jim.y = 158;
			jim.play();
			container.addChild(jim);

			

			// const crow = objects.current.crowAnim as PIXI.AnimatedSprite;
			// crow.textures = spritesheet.current.animations.crow;
			// crow.animationSpeed = 1/5;
			// crow.scale.x = -1
			// crow.x = 450;
			// crow.y = 5;
			// crow.play();
			// container.addChild(crow);

			// const fifi = objects.current.fifiAnim as PIXI.AnimatedSprite;
			// fifi.textures = spritesheet.current.animations.fifimove;
			// fifi.animationSpeed = 1/3;
			// fifi.scale.x = -1;
			// fifi.x = 1100;
			// fifi.y = 125;
			// fifi.play();
			// container.addChild(fifi);
		});

	});
	useListenFor('donation', (donation: FormattedDonation) => {
		// const addCrow = () => {
		// 	let xPos = (Math.random() * 600) + 100;
		// 	const el = document.createElement('img');
		// 	el.className = 'donationcrow';
		// 	el.style.transform = 'scaleX(-1)'
		// 	el.style.left = xPos +'px';
		// 	el.style.top = '375px';
		// 	if(donation.rawAmount >= 100) {
		// 		el.src = crowGif;
		// 	} else {
		// 		el.src = crowGif;
		// 	}
		// 	containerRef.current?.appendChild(el);

		// 	requestAnimationFrame(() =>
		// 		requestAnimationFrame(() => {
		// 			el.style.left = xPos +'px';
		// 			el.style.top = `-${Math.random() * 100 + 116}px`;
		// 			el.style.transform = `scale (2)`;
		// 		}),
		// 	);

		// 	setTimeout(() => {
		// 		el.style.transition = `transform 5s, top 4s, left 4s`;
		// 		el.style.top = `${Math.random() * 10 + 50}px`;
		// 		el.style.left = `${Math.random() * 10 + 150}px`;
		// 	}, 1200);

		// 	setTimeout(() => {
		// 		el.style.top = `-1000px`;
		// 		el.style.left = `350px`;
		// 	}, 2400);

		// 	setTimeout(() => {
		// 		containerRef?.current?.removeChild(el);
		// 	}, 3000);
		// };

		
		// setTimeout(addCrow, (Math.random() * 60));
		
		
		let enemyType;
		if (donation.rawAmount > 100) {
			enemyType = 'fifi';
		} else {
			enemyType = 'crow'; 
		}
		
		enemyQueue.current.push({donoAmt: donation.rawAmount, enemy: enemyType, status: EnemyStatus.WAITING});
	});

	return (
		<Container ref={containerRef}>
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

	.donationcrow {
		position: absolute;
		transition: transform 5s, top 4s ease-in-out;
	}
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
		background: linear-gradient(#ffffff, #555555);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		filter: drop-shadow(3px 3px #6a560a);
	}
	filter: drop-shadow(2px 2px 10px #3f200b) drop-shadow(2px 2px 30px #3f200b);
`;

const Jim = styled.img`
	position: absolute;

	transform: scale(1.5) translate(115px, 108px);
`;
