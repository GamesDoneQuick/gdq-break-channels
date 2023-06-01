import { Credit, channels } from '@gdq/channels';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';
import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import staticImg from '../assets/static.gif';
import GitHubLogo from '../assets/GitHub-Mark-32px.png';
import TwitchLogo from '../assets/TwitchGlitchPurple.png';
import TwitterLogo from '../assets/TwitterLogo.png';

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
			{channel.credit && (
				<CreditEl position={channel.credit.position}>
					{channel.credit.site && (
						<CreditIcon src={channel.credit.site === 'GitHub' ? GitHubLogo :
							channel.credit.site === 'Twitter' ? TwitterLogo : TwitchLogo} />
					)}
					<CreditName>{channel.credit.handle}</CreditName>
				</CreditEl>
			)}
			<StaticImg src={staticImg} ref={staticRef} />
			<ChannelNumber data-title={channel.number} ref={numberRef}>
				{channel.number}
			</ChannelNumber>
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
	z-index: 202;

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
	z-index: 200;
`;

const CreditEl = styled.div<Pick<Credit, 'position'>>`
	position: absolute;
	display: flex;
	height: 27px;
	z-index: 199;

	${(p) => {
		switch (p.position) {
			case 'topLeft':
				return `
					top: 0;
					left: 0;
				`;
			case 'topRight':
				return `
					top: 0;
					right: 0;
				`;
			case 'bottomLeft':
				return `
					bottom: 0;
					left: 0;
				`;
			case 'bottomRight':
				return `
					bottom: 0;
					right: 0;
				`;
		}
	}}
`;

const CreditIcon = styled.img`
	background: white;
	width: 27px;
	height: 27px;
	margin: 0;
	padding: 4px;
	box-sizing: border-box;
	object-fit: contain;
`;

const CreditName = styled.span`
	background: black;
	color: white;
	font-family: 'Dosis', sans-serif;
	font-weight: 700;
	font-size: 20px;
	line-height: 27px;
	padding: 0 9px;
	text-transform: uppercase;
`;
