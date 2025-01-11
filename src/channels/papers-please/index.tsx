import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import { useState, useEffect, useRef } from 'react';
import { useListenFor, useReplicant } from 'use-nodecg';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { CurrencyToAbbreviation } from 'currency-to-abbreviation';

import './main.css';

import foreground from './assets/Foreground.png';
import background from './assets/Background.png';
import stampAnimation from './assets/StampAnimationNB.gif';
import goalStamp from './assets/StampTotalRaised.png';
import citationImg from './assets/CitationInner.png';

import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';

import { countries, Country } from './countries';
import { useRafLoop } from 'react-use';
import {
	Container,
	FullWidthImage,
	CitationContainer,
	CitationText,
	GoalStamp,
	GoalAmount,
	Stampper,
	Person,
	Passport,
	TotalEl,
	PassportOuterImage,
	SupplementaryText,
	Foreground,
	Background,
} from './components';

registerChannel('Papers Please', 82, PapersPlease, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'StoneMoney',
});

type Citation = {
	reason: string;
	amount: string;
};

const citationTexts: string[] = [
	'V.A.C. Banned',
	'Saved the Animals',
	'Killed the Animals',
	'Cobrastan is not a real country',
	'Unleashed swarm of airboats',
	'Made a bad pun',
	'Wall clipped outside of reality',
	'Not HYPE enough',
	'Too HYPE',
	'Failure to contain the Goose',
	'Incorrectly parked airboat',
	'This has never happened before',
	'Invalid Passport',
	'Citation Needed',
	'OOOOOOOORB',
	'Snake... Snake? SNAAAAKE!',
	'Changed channel too quickly',
	'Did you know about Prime Gaming?',
	'Sequence Breaking',
	'Dropped your combo',
	'Didn\'t say "Yes Chef".',
	'Weeeeeeeeeeeeeeeeee!',
	'BINGO!'
];

