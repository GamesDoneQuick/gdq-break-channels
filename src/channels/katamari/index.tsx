import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import { useEffect, useState, useRef } from 'react';
import { useListenFor, useReplicant } from 'use-nodecg';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { CurrencyToAbbreviation } from 'currency-to-abbreviation';

import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';

import { useRafLoop } from 'react-use';
import { Container, TotalEl, KatamariTracker, GoalAmount } from './components';

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
	const targetScale = clamp01(gainedSinceStart / goalStep);

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
			<KatamariTracker size={360} xOffset={-100} yOffset={-125} scale={flowerScale}>
				<TotalEl>
					$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
				</TotalEl>
				<GoalAmount>{goalAmountLocked}</GoalAmount>
			</KatamariTracker>
		</Container>
	);
}
