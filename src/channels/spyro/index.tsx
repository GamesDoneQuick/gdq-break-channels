import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';

import loopVideo from './video.webm';
import gem from './gem.gif';
import { useRef } from 'react';

registerChannel('Spyro', 98, Spyro);

export function Spyro(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const containerRef = useRef<HTMLDivElement>(null);

	useListenFor('donation', (donation: FormattedDonation) => {
		const addGem = () => {
			const el = document.createElement('img');
			el.className = 'donationgem';
			el.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
			el.style.left = '-40px';
			el.style.top = `${Math.random() * 502 - 135}px`;
			el.style.transform = `rotate(${Math.random() * 90 - 45}deg)`;
			el.src = gem;

			containerRef?.current?.appendChild(el);

			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					el.style.left = '1200px';
					el.style.top = `${Math.random() * 100 + 116}px`;
					el.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;
				}),
			);

			setTimeout(() => {
				el.style.transition = `transform 3s, left 2s ease-out, top 1s ease-in-out`;
				el.style.top = `${Math.random() * 10 + 111}px`;
			}, 800);

			setTimeout(() => {
				el.style.top = `1200px`;
			}, 1200);

			setTimeout(() => {
				containerRef?.current?.removeChild(el);
			}, 3000);
		};

		for (let i = 0, l = Math.log(donation.rawAmount); i < l; ++i) {
			setTimeout(addGem, i * 60);
		}
	});

	return (
		<Container ref={containerRef}>
			<Background controls={false} autoPlay={true} loop={true} src={loopVideo} />
			<TotalEl>
				<Gem src={gem} />
				<span>
					$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
				</span>
			</TotalEl>
		</Container>
	);
}

const Background = styled.video`
	position: absolute;
	width: 100%;
	height: 100%;
`;

const Gem = styled.img`
	display: inline;
	object-fit: contain;
	height: 50px;
	margin-right: 10px;
`;

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	overflow: hidden;

	.donationgem {
		position: absolute;
		transition: transform 3s, left 2s ease-out, top 0.6s ease-in-out;
	}
`;

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	position: absolute;

	right: 30px;
	top: 50%;
	transform: translate(0, -50%);

	span {
		background: linear-gradient(#ffff5b, #968531);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		filter: drop-shadow(3px 3px #6a560a);
	}

	filter: drop-shadow(2px 2px 10px #3f200b) drop-shadow(2px 2px 30px #3f200b);
`;
