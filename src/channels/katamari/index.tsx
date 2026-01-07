import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import { useEffect, useState, useRef } from 'react';
import { useListenFor, useReplicant } from 'use-nodecg';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { CurrencyToAbbreviation } from 'currency-to-abbreviation';

import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';

import { useRafLoop } from 'react-use';
import { Container, TotalEl, KatamariTracker, GoalAmount, KatamariBall } from './components';

// Sprites
import princeSheet from './assets/sprites/prince.png';
import { GridSprite } from './sprites';

// Backgrounds
// Nature 2
import nature2_1 from './assets/landscapes/nature_2/1.png';
import nature2_2 from './assets/landscapes/nature_2/2.png';
import nature2_3 from './assets/landscapes/nature_2/3.png';
import nature2_4 from './assets/landscapes/nature_2/4.png';
// Nature 5
import nature5_1 from './assets/landscapes/nature_5/1.png';
import nature5_2 from './assets/landscapes/nature_5/2.png';
import nature5_3 from './assets/landscapes/nature_5/3.png';
import nature5_4 from './assets/landscapes/nature_5/4.png';
// Nature 6
import nature6_1 from './assets/landscapes/nature_6/1.png';
import nature6_2 from './assets/landscapes/nature_6/2.png';
import nature6_3 from './assets/landscapes/nature_6/3.png';
// City 1
import city1_1 from './assets/landscapes/city_1/1.png';
import city1_2 from './assets/landscapes/city_1/2.png';
import city1_3 from './assets/landscapes/city_1/3.png';
import city1_4 from './assets/landscapes/city_1/4.png';
import city1_5 from './assets/landscapes/city_1/5.png';
// City 5
import city5_1 from './assets/landscapes/city_5/1.png';
import city5_2 from './assets/landscapes/city_5/2.png';
import city5_3 from './assets/landscapes/city_5/3.png';
import city5_4 from './assets/landscapes/city_5/4.png';
import city5_5 from './assets/landscapes/city_5/5.png';
// City 6
import city6_1 from './assets/landscapes/city_6/1.png';
import city6_2 from './assets/landscapes/city_6/2.png';
import city6_3 from './assets/landscapes/city_6/3.png';
import city6_4 from './assets/landscapes/city_6/4.png';
import city6_5 from './assets/landscapes/city_6/5.png';
import city6_6 from './assets/landscapes/city_6/6.png';
// City 7
import city7_1 from './assets/landscapes/city_7/1.png';
import city7_2 from './assets/landscapes/city_7/2.png';
import city7_3 from './assets/landscapes/city_7/3.png';
import city7_4 from './assets/landscapes/city_7/4.png';
import city7_5 from './assets/landscapes/city_7/5.png';
// Future City 1
import futurecity1_1 from './assets/landscapes/futurecity_1/1.png';
import futurecity1_2 from './assets/landscapes/futurecity_1/2.png';
import futurecity1_3 from './assets/landscapes/futurecity_1/3.png';
import futurecity1_4 from './assets/landscapes/futurecity_1/4.png';
import futurecity1_5 from './assets/landscapes/futurecity_1/5.png';
import futurecity1_6 from './assets/landscapes/futurecity_1/6.png';
import futurecity1_7 from './assets/landscapes/futurecity_1/8.png';
import futurecity1_8 from './assets/landscapes/futurecity_1/9.png';
import futurecity1_9 from './assets/landscapes/futurecity_1/10.png';
// Future City 3
import futurecity3_1 from './assets/landscapes/futurecity_3/1.png';
import futurecity3_2 from './assets/landscapes/futurecity_3/2.png';
import futurecity3_3 from './assets/landscapes/futurecity_3/3.png';
import futurecity3_4 from './assets/landscapes/futurecity_3/4.png';
import futurecity3_5 from './assets/landscapes/futurecity_3/5.png';
import futurecity3_6 from './assets/landscapes/futurecity_3/6.png';
import futurecity3_7 from './assets/landscapes/futurecity_3/7.png';
import futurecity3_8 from './assets/landscapes/futurecity_3/8.png';
// Future City 4
import futurecity4_1 from './assets/landscapes/futurecity_4/1.png';
import futurecity4_2 from './assets/landscapes/futurecity_4/2.png';
import futurecity4_3 from './assets/landscapes/futurecity_4/3.png';
import futurecity4_4 from './assets/landscapes/futurecity_4/4.png';
import futurecity4_5 from './assets/landscapes/futurecity_4/5.png';
import futurecity4_6 from './assets/landscapes/futurecity_4/6.png';
import futurecity4_7 from './assets/landscapes/futurecity_4/7.png';
import futurecity4_8 from './assets/landscapes/futurecity_4/8.png';
import futurecity4_9 from './assets/landscapes/futurecity_4/9.png';

