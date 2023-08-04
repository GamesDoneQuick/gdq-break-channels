import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';

import jimidle from './jimidle.gif';
import sheetTexture from './jimidle/jimidle.png';
import { jimsheet } from './jimidle/jimsheet';
import ewjbackground from './ewjbackground.png';
import { useEffect, useRef } from 'react';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import * as PIXI from 'pixi.js';

registerChannel('Earthworm Jim', 94, EarthwormJim, {
	position: 'bottomLeft',
	site: 'Twitch',
	handle: 'CMOrdonis',
});

export function EarthwormJim(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const containerRef = useRef<HTMLDivElement>(null);
	const jim = useRef<PIXI.AnimatedSprite>(null);
	const spritesheet = useRef<PIXI.Spritesheet | null>(null);
	const objects = useRef<Record<string, PIXI.DisplayObject> | null>(null);

	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		
	

		
	});

	useEffect(() => {
		if (!app.current) return;

		const container = new PIXI.Container();
		app.current.stage.addChild(container);

		spritesheet.current = new PIXI.Spritesheet(PIXI.BaseTexture.from(sheetTexture), jimsheet);

		spritesheet.current.parse().then(() => {
			if (!spritesheet.current) return;

			objects.current = {
				container,
				background: new PIXI.Graphics(),
				jimAnim: new PIXI.AnimatedSprite([spritesheet.current.textures.tile001]),

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
		});
	});
	useListenFor('donation', (donation: FormattedDonation) => {
		// const addRat = () => {
		// 	let xPos = (Math.random() * 600) + 100;
		// 	const el = document.createElement('img');
		// 	el.className = 'donationrat';
		// 	el.style.left = xPos +'px';
		// 	el.style.top = '375px';
		// 	el.style.transform = `scale(2)`;
		// 	if(donation.rawAmount >= 100) {
		// 		el.src = ratking;
		// 	} else {
		// 		el.src = rat;
		// 	}
		// 	containerRef?.current?.appendChild(el);

		// 	requestAnimationFrame(() =>
		// 		requestAnimationFrame(() => {
		// 			el.style.left = xPos +'px';
		// 			el.style.top = `-${Math.random() * 100 + 116}px`;
		// 			el.style.transform = `scale (2)`;
		// 		}),
		// 	);

		// 	setTimeout(() => {
		// 		el.style.transition = `transform 3s, top 2s ease-in-out`;
		// 		el.style.top = `${Math.random() * 10 + 111}px`;
		// 	}, 800);

		// 	setTimeout(() => {
		// 		el.style.top = `-1200px`;
		// 	}, 2400);

		// 	setTimeout(() => {
		// 		containerRef?.current?.removeChild(el);
		// 	}, 3000);
		// };

		
		// setTimeout(addRat, (Math.random() * 60));

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

	// .donationrat {
	// 	position: absolute;
	// 	transition: transform 5s, top 4s ease-in-out;
	// }
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
