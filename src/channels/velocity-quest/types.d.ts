import type { FormattedDonation, TwitchSubscription } from '@gdq/types/tracker';

export type MessageQueueItem =
	| { kind: 'donation'; item: FormattedDonation }
	| { kind: 'subscription'; item: TwitchSubscription };

export type MonsterImageProps = {
	fullSteps: number;
	state: 'idle' | 'hurt';
	idleUrl: string;
	hurtUrl: string;
	onHurtAnimationEnd?: () => void;
	hurtDuration: number;
	hurtSteps: number;
};

export type MonsterProps = {
	monsterName: string;
	monsterState: 'idle' | 'hurt';
	idleUrl: string;
	hurtUrl: string;
	showStrike: boolean;
	showSparkle: boolean;
	monsterHP: number;
	monsterMaxHP: number;
	onHurtAnimationEnd?: () => void;
	onStrikeEnd?: () => void;
	onSparkleEnd?: () => void;
};

export type MonsterType = {
	name: string;
	hurt: string;
	idle: string;
};
