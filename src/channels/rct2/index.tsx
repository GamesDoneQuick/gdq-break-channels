//RollerCoaster Tycoon-styled Donation Channel
//Made by Tallest_Tree
//This is the first time I'm doing something in React, so feel free to make improvements

import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import background from './video.webm'
import menus from './rctmenustatic.png'
import balloon from './balloon.gif'
import pop from './pop.gif'
import bottomBar from './bottomBar.png'
import researchBar from'./bottomBarResearch.png'
import { useEffect, useRef } from 'react';
import { CurrencyToAbbreviation } from 'currency-to-abbreviation';

import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';

registerChannel('RollerCoaster Tycoon', 331, RCT2, {
	position: 'topLeft',
	site: 'Twitch',
	handle: 'Tallest_Tree',
});

var bottomInProgress = 0;

function RCT2(props: ChannelProps) {
	const [event] = usePreloadedReplicant<Event>('currentEvent');
	const [total] = useReplicant<Total | null>('total', null);
	const containerRef = useRef<HTMLDivElement>(null);
	const RandomPopupInterval = 60000; //one per minute
	const BottomMessageStickTime = 8000; //How long bottombar elements stay around

	enum MessageType {
		Award,
		Research
	};

	type Message = {
		content: string;
		type: MessageType;
	};

	const Messages: Message[] = [
		//Feel free to add on to these, inspiration is hard
		//awards
		{ content: "having 'The hypest run in the country'!", type: MessageType.Award },
		{ content: "having 'The roundest orbs in the country'!", type: MessageType.Award },
		{ content: "having 'The cutest saved animals in the country'!", type: MessageType.Award },
		{ content: "having 'The fastest saved frames in the country'!", type: MessageType.Award },
		{ content: "having 'The biggest time saves in the country'!", type: MessageType.Award },
		{ content: "being 'The park with the most chefs in the country'!", type: MessageType.Award },
		//researches
		{ content: "$5 Hype Train", type: MessageType.Research },
		{ content: "Airboat Coaster", type: MessageType.Research },
		{ content: "TASBot Circus", type: MessageType.Research },
		{ content: "OOB-atron", type: MessageType.Research },
		{ content: "Annoying Goose Coaster", type: MessageType.Research },
		{ content: "BLJ Staircase", type: MessageType.Research },
		{ content: "OOOOOOORRRRRB!", type: MessageType.Research }

	]

	useEffect(() => {
		const interval = setInterval(() => {
			
		}, RandomPopupInterval);
	});

	useListenFor('donation', (donation: FormattedDonation) => {
		const checkFives = () => {
			//Returns true every milestone
			const milestone = 5000;
			return (donation.rawNewTotal % milestone < donation.rawAmount && donation.rawNewTotal > 3000);
		}
		
		const spawnBalloon = () => {
			const el = document.createElement('img');
			el.className = 'balloon';
			el.style.filter = `hue-rotate(${Math.random() * 360}deg)`;
			el.style.left = `${Math.random() * 1100}px`;
			el.style.top = '350px';
			el.style.scale = '1';
			el.style.imageRendering = 'pixelated';
			el.src = balloon;

			containerRef?.current?.appendChild(el);

			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					el.style.left = `${Math.random() * 1080 + 10}px`;
					el.style.top = '-50px';
				}),
			);

			if (Math.random() < 0.25) {
				//pop animation is 0.2s
				const popTimer = Math.random() * 6000 + 2000;
				setTimeout(() => {
					//TODO: Maybe make sure the pop doesn't go up
					//v low priority
					el.style.transition = 'top 2000s linear';
					el.src = pop;
				}, popTimer)

				setTimeout(() => {
					containerRef?.current?.removeChild(el);
				}, popTimer + 200)
			}

			setTimeout(() => {
				containerRef?.current?.removeChild(el);
			}, 12000)
		}

		const spawnBottom = () => {
			const el = document.createElement('img');
			el.className = 'bottomBarAward';
			el.style.left = '142px';
			el.style.bottom = '-50px';
			el.src = bottomBar;

			const text = document.createElement('text');
			text.className = 'awardText';
			const formattedMilestone = CurrencyToAbbreviation({
				inputNumber: (Math.floor((donation.rawNewTotal - donation.rawAmount) / 5000) + 1) * 5000,
				inputLocale: 'en-US',
				decimalPlacesToRound: 2,
			});
			text.innerText = "Your park has received an award for donating " + formattedMilestone + " to " + event.beneficiaryShort + "!";
			text.style.top = '105.5%';

			containerRef?.current?.appendChild(el);
			containerRef?.current?.appendChild(text);

			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					el.style.bottom = '0%';
					text.style.top = '95.5%';
				}),
			);

			bottomInProgress = 1;

			setTimeout(() => {
				containerRef?.current?.removeChild(el);
				containerRef?.current?.removeChild(text);
				bottomInProgress = 0;
			}, BottomMessageStickTime)
		}

		const spawnRandomEvent = () => {
			const message = Messages[Math.floor(Math.random() * Messages.length)];
			const messageString = message.content;
			const messageType = message.type;
			if (bottomInProgress === 0) {
				bottomInProgress = 1;
				if (messageType === MessageType.Award) {
					const el = document.createElement('img');
					el.className = 'bottomBarAward';
					el.style.left = '142px';
					el.style.bottom = '-50px';
					el.src = bottomBar;

					const text = document.createElement('text');
					text.className = 'awardText';
					text.innerText = "Your park has received an award for " + messageString;
					text.style.top = '105.5%';

					containerRef?.current?.appendChild(el);
					containerRef?.current?.appendChild(text);

					requestAnimationFrame(() =>
						requestAnimationFrame(() => {
							el.style.bottom = '0%';
							text.style.top = '95.5%';
						}),
					);

					setTimeout(() => {
						containerRef?.current?.removeChild(el);
						containerRef?.current?.removeChild(text);
						bottomInProgress = 0;
					}, BottomMessageStickTime)
				}
				if (messageType === MessageType.Research) {
					const el = document.createElement('img');
					el.className = 'bottomBarAward';
					el.style.left = '142px';
					el.style.bottom = '-50px';
					el.src = researchBar;

					const text = document.createElement('text');
					text.className = 'researchText';
					text.innerText = "New ride/attraction now available:";
					text.style.top = '104%';

					const text2 = document.createElement('text2');
					text2.className = 'researchText';
					text2.innerText = messageString;
					text2.style.top = '107%';

					containerRef?.current?.appendChild(el);
					containerRef?.current?.appendChild(text);
					containerRef?.current?.appendChild(text2);

					requestAnimationFrame(() =>
						requestAnimationFrame(() => {
							el.style.bottom = '0%';
							text.style.top = '94%';
							text2.style.top = '97%';
						}),
					);

					setTimeout(() => {
						containerRef?.current?.removeChild(el);
						containerRef?.current?.removeChild(text);
						containerRef?.current?.removeChild(text2);
						bottomInProgress = 0;
					}, BottomMessageStickTime)
				}
			}
		}

		setTimeout(spawnBalloon, 10);
		if (checkFives() && bottomInProgress === 0) {
			setTimeout(spawnBottom, 10);
		}
		if (Math.random() <= 0.1) {
			//10% chance per donation of a special message
			setTimeout(spawnRandomEvent, 10);
		}
		/**
		 * Background is a webm (Looping time???)
		 * On donation: Balloon pops up, floats up (maybe popping chance???)
		 * What about bottom bar? Pop up during big donations? All donations?
		 */
	});

	return (
		<Container ref={containerRef}>
			<Background controls={false} autoPlay={true} loop={true} src={background} />
			<Menus />
			<EventText>
				<div>{event.shortname}</div>
			</EventText>
			<TotalEl>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalEl>
		</Container>
	);
}

