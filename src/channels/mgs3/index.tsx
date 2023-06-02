/**
 * @author Dillon Pentz <dillon@vodbox.io>
 */

import type { FormattedDonation, Total } from '@gdq/types/tracker';
import type { ChannelProps } from '..';

import { useEffect, useRef, useState } from 'react';
import { useHarmonicIntervalFn } from 'react-use';
import styled from '@emotion/styled';
import { useReplicant } from 'use-nodecg';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { registerChannel } from '..';
import { wait } from '@gdq/lib/util/wait';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';
import { useListenForFn } from '@gdq/lib/hooks/useListenForFn';

import mgs3Video from './SnakeLoop.webm';
import staticNoise from '@gdq/assets/static.gif';

registerChannel('Metal Gear Solid 3', 64, Mgs3, {
	handle: 'VodBox',
	position: 'bottomLeft',
	site: 'SupportClass',
});

const vid = document.createElement('video');
vid.src = mgs3Video;

const climbRep = nodecg.Replicant<number>('snake-climbed', {
	defaultValue: 0,
});

const climb = {
	value: 0,
};

climbRep.on('change', (value) => {
	climb.value = value;
});

const layoutQuery = new URLSearchParams(window.location.search);
const has = layoutQuery.has('layout');

export function Mgs3(_: ChannelProps) {
	const [climbed] = usePreloadedReplicant<number>('snake-climbed', 0);
	const [total] = useReplicant<Total | null>('total', null);

	const videoRef = useRef<HTMLVideoElement>(null);
	const topRef = useRef<HTMLDivElement>(null);

	const [_loaded, setLoadedState] = useState(false);

	const progress = useRef({
		value: climbed ?? 0,
		time: performance.now(),
	});

	useListenForFn('donation', (donation: FormattedDonation) => {
		climb.value = Math.max(climb.value, climbRep.value ?? 0) + Math.floor(Math.max(donation.rawAmount / 50, 1));
		if (has) return;
		climbRep.value = climb.value;
	});

	useEffect(() => {
		if (!videoRef.current) return;
		videoRef.current.pause();
		videoRef.current.currentTime = progressToTimeStamp(progress.current.value) % 33.6;
	}, [videoRef, _loaded]);

	useEffect(() => {
		if (!videoRef.current) return;
		videoRef.current.addEventListener('canplaythrough', () => setLoadedState(true));
	}, [videoRef]);

	useEffect(() => {
		if (!videoRef.current) return;

		const dts = progressToTimeStamp(climbed ?? 0) - progressToTimeStamp(progress.current.value);
		if (dts === 0) return;

		const dt = progress.current.time + dts * 1000 - performance.now();

		videoRef.current.playbackRate = 1;
		videoRef.current.play();

		let cleared = false;
		const timeout = setTimeout(async () => {
			if (!videoRef.current) return;

			const timestamp = progressToTimeStamp(climbed) % 33.6;
			const dts = timestamp - videoRef.current.currentTime;
			videoRef.current.playbackRate = 0.5;

			if (dts > 1 / 60) await wait(dts * 2000);
			if (cleared) return;

			videoRef.current.pause();
			videoRef.current.currentTime = timestamp;
		}, dt - 100);

		return () => {
			cleared = true;
			clearTimeout(timeout);
		};
	}, [climbed]);

	useHarmonicIntervalFn(() => {
		const oldValue = progress.current.value;
		const newValue = Math.min(progress.current.value + 1 / progressToTimeStamp(30), climbed ?? 0);

		progress.current = {
			time: performance.now(),
			value: newValue,
		};

		if (!topRef.current || newValue === oldValue) return;
		topRef.current.innerHTML = `${progressToMetres(progress.current.value ?? 0).toFixed(1)}m`;
	}, 33);

	return (
		<Container>
			<Video ref={videoRef} src={mgs3Video} loop={true} />
			{!has && (
				<>
					<TopHUD ref={topRef}>{progressToMetres(climbed ?? 0).toFixed(1)}m</TopHUD>
					<BottomHUD />
				</>
			)}
			<Static src={staticNoise} />
			<TotalText>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalText>
		</Container>
	);
}

function progressToTimeStamp(progress: number) {
	return (progress * 21) / 60;
}

function progressToMetres(progress: number) {
	return progress * 1.92 * (164 / 544);
}

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
`;

const Video = styled.video`
	width: 100%;
	height: 100%;
	position: absolute;
	transform-origin: center;

	animation: 3s ease-in-out infinite scale;

	@keyframes scale {
		0% {
			transform: scale(1);
		}

		50% {
			transform: scale(1.003);
		}

		100% {
			transform: scale(1);
		}
	}
`;

const TotalText = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: #9a9a88;

	text-shadow: 0 0 4px black;

	position: absolute;

	bottom: 20px;
	left: 20px;
`;

const TopHUD = styled.div`
	position: absolute;
	top: 10px;
	left: 20px;

	padding-left: 8px;

	font-family: Helvetica, Arial, sans-serif;
	font-weight: 600;
	font-size: 22px;
	color: #949481;
	text-shadow: 0 0 4px black, 0 0 4px black, 0 0 2px black, 0 0 2px black, 0 0 4px black;
	z-index: 0;

	&:before {
		content: '';

		position: absolute;
		top: 14px;
		left: 0;
		background: #b4b593;
		border: 2px solid #3c4328;

		width: 210px;
		height: 14px;

		z-index: -1;
	}
`;

const BottomHUD = styled.div`
	position: absolute;
	top: 37px;
	left: 20px;

	border: 2px solid #3c4328;
	background: linear-gradient(
		to right,
		#505337 0%,
		#505337 calc(25% - 1px),
		transparent calc(25% - 1px),
		#8b8b71 calc(25% + 1px),
		#8b8b71 calc(50% - 1px),
		transparent calc(50% - 1px),
		transparent calc(50% + 1px),
		#b4b594 calc(50% + 1px),
		#b4b594 calc(75% - 1px),
		transparent calc(75% - 1px),
		transparent calc(75% + 1px),
		#dadbb7 calc(75% + 1px)
	);

	height: 8px;
	width: 372px;
`;

const Static = styled.img`
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	mix-blend-mode: hard-light;
	opacity: 0.06;
`;
