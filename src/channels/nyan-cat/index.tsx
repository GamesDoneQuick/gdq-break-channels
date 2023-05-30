import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import { useState } from 'react';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';

import './assets/css/nyan-cat.css';
import cat1 from './assets/cats/1.gif';
import cat2 from './assets/cats/2.gif';
import cat3 from './assets/cats/3.gif';
import cat4 from './assets/cats/4.gif';
import cat5 from './assets/cats/5.gif';
import cat6 from './assets/cats/6.gif';
import cat7 from './assets/cats/7.gif';
import cat8 from './assets/cats/8.gif';
import cat9 from './assets/cats/9.gif';
import cat10 from './assets/cats/10.gif';
import cat11 from './assets/cats/11.gif';
import cat12 from './assets/cats/12.gif';
import cat13 from './assets/cats/13.gif';

const cats = [cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8, cat9, cat10, cat11, cat12, cat13].sort(
	() => 0.5 - Math.random(),
);

registerChannel('Nyan Cat', 100, Template);

function Template(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);

	const [currentCat, setCurrentCat] = useState(cats[0]);
	let currentCatIndex = 0;

	const [latestDonation, setLatestDonation] = useState<FormattedDonation | null>(null);
	const donoTimer = 0;

	useListenFor('donation', (donation: FormattedDonation) => {
		setLatestDonation(donation);
		clearTimeout(donoTimer);
		setTimeout(() => setLatestDonation(null), 2000);

		currentCatIndex += 1;
		if (currentCatIndex >= cats.length) {
			currentCatIndex = 0;
		}
		setCurrentCat(cats[currentCatIndex]);
	});

	return (
		<Container>
			<TotalEl>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalEl>
			<div className="wrapper">
				<div className="nyan-cat">
					{latestDonation && (
						<NewDonoEl className="new-dono">
							<span>{latestDonation?.amount}</span>
						</NewDonoEl>
					)}
					<img src={currentCat} alt="" />
				</div>
				<div className="stars">
					{(() => {
						const stars = [];
						for (let i = 0; i <= 12; i++) {
							stars.push(
								<div className="star">
									<span></span>
								</div>,
							);
						}
						return stars;
					})()}
				</div>
			</div>
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

const NewDonoEl = styled.div`
	font-family: gdqpixel;
	font-size: 23px;
	color: white;

	position: absolute;

	right: 32px;
	bottom: 32px;
	z-index: 2;
`;

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	position: absolute;

	right: 32px;
	bottom: 32px;
	z-index: 2;
`;
