import { useState, useEffect, useRef, useCallback } from 'react';
import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import type { FormattedDonation, Total as TotalType, TwitchSubscription } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import type { MessageQueueItem, MonsterType } from './types';
import { DonationDialog } from './DonationDialog';
import { Monster } from './Monster';
import { SubscriptionNotification } from './SubscriptionNotification';
import { Total } from './Total';
import { Velocity } from './Velocity';
import { VictoryDialog } from './VictoryDialog';

import bg from './assets/bg.png';
import badRngIdle from './assets/bad-rng/bad-rng-idle-sheet.png';
import badRngHurt from './assets/bad-rng/bad-rng-hurt-sheet.png';
import orbIdle from './assets/orb/orb-idle-sheet.png';
import orbHurt from './assets/orb/orb-hurt-sheet.png';
import runKillerIdle from './assets/run-killer/run-killer-idle-sheet.png';
import runKillerHurt from './assets/run-killer/run-killer-hurt-sheet.png';
import softLockIdle from './assets/softlock/softlock-idle-sheet.png';
import softLockHurt from './assets/softlock/softlock-hurt-sheet.png';

registerChannel('Velocity Quest', 95, VelocityQuest, {
	position: 'bottomLeft',
	site: 'Twitch',
	handle: 'PIGSquad',
});

const MESSAGE_DISPLAY_TIME = 3000;

const monsters: { [key: string]: MonsterType } = {
	BadRNG: {
		name: 'Bad RNG',
		hurt: badRngHurt,
		idle: badRngIdle,
	},
	Orb: {
		name: 'Orb',
		hurt: orbHurt,
		idle: orbIdle,
	},
	RunKiller: {
		name: 'Run Killer',
		hurt: runKillerHurt,
		idle: runKillerIdle,
	},
	Softlock: {
		name: 'Softlock',
		hurt: softLockHurt,
		idle: softLockIdle,
	},
};

