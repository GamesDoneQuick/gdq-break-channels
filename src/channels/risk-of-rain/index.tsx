/**
 * @author Vincent Mahnke <vincent@mahn.ke>
 */

import { useEffect, useRef, useState } from 'react';

import type { FormattedDonation, Total } from '@gdq/types/tracker';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { useListenForFn } from '@gdq/lib/hooks/useListenForFn';

import type { ChannelProps } from '..';
import { registerChannel } from '..';

import styled from '@emotion/styled';
import { useReplicant } from 'use-nodecg';

import foreground from './Foreground.png';
import background from './Background.png';
import difficulty from './Difficulty.png';
import totalLeft from './total/Left.png';
import totalMiddle from './total/Middle.png';
import totalRight from './total/Right.png';
import commandoWalking from './commando/Walking.webp';
import commandoShooting from './commando/Shooting.webp';
import bighornBison from './enemies/BighornBison.webp';
import blackImp from './enemies/BlackImp.webp';
import greaterWisp from './enemies/GreaterWisp.webp';
import sandCrab from './enemies/SandCrab.webp';
import wisp from './enemies/Wisp.webp';
import bars from './Bars.png';

import { EnemyData, EnemyElementProps, EnemyView } from './enemy';
import { calculateHPFromDonation } from './utilities';

const layoutQuery = new URLSearchParams(window.location.search);
const has = layoutQuery.has('layout');

registerChannel('Risk of Rain', 90, RoR, {
	position: 'topLeft',
	site: 'GitHub',
	handle: 'ViMaSter',
});

const riskOfRainEnemyList = nodecg.Replicant<string | null>('risk-of-rain', {
	defaultValue: '{}',
});

const availableEnemies: { [key: string]: EnemyData } = {
	BighornBison: { color: '#715f9a', image: bighornBison },
	BlackImp: { color: '#715f9a', image: blackImp },
	GreaterWisp: { color: '#c5b894', image: greaterWisp },
	SandCrab: { color: '#c5b894', image: sandCrab },
	Wisp: { color: '#d9d6da', image: wisp },
};
const pickRandomEnemy = () => Object.entries(availableEnemies)[Math.floor(Math.random() * Object.entries(availableEnemies).length)];

type EnemyElementList = { [key: string]: EnemyElementProps };

