/**
 * @author Chris Hanel <chrishanel@gmail.com>
 * @author Dillon Pentz <dillon@vodbox.io>
 */

import { ChannelProps, registerChannel } from '..';
import type { FormattedDonation, Total } from '@gdq/types/tracker';

import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';
import { useListenFor, useReplicant } from 'use-nodecg';
import TweenNumber from '@gdq/lib/components/TweenNumber';

import background from './background.png';
import stanAndGuybrush from './stan_and_guybrush.gif';
import star from './star.png';
import snakeEater from './background.webm';

registerChannel('Monkey Island', 3, MonkeyIsland);

const musicOverrideRep = nodecg.Replicant<string | null>('music-override', {
	defaultValue: null,
});

const hardLock = nodecg.Replicant<boolean>('break-screen-lock', {
	defaultValue: false,
});

let dialogLock = true;

export function MonkeyIsland(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const guyRef = useRef<HTMLSpanElement>(null);
	const stanRef = useRef<HTMLSpanElement>(null);
	const starsRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	useListenFor('donation', (donation: FormattedDonation) => {
		if (donation.rawAmount > 500 && Math.random() > 0.2) {
			(async () => {
				if (!dialogLock) {
					dialogLock = true;
					props.lock();

					await donationDialogOptions[Math.floor(Math.random() * donationDialogOptions.length)](
						stanRef,
						guyRef,
						donation.amount,
					);

					dialogLock = false;
					props.unlock();
				}
			})();
		}

		if (!starsRef.current) return;

		const posX = Math.floor(Math.random() * 910);

		const el = document.createElement('img');
		el.src = star;

		let idx = 0;

		const step = () => {
			if (!starsRef.current) return;

			const sx = idx % 2;
			const sy = Math.floor(idx / 2);

			el.style.transform = `translate(${posX - 182 * sx}px, ${sy * -43}px)`;
			el.style.clipPath = `inset(${sy * 43}px ${(1 - sx) * 182}px ${(3 - sy) * 43}px ${sx * 182}px)`;

			idx += 1;
			if (idx === 8) {
				starsRef.current.removeChild(el);
				return;
			}

			setTimeout(step, 1000 / 12);
		};

		step();

		starsRef.current.appendChild(el);
	});

	useEffect(() => {
		const run = async () => {
			if (!dialogLock) {
				dialogLock = true;
				props.lock();

				await dialogOptions[Math.floor(Math.random() * dialogOptions.length)](stanRef, guyRef);

				dialogLock = false;
				props.unlock();
			}

			timeout = setTimeout(run, 240000 + Math.random() * 480000);
		};

		let timeout = setTimeout(run, 240000 + Math.random() * 480000);

		return () => {
			clearTimeout(timeout);
		};
	}, []);

	useListenFor('mi-snake-eater', () => {
		if (!videoRef.current) return;

		const relock = hardLock.value;

		hardLock.value = true;
		dialogLock = true;
		props.lock();

		videoRef.current.src = snakeEater;
		videoRef.current.volume = 0.8;
		videoRef.current.play();

		musicOverrideRep.value = `ocremix.org [Dj Mystix feat. Claire Yaxley] - Metal Gear Solid 3 "Innocent Deception" OC ReMix`;

		let x: () => void;
		videoRef.current.addEventListener(
			'ended',
			(x = () => {
				if (videoRef.current) {
					videoRef.current.removeEventListener('ended', x);
					videoRef.current.src = '';
				}

				musicOverrideRep.value = '';
				hardLock.value = relock;
				dialogLock = false;
				props.unlock();
			}),
		);
	});

	useEffect(() => {
		dialogLock = false;

		return () => {
			dialogLock = false;
			musicOverrideRep.value = null;
		};
	}, []);

	return (
		<Container>
			<VideoBG ref={videoRef} />
			<ShootingStars ref={starsRef} />
			<TotalText>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalText>
			<StanAndGuybrush src={stanAndGuybrush} />
			<Dialogue>
				<Guybrush ref={guyRef}></Guybrush>
			</Dialogue>
			<Dialogue>
				<Stan ref={stanRef}></Stan>
			</Dialogue>
		</Container>
	);
}

const dialog = (
	stanRef: React.RefObject<HTMLSpanElement>,
	guyRef: React.RefObject<HTMLSpanElement>,
	text: string,
	delay: number,
	duration: number,
	stan?: boolean,
): Promise<void> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			const ref = stan ? stanRef.current : guyRef.current;
			if (ref) ref.innerText = text;

			setTimeout(() => {
				const ref = stan ? stanRef.current : guyRef.current;
				if (ref) ref.innerText = '';

				resolve();
			}, duration);
		}, delay);
	});
};

const dialogOptions: ((
	stanRef: React.RefObject<HTMLSpanElement>,
	guyRef: React.RefObject<HTMLSpanElement>,
) => Promise<void>)[] = [
	async (stanRef, guyRef) => {
		await dialog(stanRef, guyRef, 'Look behind you, a three headed monkey!', 4000, 4000);
		await dialog(stanRef, guyRef, 'No.', 600, 1000, true);
		await dialog(stanRef, guyRef, 'Aww, why not?', 1300, 2500);
		await dialog(stanRef, guyRef, "I don't have those animation frames.", 1000, 3500, true);
		await dialog(stanRef, guyRef, 'Oh.', 1000, 1500);
	},
	async (stanRef, guyRef) => {
		await dialog(stanRef, guyRef, 'So how exactly is there a big number in the sky?', 4000, 5000);
		await dialog(stanRef, guyRef, "Listen kid, don't question things too much.", 500, 5000, true);
		await dialog(stanRef, guyRef, 'But...', 300, 1000);
		await dialog(stanRef, guyRef, '...nevermind', 100, 3000);
	},
];

const donationDialogOptions: ((
	stanRef: React.RefObject<HTMLSpanElement>,
	guyRef: React.RefObject<HTMLSpanElement>,
	amount: string,
) => Promise<void>)[] = [
	async (stanRef, guyRef, amount) => {
		await dialog(stanRef, guyRef, `Oh wow! A ${amount} donation!`, 0, 4000);
		await dialog(stanRef, guyRef, "I wonder if they'd be interested in a slightly used ship...", 600, 7000, true);
	},
];

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	background: url('${background}');
	background-position: center;
	padding: 0;
	margin: 0;
`;

const ShootingStars = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;

	img {
		position: absolute;
		top: 0;
		left: 0;
	}
`;

const Dialogue = styled.div`
	font-family: monkeyisland;
	font-size: 20px;
	line-height: 30px;
	position: absolute;
	width: 90%;
	left: 5%;
	top: 48%;
	text-shadow: -3px 0 black, 0 -3px black, 3px 0 black, 0 3px black, -3px -3px black, -3px 3px black, 3px -3px black,
		3px 3px black;
	overflow-wrap: break-word;
`;

const Guybrush = styled.span`
	display: inline-block;
	text-align: right;
	color: white;
	padding-right: 550px;
	width: 100%;
	box-sizing: border-box;
`;

const Stan = styled.span`
	display: inline-block;
	text-align: left;
	color: #de52de;
	padding-left: 550px;
	width: 100%;
	box-sizing: border-box;
`;

const StanAndGuybrush = styled.img`
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50px, 0);
`;

const TotalText = styled.div`
	font-family: monkeyisland;
	font-size: 48px;
	color: #53ff89;

	text-shadow: -6px 0 black, 0 -6px black, 6px 0 black, 0 6px black;

	position: absolute;

	left: 50%;
	top: 47px;

	transform: translate(-50%, 0);
`;

const VideoBG = styled.video`
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
`;
