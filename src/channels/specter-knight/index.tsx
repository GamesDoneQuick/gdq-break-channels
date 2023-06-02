import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';

import specter from './specter.gif';
import specterbackground from './specterbackground.png';
import rat from './propellerrat.gif';
import ratking from './ratking.gif';
import { useRef } from 'react';

registerChannel('Specter Knight', 666, SpecterKnight, {
	position: 'bottomLeft',
	site: 'Twitch',
	handle: 'CMOrdonis',
});

export function SpecterKnight(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const containerRef = useRef<HTMLDivElement>(null);

	useListenFor('donation', (donation: FormattedDonation) => {
		const addRat = () => {
			let xPos = (Math.random() * 600) + 100;
			const el = document.createElement('img');
			el.className = 'donationrat';
			el.style.left = xPos +'px';
			el.style.top = '375px';
			el.style.transform = `scale(2)`;
			if(donation.rawAmount >= 100) {
				el.src = ratking;
			} else {
				el.src = rat;
			}
			containerRef?.current?.appendChild(el);

			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					el.style.left = xPos +'px';
					el.style.top = `-${Math.random() * 100 + 116}px`;
					el.style.transform = `scale (2)`;
				}),
			);

			setTimeout(() => {
				el.style.transition = `transform 3s, top 2s ease-in-out`;
				el.style.top = `${Math.random() * 10 + 111}px`;
			}, 800);

			setTimeout(() => {
				el.style.top = `-1200px`;
			}, 2400);

			setTimeout(() => {
				containerRef?.current?.removeChild(el);
			}, 3000);
		};

		
		setTimeout(addRat, (Math.random() * 60));

	});

	return (
		<Container ref={containerRef}>
			<Background src={specterbackground} />
			<Specter src={specter} />
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

	.donationrat {
		position: absolute;
		transition: transform 5s, top 4s ease-in-out;
	}
`;

const Background = styled.img`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
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

const Specter = styled.img`
	position: absolute;

	transform: scaleX(-1) scale(3) translate(-270px, 38px);
`;