export function RoR(_: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);

	const enemyContainerRef = useRef<HTMLDivElement>(null);
	const commandoRef = useRef<HTMLDivElement>(null);
	const foregroundRef = useRef<HTMLDivElement>(null);

	let [forcedRefresh, updateForcedRefresh] = useState(false);

	let backgroundScroll = useRef(0);
	let scrollInterval = useRef<NodeJS.Timeout | null>(null);

	// --- DONATION HANDLING
	const nextSpawnAt = useRef(0);
	useListenForFn('donation', (donation: FormattedDonation) => {
		const thisSpawnAt = nextSpawnAt.current+1;
		nextSpawnAt.current = Math.max(thisSpawnAt, Date.now()) + 1000;
		setTimeout(() => {
			spawnRandomEnemy(donation.rawAmount);
			updateForcedRefresh((oldStatus) => !oldStatus);
		}, Math.max(1, thisSpawnAt - Date.now()));
	});

	let nextEnemyID = useRef(0);
	const spawnRandomEnemy = (donationValue: number) => {
		const id = (++nextEnemyID.current).toString();
		const enemyData = pickRandomEnemy();

		const spawnedAt = Date.now();

		setTimeout(() => {
			defeatEnemy(id);
		}, calculateHPFromDonation(donationValue));

		let enemyList = JSON.parse(riskOfRainEnemyList.value ?? '{}') as EnemyElementList;
		enemyList = {
			...enemyList,
			[id]: {
				key: Number(id),
				id,
				donationValue,
				spawnedAt,
				enemyData: enemyData[1],
			},
		};

		if (has) return;
		riskOfRainEnemyList.value = JSON.stringify(enemyList);

		return id;
	};
	const defeatEnemy = (id: string) => {
		let enemyList = JSON.parse(riskOfRainEnemyList.value ?? '{}') as EnemyElementList;
		delete enemyList![id];

		if (has) return;
		riskOfRainEnemyList.value = JSON.stringify(enemyList);
		updateForcedRefresh((oldStatus) => !oldStatus);
	};
	// --- DONATION HANDLING

	// --- STATES
	// if no donations are left to process
	const setWalking = () => {
		clearInterval(scrollInterval.current!);

		commandoRef.current!.style.backgroundImage = `url(${commandoWalking})`;
		enemyContainerRef.current!.innerHTML = '';
		scrollInterval.current = setInterval(() => {
			backgroundScroll.current += 0.75;
			if (backgroundScroll.current > 1718) {
				backgroundScroll.current = 0;
			}
			foregroundRef.current!.style.backgroundPositionX = -backgroundScroll.current + 'px';
		}, 10);
	};

	// if donations are being processed (represented by the commando shooting enemies)
	const setShooting = () => {
		clearInterval(scrollInterval.current!);

		commandoRef.current!.style.backgroundImage = `url(${commandoShooting})`;
	};

	// switch between walking and shooting depending on the state of the enemy list
	useEffect(() => {
		const enemyList = JSON.parse(riskOfRainEnemyList.value ?? '{}') as EnemyElementList;
		if (enemyList && Object.keys(enemyList).length !== 0) {
			setShooting();
			return;
		}
		setWalking();
	}, [riskOfRainEnemyList.value, forcedRefresh]);

	// start walking after channel is initialized
	useEffect(() => {
		if (!enemyContainerRef.current) {
			return;
		}
		if (!commandoRef.current) {
			return;
		}
		if (!foregroundRef.current) {
			return;
		}
		setWalking();
	}, [enemyContainerRef, commandoRef, foregroundRef]);
	// --- STATES

	return (
		<Container>
			<Background />
			<Foreground ref={foregroundRef} />
			<Commando ref={commandoRef} />
			<EnemyContainer ref={enemyContainerRef}>
				{riskOfRainEnemyList.value &&
					Object.values(JSON.parse(riskOfRainEnemyList.value) as EnemyElementList).map((enemy) => {
						return (
							<EnemyView
								key={enemy.key}
								id={enemy.id}
								donationValue={enemy.donationValue}
								spawnedAt={enemy.spawnedAt}
								enemyData={enemy.enemyData}
							/>
						);
					})}
			</EnemyContainer>
			<Difficulty>
				<Total>
					<TotalDifficulty />
					<TotalLeft />
					<TotalMiddle>
						$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
					</TotalMiddle>
					<TotalRight />
				</Total>
				<Bars />
			</Difficulty>
			<TotalText />
		</Container>
	);
}

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
`;

const Difficulty = styled.div`
	position: absolute;
	right: 7px;
	top: 9px;

	display: flex;
	flex-direction: column;
	align-items: flex-end;

	text-align: right;
`;

const Total = styled.div`
	position: relative;
	height: 42px;
	width: 100%;
	display: flex;
	justify-content: flex-end;
`;

const TotalDifficulty = styled.div`
	background-image: url('${difficulty}');
	width: 48px;
	height: 100%;
`;

const TotalLeft = styled.div`
	background-image: url('${totalLeft}');
	width: 8px;
	height: 100%;
`;

const TotalMiddle = styled.div`
	background-image: url('${totalMiddle}');
	background-repeat: repeat no-repeat;
	height: 100%;
	color: #c0c0c0;

	font-size: 20px;
	font-family: gdqpixel;
	padding-top: 10px;
	padding-left: 10px;
`;

const TotalRight = styled.div`
	background-image: url('${totalRight}');
	width: 20px;
	height: 100%;
`;

const Bars = styled.div`
	position: relative;
	right: 0;
	background-image: url('${bars}');
	height: 162px;
	width: 146px;
`;

const Foreground = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 3436px;
	height: 333px;
	background-image: url('${foreground}');
	background-repeat: repeat-x;
`;

const Background = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 1092px;
	height: 332px;

	background-image: url('${background}');
`;

const Commando = styled.div`
	position: absolute;
	top: 282px;
	left: 140px;
	width: 50px;
	height: 22px;
	background-repeat: no-repeat;
	background-position: 0% 0%;
`;

const EnemyContainer = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 304px;
	display: flex;
	justify-content: flex-end;
	align-items: flex-end;
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
