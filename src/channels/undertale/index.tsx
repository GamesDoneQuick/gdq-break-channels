import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';

import { useRef, useState } from 'react';

import battleBackground from './assets/battle-background.png';
import speechBubble from './assets/speech-bubble.png';
import playerHeart from './assets/heart.png';
import fightIcon from './assets/fight-icon.png';
import actIcon from './assets/act-icon.png';
import itemIcon from './assets/item-icon.png';
import mercyIcon from './assets/mercy-icon.png';

import { useRafLoop } from 'react-use';
import { GenericDonationMessages, getRandomEnemy, UndertaleDialogue, UndertaleEnemy } from './undertaleDialogue';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';

const DISABLE_GENERIC_MESSAGES = false;

const TYPE_WRITER_DELAY_MS = 50;
const TEXT_DISPLAY_DURATION_MS = 5000;
const TIME_BEFORE_EVENT_MS = 1000;
const TIME_BEFORE_IDLE_MS = 5000;

registerChannel('Undertale', 66, Undertale, {
	site: 'Twitch',
	position: 'bottomLeft',
	handle: 'Corvimae',
});

function selectRandomMessage(
	list: UndertaleDialogue[],
	lastDialogueIndex: number | null,
): [UndertaleDialogue | null, number | null] {
	if (list.length === 0) return [null, null];

	let selectedIndex = Math.floor(Math.random() * list.length);

	while (selectedIndex === lastDialogueIndex && list.length > 1) {
		selectedIndex = Math.floor(Math.random() * list.length);
	}

	return [list[selectedIndex], selectedIndex];
}

function applyDialogueReplacementsToLine(line: string, ...params: string[]) {
	return line.replace(/\$([0-9]+)/g, (_match, p1) => params[Number(p1) - 1]);
}

function applyDialogueReplacements(item: UndertaleDialogue | null, ...params: string[]): UndertaleDialogue | null {
	if (!item) return null;

	return {
		speechBubble: (item.speechBubble || []).map((line) => applyDialogueReplacementsToLine(line, ...params)),
		textBox: (item.textBox || []).map((line) => applyDialogueReplacementsToLine(line, ...params)),
	};
}

function useTypewriterText(defaultText: string[] = []): [string[], (value: string[]) => void, number] {
	const dialogue = useRef<string[]>(defaultText);
	const lastTypewriterMs = useRef(Date.now());
	const shownCharacters = useRef(0);
	const [shownText, setShownText] = useState<string[]>([]);

	function setDialogue(lines: string[]) {
		dialogue.current = lines;
		lastTypewriterMs.current = Date.now();
		shownCharacters.current = 0;
		setShownText([]);
	}

	useRafLoop(() => {
		if (dialogue.current.length > 0) {
			const now = Date.now();
			const timeSinceLastTypewriter = now - lastTypewriterMs.current;

			if (timeSinceLastTypewriter >= TYPE_WRITER_DELAY_MS) {
				const totalLength = dialogue.current.reduce((acc, str) => acc + str.length, 0);

				if (shownCharacters.current <= totalLength) {
					let charactersRemaining = shownCharacters.current;

					const dialogueToShow = [];

					for (const line of dialogue.current) {
						if (line.length <= charactersRemaining) {
							charactersRemaining -= line.length;

							dialogueToShow.push(line);
						} else if (charactersRemaining > 0) {
							const nextCharacterSet = line.substring(charactersRemaining, charactersRemaining + 4);

							if (nextCharacterSet === '<br>') {
								// Insert the entire line break
								shownCharacters.current += 3;
							}
							dialogueToShow.push(line.substring(0, charactersRemaining));
							charactersRemaining = 0;
						}
					}
					setShownText(dialogueToShow);

					shownCharacters.current += 1;
					lastTypewriterMs.current = now;
				} else if (timeSinceLastTypewriter >= TEXT_DISPLAY_DURATION_MS) {
					setDialogue([]);
				}
			}
		}
	});

	return [shownText, setDialogue, lastTypewriterMs.current];
}

type ChannelEvent = { type: 'donation'; value: number };