const Background = styled.video`
	position: absolute;
	width: 100%;
	height: 100%;
`

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	overflow: hidden;

	.balloon {
		position: absolute;
		transition: transform 3s, top 10s linear;
		z-index: 1;
	}

	.bottomBarAward {
		position: absolute;
		z-index: 2;
		transition: transform 3s, bottom 0.5s linear;
	}

	.awardText {
		font-family: rct2;
		font-size: 16px;
		color: #FFB76B;

		position: absolute;
		z-index: 3;

		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		font-smooth: never;
		transition: transform 3s, top 0.5s linear;
	}

	.researchText {
		font-family: rct2;
		font-size: 16px;
		color: #8FD3F3;

		position: absolute;
		z-index: 3;

		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		font-smooth: never;
		transition: transform 3s, top 0.5s linear;
	}
`;

const Menus = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	background: url('${menus}');
	background-position: center;
	padding: 0;
	margin: 0;
	z-index: 2;
`;

const EventText = styled.div`
	font-family: rct2;
	font-size: 16px;
	color: #CFF3DF;

	position: absolute;
	z-index: 3;

	left: 93.5%;
	top: 95.5%;
	transform: translate(-50%, -50%);
`;

const TotalEl = styled.div`
	font-family: rct2;
	font-size: 16px;
	color: #CFF3DF;

	position: absolute;
	z-index: 3;

	left: 6.5%;
	top: 94%;
	transform: translate(-50%, -50%);
`;