export function PapersPlease(props: ChannelProps) {
	const [event] = usePreloadedReplicant<Event>('currentEvent');
	const [total] = useReplicant<Total | null>('total', null);
	// Refs
	const passportRef = useRef<HTMLImageElement>(null);
	const passportOuterRef = useRef<HTMLImageElement>(null);
	const stampperRef = useRef<HTMLSpanElement>(null);
	const stampAnimationRef = useRef<HTMLImageElement>(null);
	const stampRef = useRef<HTMLDivElement>(null);
	const personRef = useRef<HTMLImageElement>(null);
	const citationRef = useRef<HTMLDivElement>(null);

	// Country
	const generateRandomCountry = () => {
		return countries[Math.floor(Math.random() * countries.length)];
	};
	const [currentCountry, setCurrentCountry] = useState<Country>(generateRandomCountry);

	// Total based things
	const totalRaw = total ? total.raw : 0;
	const [animationPlaying, setAnimationPlaying] = useState(false);
	const [goalProgress, setGoalProgress] = useState(totalRaw);
	const goalTarget = (Math.floor(goalProgress / 1000) + 1) * 1000;

	const floorDivisor = Math.pow(10, Math.floor(Math.log10(goalTarget) - 2));
	const flooredTarget = Math.floor(goalTarget / floorDivisor) * floorDivisor;

	const goalAmount = CurrencyToAbbreviation({
		inputNumber: flooredTarget,
		inputLocale: 'en-US',
		decimalPlacesToRound: 2,
	});
	const [goalAmountLocked, setAmountLocked] = useState(goalAmount);

	// Citations
	const [citation, setCitation] = useState<Citation | undefined>(undefined);
	const [pendingEvents, setPendingEvents] = useState<FormattedDonation[]>([]);
	const generateRandomCitation = () => {
		return citationTexts[Math.floor(Math.random() * citationTexts.length)];
	};

	const appear = () => {
		setAmountLocked(goalAmount);
		setAnimationPlaying(true);
		// Restart animations
		stampRef.current?.classList.remove('showStamp');
		personRef.current?.classList.remove('personLeave');
		if (passportRef.current) {
			passportRef.current?.classList.remove('passportInnerMoveDown');
			passportRef.current?.classList.add('passportInnerMoveIn');
			passportRef.current.style.animation = 'none';
			passportRef.current?.offsetHeight; /* trigger reflow */
			passportRef.current.style.removeProperty('animation');
		}
		stampperRef.current?.classList.remove('stamperStamp');
		if (passportOuterRef.current) {
			passportOuterRef.current.style.animation = 'none';
			passportOuterRef.current?.offsetHeight; /* trigger reflow */
			passportOuterRef.current.style.removeProperty('animation');
			passportOuterRef.current.classList.add('passportOuterMoveAround');
		}
		if (personRef.current) {
			personRef.current.style.animation = 'none';
			personRef.current?.offsetHeight; /* trigger reflow */
			personRef.current.style.removeProperty('animation');
			personRef.current?.classList.add('personAppear');
		}
		setTimeout(() => {
			setAnimationPlaying(false);
		}, 5000);
	};

	const goal = () => {
		setAmountLocked(goalAmount);
		// Update animation classes
		personRef.current?.classList.remove('personAppear');
		personRef.current?.classList.add('personLeave');
		passportRef.current?.classList.remove('passportInnerMoveIn');
		passportRef.current?.classList.add('passportInnerMoveDown');
		stampperRef.current?.classList.add('stamperStamp');
		stampRef.current?.classList.add('showStamp');
		// Restart gif, do once animation of stamp is open
		setTimeout(() => {
			if (stampAnimationRef.current) {
				stampAnimationRef.current.src = '';
				stampAnimationRef.current.src = stampAnimation;
			}
		}, 3200);
		setTimeout(() => {
			setAnimationPlaying(false);
		}, 11000);
	};

	const citationEvent = (donation: FormattedDonation) => {
		const citationObj: Citation = {
			reason: generateRandomCitation(),
			amount: donation.amount,
		};
		setCitation(citationObj);
		if (citationRef.current) {
			citationRef.current.style.animation = 'none';
			citationRef.current.offsetHeight; /* trigger reflow */
			citationRef.current.style.removeProperty('animation');
			citationRef.current.classList.add('citationAnimation');
		}
		setTimeout(() => {
			setCitation(undefined);
		}, 4000);
	};

	useRafLoop(() => {
		if (!animationPlaying && citation == undefined) {
			if (pendingEvents.length > 0) {
				citationEvent(pendingEvents[0]);
				const ev: FormattedDonation[] = [...pendingEvents];
				ev.splice(0, 1);
				setPendingEvents(ev);
			}
		}
	});

	useListenFor('donation', (donation: FormattedDonation) => {
		const ev: FormattedDonation[] = [...pendingEvents];
		ev.push(donation);
		setPendingEvents(ev);
	});

	useEffect(() => {
		setAmountLocked(goalAmount);
		setAnimationPlaying(true);
		setTimeout(() => {
			appear();
		}, 2000);
	}, []);

	useEffect(() => {
		if ((total?.raw ?? 0) >= goalTarget) {
			setGoalProgress(total?.raw ?? 0);
			if (!animationPlaying) {
				setAnimationPlaying(true);
				// TRIGGER GOAL ANIMATIONS
				goal();
				// TRIGGER START AGAIN
				setTimeout(() => {
					let country: Country = generateRandomCountry();
					// Roll until unique
					while (country.id == currentCountry.id) {
						country = generateRandomCountry();
					}
					setCurrentCountry(country);
					appear();
				}, 11200);
			}
		}
	}, [total?.raw]);

	useEffect(() => {
		if (animationPlaying) {
			citationRef.current?.classList.add('hidden');
		} else {
			citationRef.current?.classList.remove('hidden');
		}
	}, [animationPlaying]);

	return (
		<Container>
			<CitationContainer ref={citationRef}>
				<FullWidthImage src={citationImg} />
				<CitationText>
					<div>{citation?.reason ?? 'No Reason Given'}</div>
					<div>-----</div>
					<div>
						FINE: {citation?.amount ?? '$$$'} to {event.beneficiary}
					</div>
				</CitationText>
			</CitationContainer>
			<Stampper ref={stampperRef}>
				<FullWidthImage ref={stampAnimationRef} src={stampAnimation} />
			</Stampper>
			<Passport ref={passportRef}>
				<GoalStamp ref={stampRef}>
					<FullWidthImage src={goalStamp} />
					<GoalAmount>{goalAmountLocked}</GoalAmount>
				</GoalStamp>
				<TotalEl style={{ ...currentCountry.totalTextLocation }}>
					$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
				</TotalEl>
				<SupplementaryText style={{ ...currentCountry.supplementTextLocation }}>
					<div>{goalAmount}</div>
					{/*
					 * GDQ shortnames are typically 8 characters, except for Frame Fatales events.
					 * Since FF events extend beyond the bounds, but shortname still needs the year,
					 * we truncate the shortname to 12 characters to omit the year in this case.
					 *
					 * This should be looked at again in the future to see if there's a better solution.
					*/}
					<div>{event.shortname.slice(0, 12)}</div>
					<div>{event.beneficiaryShort}</div>
					<div>2025/01/11 {/* TEMP DATE! Should add this to the event obj */}</div>
				</SupplementaryText>
				<FullWidthImage src={currentCountry.passportInner} />
			</Passport>
			<Foreground src={foreground} />
			<Person ref={personRef} src={currentCountry.person} className="person" />
			<PassportOuterImage ref={passportOuterRef} src={currentCountry.passportOuter} />
			<Background src={background} />
		</Container>
	);
}