function VelocityQuest(props: ChannelProps) {
	const [total] = useReplicant<TotalType | null>('total', null);
	const dialogTimerRef = useRef<NodeJS.Timeout | null>(null);
	const messageQueueRef = useRef<Array<MessageQueueItem>>([]);
	const [currentMessage, setCurrentMessage] = useState<MessageQueueItem>();

	const [monsterHP, setMonsterHP] = useState<number>(0);
	const [monsterMaxHP, setMonsterMaxHP] = useState<number>(0);
	const [monsterKey, setMonsterKey] = useState<string>('');
	const [monsterState, setMonsterState] = useState<'idle' | 'hurt'>('idle');
	const [monsterName, setMonsterName] = useState<string>('');
	const victoryTimerRef = useRef<NodeJS.Timeout | null>(null);
	const [showVictoryDialog, setShowVictoryDialog] = useState<boolean>(false);
	const [idleUrl, setIdleUrl] = useState<string>('');
	const [hurtUrl, setHurtUrl] = useState<string>('');
	const [displayTotal, setDisplayTotal] = useState<number>(0);
	const [showSparkle, setShowSparkle] = useState<boolean>(false);
	const [showStrike, setShowStrike] = useState<boolean>(false);
	const [showSubscription, setShowSubscription] = useState<boolean>(false);
	const [velocityState, setVelocityState] = useState<'idle' | 'attack'>('idle');

	const showNextDonationOrSubscription = useCallback(() => {
		const next = messageQueueRef.current.shift();
		if (!next) {
			setCurrentMessage(undefined);
			return;
		}
		setCurrentMessage(next);

		if (dialogTimerRef.current) {
			clearTimeout(dialogTimerRef.current);
		}

		dialogTimerRef.current = setTimeout(() => {
			dialogTimerRef.current = null;
			showNextDonationOrSubscription();
		}, MESSAGE_DISPLAY_TIME);

		if (next.kind === 'donation') {
			setMonsterHP((oldHp) => Math.floor(oldHp - next.item.rawAmount));
			setVelocityState('attack');
			setMonsterState('hurt');
			setShowStrike(true);
			setDisplayTotal((prev) => Math.floor(prev + (next.item.rawAmount ?? 0)));
		} else {
			setShowSubscription(true);
		}
	}, []);

	useListenFor('donation', (donation: FormattedDonation) => {
		messageQueueRef.current.push({ kind: 'donation', item: donation });

		if (!dialogTimerRef.current && !currentMessage) {
			showNextDonationOrSubscription();
		}
	});

	useListenFor('subscription', (subscription: TwitchSubscription) => {
		messageQueueRef.current.push({ kind: 'subscription', item: subscription });

		if (!dialogTimerRef.current && !currentMessage) {
			showNextDonationOrSubscription();
		}
	});

	useEffect(() => {
		return () => {
			if (dialogTimerRef.current) clearTimeout(dialogTimerRef.current);
			if (victoryTimerRef.current) clearTimeout(victoryTimerRef.current);
		};
	}, []);

	const spawnMonster = useCallback(() => {
		const currentMonster = Object.keys(monsters)[Math.floor(Math.random() * Object.keys(monsters).length)];

		const randomHP = Math.floor(Math.random() * 1000) * (currentMonster === 'RunKiller' ? 5 : 1);
		setMonsterHP(randomHP);
		setMonsterMaxHP(randomHP);
		setMonsterName(monsters[currentMonster].name);
		setMonsterKey(currentMonster);
		setIdleUrl(monsters[currentMonster]?.idle || '');
		setHurtUrl(monsters[currentMonster]?.hurt || '');
		setMonsterState('idle');
		setShowSparkle(true);
	}, []);

	useEffect(() => {
		spawnMonster();
	}, [spawnMonster]);

	useEffect(() => {
		if (total === null) return;
		setDisplayTotal(Math.floor(total.raw));
	}, [total]);

	const onVictory = useCallback(() => {
		setShowVictoryDialog(true);
		setMonsterKey('');
		setIdleUrl('');
		setHurtUrl('');
		const timer = setTimeout(() => {
			setShowVictoryDialog(false);
			spawnMonster();
		}, MESSAGE_DISPLAY_TIME);
		victoryTimerRef.current = timer;
	}, [spawnMonster]);

	const handleAttackEnd = () => {
		setVelocityState('idle');
	};

	const handleMonsterHurtEnd = () => {
		setMonsterState('idle');
		if (monsterHP < 0) {
			onVictory();
		}
	};

	const handleSparkleEnd = () => {
		setShowSparkle(false);
	};

	const handleStrikeEnd = () => {
		setShowStrike(false);
	};

	const handleSubscriptionEnd = () => {
		setShowSubscription(false);
	};

	return (
		<Container>
			<BG />
			<Velocity velocityState={velocityState} onAnimationEnd={handleAttackEnd} />
			{currentMessage?.kind === 'donation' && <DonationDialog donation={currentMessage.item} />}
			<SubscriptionNotification show={showSubscription} onSubscriptionEnd={handleSubscriptionEnd} />
			<Monster
				onSparkleEnd={handleSparkleEnd}
				onStrikeEnd={handleStrikeEnd}
				monsterName={monsterName}
				monsterState={monsterState}
				idleUrl={idleUrl}
				hurtUrl={hurtUrl}
				showStrike={showStrike}
				showSparkle={showSparkle}
				monsterHP={monsterHP}
				monsterMaxHP={monsterMaxHP}
				onHurtAnimationEnd={handleMonsterHurtEnd}
			/>
			<Total displayTotal={displayTotal} />
			<VictoryDialog showVictoryDialog={showVictoryDialog} monsterName={monsterName} />
		</Container>
	);
}

const BG = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	background-image: url(${bg});
	background-size: cover;
	background-position: center;
	background-repeat: no-repeat;
`;

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
`;