import { ParallaxBackground, BackgroundPreset } from './backgrounds';

const presets: BackgroundPreset[] = [
	{
		id: 'nature_2',
		layers: [
			{ src: nature2_1, speedSec: 60, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: nature2_2, speedSec: 28, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: nature2_3, speedSec: 18, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: nature2_4, speedSec: 5, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
		],
	},
	{
		id: 'nature_5',
		layers: [
			{ src: nature5_1, speedSec: 60, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: nature5_2, speedSec: 28, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: nature5_3, speedSec: 18, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: nature5_4, speedSec: 5, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
		],
	},
	{
		id: 'nature_6',
		layers: [
			{ src: nature6_1, speedSec: 60, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{
				src: nature6_2,
				blendMode: 'overlay',
				speedSec: 18,
				size: '576px 100%',
				repeat: 'repeat-x',
				distancePx: 576,
			},
			{ src: nature6_3, speedSec: 5, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
		],
	},
	{
		id: 'city_1',
		layers: [
			{ src: city1_1, speedSec: 60, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city1_2, speedSec: 48, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city1_3, speedSec: 28, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city1_4, speedSec: 18, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city1_5, speedSec: 5, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
		],
	},
	{
		id: 'city_5',
		layers: [
			{ src: city5_1, speedSec: 60, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city5_2, speedSec: 48, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city5_3, speedSec: 28, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city5_4, speedSec: 18, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city5_5, speedSec: 5, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
		],
	},
	{
		id: 'city_6',
		layers: [
			{ src: city6_1, speedSec: 60, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city6_2, speedSec: 48, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city6_3, speedSec: 32, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city6_4, speedSec: 26, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city6_5, speedSec: 18, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city6_6, speedSec: 5, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
		],
	},
	{
		id: 'city_7',
		layers: [
			{ src: city7_1, speedSec: 60, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city7_2, speedSec: 48, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city7_3, speedSec: 28, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city7_4, speedSec: 18, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: city7_5, speedSec: 5, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
		],
	},
	{
		id: 'futurecity_1',
		layers: [
			{ src: futurecity1_1, speedSec: 68, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity1_2, speedSec: 60, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity1_3, speedSec: 48, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity1_4, speedSec: 32, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity1_5, speedSec: 26, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity1_6, speedSec: 18, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity1_7, speedSec: 12, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity1_8, speedSec: 10, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity1_9, speedSec: 5, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
		],
	},
	{
		id: 'futurecity_3',
		layers: [
			{ src: futurecity3_1, speedSec: 68, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity3_2, speedSec: 60, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity3_3, speedSec: 48, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity3_4, speedSec: 26, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity3_5, speedSec: 18, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity3_6, speedSec: 12, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity3_7, speedSec: 10, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity3_8, speedSec: 5, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
		],
	},
	{
		id: 'futurecity_4',
		layers: [
			{ src: futurecity4_1, speedSec: 80, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity4_2, speedSec: 60, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity4_3, speedSec: 48, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity4_4, speedSec: 32, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity4_5, speedSec: 26, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity4_6, speedSec: 18, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity4_7, speedSec: 12, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity4_8, speedSec: 10, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
			{ src: futurecity4_9, speedSec: 5, size: '576px 100%', repeat: 'repeat-x', distancePx: 576 },
		],
	},
];

registerChannel('Katamari', 1438, Katamari, {
	position: 'bottomRight',
	site: 'GitHub',
	handle: 'michaelgnslvs',
});

type KatamariObject = {
	reason: string;
	amount: string;
};

function clamp01(n: number) {
	return Math.max(0, Math.min(1, n));
}

function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}

export function Katamari(props: ChannelProps) {
	const [event] = usePreloadedReplicant<Event>('currentEvent');
	const [total] = useReplicant<Total | null>('total', null);

	// Refs?

	// Totals
	const totalRaw = total ? total.raw : 0;
	const [animationPlaying, setAnimationPlaying] = useState(false);

	// Rolled Object
	const [citation, setCitation] = useState<KatamariObject | undefined>(undefined);
	const [pendingEvents, setPendingEvents] = useState<FormattedDonation[]>([]);
	// const generateRandomCountry = () => {
	// 	return countries[Math.floor(Math.random() * countries.length)];
	// };
	// const [currentCountry, setCurrentCountry] = useState<Country>(generateRandomCountry);

	// Displayed goal amount (locked)
	function formatGoalAmount(target: number) {
		const floorDivisor = Math.pow(10, Math.floor(Math.log10(target) - 2));
		const flooredTarget = Math.floor(target / floorDivisor) * floorDivisor;

		return CurrencyToAbbreviation({
			inputNumber: flooredTarget,
			inputLocale: 'en-US',
			decimalPlacesToRound: 2,
		});
	}

	const [goalProgress, setGoalProgress] = useState(totalRaw);
	const goalStep = 1000;
	const goalTarget = (Math.floor(goalProgress / goalStep) + 1) * goalStep;
	const goalAmount = formatGoalAmount(goalTarget);
	const [goalAmountLocked, setAmountLocked] = useState(goalAmount);

	// Scaling
	const [flowerScale, setFlowerScale] = useState(0.001);
	const currentScaleRef = useRef(0.001);
	const targetScaleRef = useRef(0.001);

	const intervalStart = goalTarget - goalStep;
	const gainedSinceStart = totalRaw - intervalStart;
	const minScale = 0.5;
	const targetScale = minScale + (1 - minScale) * clamp01(gainedSinceStart / goalStep);

	// Reset katamari -> appear()
	const appear = () => {
		setAmountLocked(goalAmount);
		setAnimationPlaying(true);

		// Restart animations
		// stampRef.current?.classList.remove('showStamp');
		// personRef.current?.classList.remove('personLeave');
		// if (passportRef.current) {
		// 	passportRef.current?.classList.remove('passportInnerMoveDown');
		// 	passportRef.current?.classList.add('passportInnerMoveIn');
		// 	passportRef.current.style.animation = 'none';
		// 	passportRef.current?.offsetHeight; /* trigger reflow */
		// 	passportRef.current.style.removeProperty('animation');
		// }
		// stampperRef.current?.classList.remove('stamperStamp');
		// if (passportOuterRef.current) {
		// 	passportOuterRef.current.style.animation = 'none';
		// 	passportOuterRef.current?.offsetHeight; /* trigger reflow */
		// 	passportOuterRef.current.style.removeProperty('animation');
		// 	passportOuterRef.current.classList.add('passportOuterMoveAround');
		// }
		// if (personRef.current) {
		// 	personRef.current.style.animation = 'none';
		// 	personRef.current?.offsetHeight; /* trigger reflow */
		// 	personRef.current.style.removeProperty('animation');
		// 	personRef.current?.classList.add('personAppear');
		// }
		setTimeout(() => {
			setAnimationPlaying(false);
		}, 5000);
	};

	// Hit the goal
	const goal = () => {
		setAmountLocked(goalAmount);
		// Update animation classes
		// personRef.current?.classList.remove('personAppear');
		// personRef.current?.classList.add('personLeave');
		// passportRef.current?.classList.remove('passportInnerMoveIn');
		// passportRef.current?.classList.add('passportInnerMoveDown');
		// stampperRef.current?.classList.add('stamperStamp');
		// stampRef.current?.classList.add('showStamp');
		// Restart gif, do once animation of stamp is open
		setTimeout(() => {
			// if (stampAnimationRef.current) {
			// 	stampAnimationRef.current.src = '';
			// 	stampAnimationRef.current.src = stampAnimation;
			// }
		}, 3200);
		setTimeout(() => {
			setAnimationPlaying(false);
		}, 11000);
	};

	const katamariEvent = (donation: FormattedDonation) => {
		// const citationObj: Citation = {
		// 	reason: generateRandomCitation(),
		// 	amount: donation.amount,
		// };
		// setCitation(citationObj);
		// if (citationRef.current) {
		// 	citationRef.current.style.animation = 'none';
		// 	citationRef.current.offsetHeight; /* trigger reflow */
		// 	citationRef.current.style.removeProperty('animation');
		// 	citationRef.current.classList.add('citationAnimation');
		// }
		setTimeout(() => {
			setCitation(undefined);
		}, 4000);
		// alert('Got Dono');
	};

	useRafLoop(() => {
		// Tween the flower scaling smoothly toward the latest target
		const speed = 0.12;
		const cur = currentScaleRef.current;
		const next = lerp(cur, targetScaleRef.current, speed);
		currentScaleRef.current = next;

		if (Math.abs(next - flowerScale) > 0.0005) {
			setFlowerScale(next);
		}

		// Process pending donation events
		if (!animationPlaying && citation == undefined) {
			if (pendingEvents.length > 0) {
				katamariEvent(pendingEvents[0]);
				const ev: FormattedDonation[] = [...pendingEvents];
				ev.splice(0, 1);
				setPendingEvents(ev);
			}
		}
	});

	useListenFor('donation', (donation: FormattedDonation) => {
		/**
		 * Respond to a donation.
		 */
		const ev: FormattedDonation[] = [...pendingEvents];
		ev.push(donation);
		setPendingEvents(ev);
	});

	// Initial appear sequence
	useEffect(() => {
		setAmountLocked(goalAmount);
		setAnimationPlaying(true);
		setTimeout(() => {
			appear();
		}, 2000);
	}, []);

	useEffect(() => {
		targetScaleRef.current = Math.max(0.001, targetScale);
	}, [targetScale]);

	// Keep goal display locked to the latest computed goal text
	useEffect(() => {
		setAmountLocked(goalAmount);
	}, [goalTarget]);

	useEffect(() => {
		if ((total?.raw ?? 0) >= goalTarget) {
			setGoalProgress(total?.raw ?? 0);

			if (!animationPlaying) {
				setAnimationPlaying(true);
				// TRIGGER GOAL ANIMATIONS
				goal();
				// TRIGGER START AGAIN
				setTimeout(() => {
					// let country: Country = generateRandomCountry();
					// Roll until unique
					// while (country.id == currentCountry.id) {
					// 	country = generateRandomCountry();
					// }
					// setCurrentCountry(country);
					appear();
				}, 11200);
			}
		}
	}, [total?.raw, goalTarget, animationPlaying]);

	return (
		<Container>
			<ParallaxBackground
				backgrounds={presets}
				// selectedIndex={(ps) => ps[Math.floor(Math.random() * ps.length)]}
				selectedIndex={5}
			/>
			<GridSprite
				src={princeSheet}
				tileWidth={32}
				tileHeight={36}
				columns={8}
				rows={1}
				fps={12}
				scale={3}
				xOffset={300}
				yOffset={230}
			/>
			<KatamariBall size={250} xOffset={350} yOffset={140} />
			<KatamariTracker size={360} xOffset={-100} yOffset={-125} scale={flowerScale}>
				<TotalEl>
					$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
				</TotalEl>
				<GoalAmount>{goalAmountLocked}</GoalAmount>
			</KatamariTracker>
		</Container>
	);
}