export function Undertale(props: ChannelProps) {
	const [event] = usePreloadedReplicant<Event>('currentEvent');
	const [total] = useReplicant<Total | null>('total', null);
	const activeEnemy = useRef<UndertaleEnemy>(getRandomEnemy());
	const lastDialogueIndex = useRef<number | null>(null);
	const [textBoxDialogue, setTextBoxDialogue, lastTextBoxDialogueMs] = useTypewriterText([]);
	const [speechBubbleDialogue, setSpeechBubbleDialogue, lastSpeechBubbleDialogueMs] = useTypewriterText([]);
	const pendingEvents = useRef<ChannelEvent[]>([]);

	useListenFor('donation', (donation: FormattedDonation) => {
		pendingEvents.current.push({ type: 'donation', value: donation.rawAmount });
	});
	const containerRef = useRef<HTMLDivElement>(null);

	const hasDialogue = textBoxDialogue.length > 0;

	useRafLoop(() => {
		if (textBoxDialogue.length === 0 && speechBubbleDialogue.length === 0) {
			// Nothing is being shown - if there are pending events, see if it's time to display a message.
			const lastTypewriterMs = Math.max(lastTextBoxDialogueMs, lastSpeechBubbleDialogueMs);
			const timeSinceLastEvent = Date.now() - lastTypewriterMs;

			let selectedMessage: UndertaleDialogue | null = null;

			if (pendingEvents.current.length > 0) {
				if (timeSinceLastEvent >= TIME_BEFORE_EVENT_MS) {
					const donationsTotal = Math.floor(
						pendingEvents.current.reduce((acc, donation) => acc + donation.value, 0),
					);

					pendingEvents.current = [];

					const [messageSet, selectedIndex] = selectRandomMessage(
						[
							...(DISABLE_GENERIC_MESSAGES ? [] : GenericDonationMessages),
							...(activeEnemy.current.donation || []),
						],
						lastDialogueIndex.current,
					);

					// todo: get charity dynamically
					selectedMessage = applyDialogueReplacements(messageSet, `$${donationsTotal}`, event.beneficiary);
					lastDialogueIndex.current = selectedIndex;
				}
			} else {
				if (timeSinceLastEvent >= TIME_BEFORE_IDLE_MS) {
					const [messageSet, selectedIndex] = selectRandomMessage(
						activeEnemy.current.idle || [],
						lastDialogueIndex.current,
					);
					selectedMessage = messageSet;
					lastDialogueIndex.current = selectedIndex;
				}
			}

			if (selectedMessage) {
				if (selectedMessage.speechBubble) setSpeechBubbleDialogue(selectedMessage.speechBubble);
				if (selectedMessage.textBox) setTextBoxDialogue(selectedMessage.textBox);
			}
		}
	});

	const CharacterComponent = activeEnemy.current.component;

	return (
		<Container ref={containerRef}>
			<Background />
			<BattleBG>
				{CharacterComponent ? <CharacterComponent /> : <Enemy src={activeEnemy.current.baseSprite} />}
				{speechBubbleDialogue.length > 0 && (
					<SpeechBubble font={activeEnemy.current.font}>
						{speechBubbleDialogue[0].split(/<br>/g).map((line, index) => (
							<div key={index}>{line}</div>
						))}
					</SpeechBubble>
				)}
			</BattleBG>
			<BattleData>
				<BattleText>
					<div>GDQ</div>
					<LevelText>LV 1</LevelText>
					<HealthContainer>
						HP
						<HealthBar />
						20 / 20
					</HealthContainer>
				</BattleText>
				<MenuIcons>
					<MenuIcon src={fightIcon} />
					<MenuIcon src={actIcon} />
					<MenuIcon src={itemIcon} />
					<MenuIcon src={mercyIcon} />
				</MenuIcons>
			</BattleData>
			<TextBox hasDialogue={hasDialogue}>
				{textBoxDialogue.map((line, index) => (
					<TextBoxLine key={index}>
						<LineMarker>*</LineMarker>
						<div>
							{line.split(/<br>/g).map((line, index) => (
								<div key={index}>{line}</div>
							))}
						</div>
					</TextBoxLine>
				))}
				{!hasDialogue && <PlayerHeart />}
			</TextBox>
			<TotalText>
				$<TweenNumber value={total?.raw} />
			</TotalText>
		</Container>
	);
}

const Background = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: #000;
`;

const BattleBG = styled.div`
	position: absolute;
	display: flex;
	width: 800px;
	height: 253px;
	left: 50%;
	transform: translateX(-50%);
	justify-content: center;
	align-items: flex-end;
	background-image: url('${battleBackground}');
`;

const BattleData = styled.div`
	position: absolute;
	display: flex;
	flex-direction: column;
	width: 740px;
	left: 50%;
	bottom: 8px;
	transform: translateX(-50%);
	align-items: center;
`;

const MenuIcons = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`;

const MenuIcon = styled.img`
	width: 110px;
	height: 42px;
`;

const BattleText = styled.div`
	display: flex;
	width: 100%;
	font-family: CryptOfTomorrow;
	color: #fff;
	margin-bottom: 2px;
	padding-left: 180px;
	font-size: 20px;
`;

const HealthContainer = styled.div`
	display: flex;
	align-items: center;
	margin-left: 80px;
`;

const HealthBar = styled.div`
	width: 24px;
	height: 14px;
	margin: -4px 8px 0;
	background-color: #f1d205;
`;

const LevelText = styled.div`
	margin-left: 16px;
`;

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	overflow: hidden;
`;

const Enemy = styled.img`
	transform: scale(2);
	transform-origin: 50% 100%;
	image-rendering: pixelated;
`;

const TextBox = styled.div<{ hasDialogue: boolean }>`
	position: absolute;
	font-family: DeterminationSans;
	left: 50%;
	width: ${({ hasDialogue }) => (hasDialogue ? '620px' : '150px')};
	height: 150px;
	bottom: 16px;
	border: 4px solid #fff;
	background-color: #000;
	color: #fff;
	padding: 12px 32px 12px 16px;
	font-size: 32px;
	transform: translateX(-50%);
	transition: width 500ms linear;
	box-sizing: border-box;
`;

const TextBoxLine = styled.div`
	display: flex;

	& + & {
		margin-top: 8px;
	}
`;

const LineMarker = styled.div`
	margin-right: 8px;
`;

const SpeechBubble = styled.div<{ font?: string }>`
	position: absolute;
	top: 105px;
	left: 500px;
	width: 237px;
	height: 104px;
	transform: translateY(-50%);
	background-image: url('${speechBubble}');
	font-family: ${({ font }) => font || 'DotumChe'};
	padding: 12px 8px 12px 40px;
	box-sizing: border-box;
	color: black;
`;

const PlayerHeart = styled.div`
	position: absolute;
	left: 50%;
	top: 50%;
	width: 16px;
	height: 16px;
	transform: translate(-50%, -50%);
	background-image: url('${playerHeart}');
	background-size: cover;
	image-rendering: pixelated;
`;

const TotalText = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	text-shadow: -1px 4px black;

	position: absolute;

	top: 20px;
	left: 20px;
`;
