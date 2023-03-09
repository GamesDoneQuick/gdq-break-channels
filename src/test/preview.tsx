import { channels } from '@/channels';
import { usePreloadedReplicant } from '@/lib/hooks/usePreloadedReplicant';
import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import staticImg from '../assets/static.gif';

export function BreakChannels() {
	const [channelKey] = usePreloadedReplicant<number>('break-channel', 0);
	const [tempLock, setTempLock] = useState(false);
	const [key, setKey] = useState<number>(channelKey);

	const staticRef = useRef<HTMLImageElement>(null);
	const numberRef = useRef<HTMLSpanElement>(null);

	const channel = channels[key] ?? channels[0];

	useEffect(() => {
		if (!tempLock) setKey(channelKey);
	}, [channelKey, tempLock]);

	useEffect(() => {
		let timeout = setTimeout(() => {
			if (numberRef.current) numberRef.current.hidden = false;

			timeout = setTimeout(() => {
				if (staticRef.current) staticRef.current.hidden = true;

				timeout = setTimeout(() => {
					if (numberRef.current) numberRef.current.hidden = true;
				}, 2000);
			}, 500);
		}, 1000);

		if (staticRef.current) staticRef.current.hidden = false;

		return () => {
			clearTimeout(timeout);
		};
	}, [key]);

	return (
		<Container>
			<channel.el lock={() => setTempLock(true)} unlock={() => setTempLock(false)} />
			<StaticImg src={staticImg} ref={staticRef} />
			<ChannelNumber data-title={channel.number} ref={numberRef}>
				{channel.number}
			</ChannelNumber>
			{/*<H1>{tempLock ? 'Locked' : 'Unlocked'}</H1>*/}
		</Container>
	);
}

const Container = styled.div`
	position: relative;
	width: 1092px;
	height: 332px;
	background: black;
`;

const ChannelNumber = styled.span`
	position: absolute;
	left: 20px;
	top: 20px;
	font-size: 58px;
	font-family: osd;

	color: #e4e4e4;
	z-index: 2;

	&:before {
		content: attr(data-title);
		position: absolute;
		-webkit-text-stroke: 6px black;
		left: 0;
		z-index: -1;
	}
`;

const StaticImg = styled.img`
	position: absolute;
	width: 100%;
	height: 100%;
`;
