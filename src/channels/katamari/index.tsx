import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import { useEffect, useState, useRef } from 'react';
import { useListenFor, useReplicant } from 'use-nodecg';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { CurrencyToAbbreviation } from 'currency-to-abbreviation';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';
import { useRafLoop } from 'react-use';

import { Container, TotalEl, KatamariTracker, GoalAmount, KatamariBall } from './components';
import { GridSprite } from './sprites';
import { ParallaxBackground, BackgroundScene } from './backgrounds';
import { DonationFlyers, Flyer, Stuck } from './donationFlyers';
import { clamp01, lerp } from '@gdq/channels/katamari/utilities';

// Spritesheets
import princeSheet from './assets/sprites/prince.png';

// Backgrounds
import nature2_1 from './assets/landscapes/nature_2/1.png';
import nature2_2 from './assets/landscapes/nature_2/2.png';
import nature2_3 from './assets/landscapes/nature_2/3.png';
import nature2_4 from './assets/landscapes/nature_2/4.png';
import nature5_1 from './assets/landscapes/nature_5/1.png';
import nature5_2 from './assets/landscapes/nature_5/2.png';
import nature5_3 from './assets/landscapes/nature_5/3.png';
import nature5_4 from './assets/landscapes/nature_5/4.png';
import nature6_1 from './assets/landscapes/nature_6/1.png';
import nature6_2 from './assets/landscapes/nature_6/2.png';
import nature6_3 from './assets/landscapes/nature_6/3.png';
import city1_1 from './assets/landscapes/city_1/1.png';
import city1_2 from './assets/landscapes/city_1/2.png';
import city1_3 from './assets/landscapes/city_1/3.png';
import city1_4 from './assets/landscapes/city_1/4.png';
import city1_5 from './assets/landscapes/city_1/5.png';
import city5_1 from './assets/landscapes/city_5/1.png';
import city5_2 from './assets/landscapes/city_5/2.png';
import city5_3 from './assets/landscapes/city_5/3.png';
import city5_4 from './assets/landscapes/city_5/4.png';
import city5_5 from './assets/landscapes/city_5/5.png';
import city6_1 from './assets/landscapes/city_6/1.png';
import city6_2 from './assets/landscapes/city_6/2.png';
import city6_3 from './assets/landscapes/city_6/3.png';
import city6_4 from './assets/landscapes/city_6/4.png';
import city6_5 from './assets/landscapes/city_6/5.png';
import city6_6 from './assets/landscapes/city_6/6.png';
import city7_1 from './assets/landscapes/city_7/1.png';
import city7_2 from './assets/landscapes/city_7/2.png';
import city7_3 from './assets/landscapes/city_7/3.png';
import city7_4 from './assets/landscapes/city_7/4.png';
import city7_5 from './assets/landscapes/city_7/5.png';
import futurecity1_1 from './assets/landscapes/futurecity_1/1.png';
import futurecity1_2 from './assets/landscapes/futurecity_1/2.png';
import futurecity1_3 from './assets/landscapes/futurecity_1/3.png';
import futurecity1_4 from './assets/landscapes/futurecity_1/4.png';
import futurecity1_5 from './assets/landscapes/futurecity_1/5.png';
import futurecity1_6 from './assets/landscapes/futurecity_1/6.png';
import futurecity1_7 from './assets/landscapes/futurecity_1/8.png';
import futurecity1_8 from './assets/landscapes/futurecity_1/9.png';
import futurecity1_9 from './assets/landscapes/futurecity_1/10.png';
import futurecity3_1 from './assets/landscapes/futurecity_3/1.png';
import futurecity3_2 from './assets/landscapes/futurecity_3/2.png';
import futurecity3_3 from './assets/landscapes/futurecity_3/3.png';
import futurecity3_4 from './assets/landscapes/futurecity_3/4.png';
import futurecity3_5 from './assets/landscapes/futurecity_3/5.png';
import futurecity3_6 from './assets/landscapes/futurecity_3/6.png';
import futurecity3_7 from './assets/landscapes/futurecity_3/7.png';
import futurecity3_8 from './assets/landscapes/futurecity_3/8.png';
import futurecity4_1 from './assets/landscapes/futurecity_4/1.png';
import futurecity4_2 from './assets/landscapes/futurecity_4/2.png';
import futurecity4_3 from './assets/landscapes/futurecity_4/3.png';
import futurecity4_4 from './assets/landscapes/futurecity_4/4.png';
import futurecity4_5 from './assets/landscapes/futurecity_4/5.png';
import futurecity4_6 from './assets/landscapes/futurecity_4/6.png';
import futurecity4_7 from './assets/landscapes/futurecity_4/7.png';
import futurecity4_8 from './assets/landscapes/futurecity_4/8.png';
import futurecity4_9 from './assets/landscapes/futurecity_4/9.png';
const bgPool: BackgroundScene[] = [
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

// Donation flyers
import obj1 from './assets/sprites/objects/animal_ant.png';
import obj2 from './assets/sprites/objects/animal_bigBear.png';
import obj3 from './assets/sprites/objects/animal_crocodile.png';
import obj4 from './assets/sprites/objects/animal_cuteCow.png';
import obj5 from './assets/sprites/objects/animal_dairyCow.png';
import obj6 from './assets/sprites/objects/animal_giantOctopus.png';
import obj7 from './assets/sprites/objects/animal_giantSquid.png';
import obj8 from './assets/sprites/objects/animal_giraffe.png';
import obj9 from './assets/sprites/objects/animal_kintaroBear.png';
import obj10 from './assets/sprites/objects/animal_mammoth.png';
import obj11 from './assets/sprites/objects/animal_mogran.png';
import obj12 from './assets/sprites/objects/animal_mosquito.png';
import obj13 from './assets/sprites/objects/animal_mysteryCreature.png';
import obj14 from './assets/sprites/objects/animal_polarBear.png';
import obj15 from './assets/sprites/objects/animal_seaTurtle.png';
import obj16 from './assets/sprites/objects/animal_sheep.png';
import obj17 from './assets/sprites/objects/animal_spermWhale.png';
import obj18 from './assets/sprites/objects/animal_swordfish.png';
import obj19 from './assets/sprites/objects/building_breamBuilding.png';
import obj20 from './assets/sprites/objects/building_kelpFactory.png';
import obj21 from './assets/sprites/objects/building_logCabin.png';
import obj22 from './assets/sprites/objects/building_stingrayBuilding.png';
import obj23 from './assets/sprites/objects/cat_black.png';
import obj24 from './assets/sprites/objects/cat_calico.png';
import obj25 from './assets/sprites/objects/cat_lucky.png';
import obj26 from './assets/sprites/objects/cat_siamese.png';
import obj27 from './assets/sprites/objects/cat_tabby.png';
import obj28 from './assets/sprites/objects/cousin_ace.png';
import obj29 from './assets/sprites/objects/cousin_dipp.png';
import obj30 from './assets/sprites/objects/cousin_honey.png';
import obj31 from './assets/sprites/objects/cousin_miso.png';
import obj32 from './assets/sprites/objects/cousin_shikao.png';
import obj33 from './assets/sprites/objects/cousin_velvet.png';
import obj34 from './assets/sprites/objects/dog_bulldog.png';
import obj35 from './assets/sprites/objects/dog_doggy.png';
import obj36 from './assets/sprites/objects/person_abaloneDiver.png';
import obj37 from './assets/sprites/objects/person_americanMan.png';
import obj38 from './assets/sprites/objects/person_ballonMan.png';
import obj39 from './assets/sprites/objects/person_bearMan.png';
import obj40 from './assets/sprites/objects/person_burglar.png';
import obj41 from './assets/sprites/objects/person_busker.png';
import obj42 from './assets/sprites/objects/person_clown.png';
import obj43 from './assets/sprites/objects/person_crankyGuy.png';
import obj44 from './assets/sprites/objects/person_doublePunk.png';
import obj45 from './assets/sprites/objects/person_fightJumboman.png';
import obj46 from './assets/sprites/objects/person_fisherman.png';
import obj47 from './assets/sprites/objects/person_flowerGirl.png';
import obj48 from './assets/sprites/objects/person_flyJumboman.png';
import obj49 from './assets/sprites/objects/person_girl.png';
import obj50 from './assets/sprites/objects/person_grandma.png';
import obj51 from './assets/sprites/objects/person_housewife.png';
import obj52 from './assets/sprites/objects/person_killerMove.png';
import obj53 from './assets/sprites/objects/person_marineJumboman.png';
import obj54 from './assets/sprites/objects/person_maskedWrestler.png';
import obj55 from './assets/sprites/objects/person_pandaRide.png';
import obj56 from './assets/sprites/objects/person_peBoy.png';
import obj57 from './assets/sprites/objects/person_principal.png';
import obj58 from './assets/sprites/objects/person_rabbitMan.png';
import obj59 from './assets/sprites/objects/person_rollerboy.png';
import obj60 from './assets/sprites/objects/person_schoolboy.png';
import obj61 from './assets/sprites/objects/person_shubbyHousewife.png';
import obj62 from './assets/sprites/objects/person_strongman.png';
import obj63 from './assets/sprites/objects/person_summerskinny.png';
import obj64 from './assets/sprites/objects/person_sumoWrestler.png';
import obj65 from './assets/sprites/objects/person_surfer.png';
import obj66 from './assets/sprites/objects/person_swimsuitGirl.png';
import obj67 from './assets/sprites/objects/person_tallSchoolboy.png';
import obj68 from './assets/sprites/objects/person_triplePiggybackers.png';
import obj69 from './assets/sprites/objects/thing_5YenCoin.png';
import obj70 from './assets/sprites/objects/thing_airplane.png';
import obj71 from './assets/sprites/objects/thing_ammonite.png';
import obj72 from './assets/sprites/objects/thing_anchor.png';
import obj73 from './assets/sprites/objects/thing_bigWatermelon.png';
import obj74 from './assets/sprites/objects/thing_bulldozer.png';
import obj75 from './assets/sprites/objects/thing_bus.png';
import obj76 from './assets/sprites/objects/thing_cargoShip.png';
import obj77 from './assets/sprites/objects/thing_daruma.png';
import obj78 from './assets/sprites/objects/thing_die.png';
import obj79 from './assets/sprites/objects/thing_japaneseCar.png';
import obj80 from './assets/sprites/objects/thing_monsterTruck.png';
import obj81 from './assets/sprites/objects/thing_mushroom.png';
import obj82 from './assets/sprites/objects/thing_rocket.png';
import obj83 from './assets/sprites/objects/thing_sailboat.png';
import obj84 from './assets/sprites/objects/thing_submarine.png';
import obj85 from './assets/sprites/objects/thing_toweringKokeshi.png';
import obj86 from './assets/sprites/objects/thing_train.png';
import obj87 from './assets/sprites/objects/thing_truck.png';
import obj88 from './assets/sprites/objects/thing_vlc.png';
const flyerPool = [
	obj1,
	obj2,
	obj3,
	obj4,
	obj5,
	obj6,
	obj7,
	obj8,
	obj9,
	obj10,
	obj11,
	obj12,
	obj13,
	obj14,
	obj15,
	obj16,
	obj17,
	obj18,
	obj19,
	obj20,
	obj21,
	obj22,
	obj23,
	obj24,
	obj25,
	obj26,
	obj27,
	obj28,
	obj29,
	obj30,
	obj31,
	obj32,
	obj33,
	obj34,
	obj35,
	obj36,
	obj37,
	obj38,
	obj39,
	obj40,
	obj41,
	obj42,
	obj43,
	obj44,
	obj45,
	obj46,
	obj47,
	obj48,
	obj49,
	obj50,
	obj51,
	obj52,
	obj53,
	obj54,
	obj55,
	obj56,
	obj57,
	obj58,
	obj59,
	obj60,
	obj61,
	obj62,
	obj63,
	obj64,
	obj65,
	obj66,
	obj67,
	obj68,
	obj69,
	obj70,
	obj71,
	obj72,
	obj73,
	obj74,
	obj75,
	obj76,
	obj77,
	obj78,
	obj79,
	obj80,
	obj81,
	obj82,
	obj83,
	obj84,
	obj85,
	obj86,
	obj87,
	obj88,
];
function pickObject() {
	return flyerPool[Math.floor(Math.random() * flyerPool.length)];
}
const MIN_FLYER_SCALE = 1;
const MAX_FLYER_SCALE = 4;

registerChannel('Katamari', 1438, Katamari, {
	position: 'bottomRight',
	site: 'GitHub',
	handle: 'michaelgnslvs',
});

type KatamariObject = {
	reason: string;
	amount: string;
};

export function Katamari(props: ChannelProps) {
	// const [event] = usePreloadedReplicant<Event>('currentEvent');
	const [total] = useReplicant<Total | null>('total', null);

	// Totals
	const totalRaw = total ? total.raw : 0;
	const [animationPlaying, setAnimationPlaying] = useState(false);

	// Rolled Object
	const [katamariObject, setKatamariObject] = useState<KatamariObject | undefined>(undefined);
	const [pendingEvents, setPendingEvents] = useState<FormattedDonation[]>([]);

	// Goal amount
	const [goalProgress, setGoalProgress] = useState(totalRaw);
	const goalStep = 1000;
	const goalTarget = (Math.floor(goalProgress / goalStep) + 1) * goalStep;
	const goalAmount = formatGoalAmount(goalTarget);
	const [goalAmountLocked, setAmountLocked] = useState(goalAmount);
	function formatGoalAmount(target: number) {
		const floorDivisor = Math.pow(10, Math.floor(Math.log10(target) - 2));
		const flooredTarget = Math.floor(target / floorDivisor) * floorDivisor;

		return CurrencyToAbbreviation({
			inputNumber: flooredTarget,
			inputLocale: 'en-US',
			decimalPlacesToRound: 2,
		});
	}

	// Scaling progress meter
	const [progressScale, setProgressScale] = useState(0.001);
	const currentProgressScaleRef = useRef(0.001);
	const targetProgressScaleRef = useRef(0.001);

	// Don't do exponential growth, looks bad
	const intervalStart = goalTarget - goalStep;
	const gainedSinceStart = totalRaw - intervalStart;
	const minScale = 0.5;
	const targetScale = minScale + (1 - minScale) * clamp01(gainedSinceStart / goalStep);

	// Donation Flyer objects
	const [flyers, setFlyers] = useState<Flyer[]>([]);
	const [stuck, setStuck] = useState<Stuck[]>([]);
	const flyerTravelMs = 3000;
	const flyerStopX = 540;

	const katamariBall = { size: 250, xOffset: 350, yOffset: 140 };
	const katamariBallCenterX = katamariBall.xOffset + katamariBall.size / 2;
	const katamariBallCenterY = katamariBall.yOffset + katamariBall.size / 2;

	// Background scene
	const [bgIndex, setBgIndex] = useState(0);

	// Reset katamari -> appear()
	const appear = () => {
		console.log('Appear()');
		setAmountLocked(goalAmount);
		setAnimationPlaying(true);
		setBgIndex(Math.floor(Math.random() * bgPool.length));
		setTimeout(() => {
			setAnimationPlaying(false);
			console.log('End SetTimeout: appear()');
		}, 5000);
		console.log('End appear()');
	};

	// Hit the goal
	const goal = () => {
		setAmountLocked(goalAmount);
		console.log('Goal Reached');
	};

	const katamariEvent = (donation: FormattedDonation) => {
		// Don't need this, donation.amount is already a formatted string with dollar sign
		// const amountText = `$${donation.amount}`;
		const id = `${Date.now()}-${Math.random()}`;
		const startX = 1192;
		const startY = 249;
		console.log(`Donation received: ${donation.amount}`);

		// Spawn a flyer
		setFlyers((prev) => [
			...prev,
			{
				id,
				src: pickObject(),
				amountText: donation.amount,
				startMs: Date.now(),
				durationMs: flyerTravelMs,
				startX,
				startY,
				endX: flyerStopX,
				endY: startY,
				stick: false,
				arrived: false,
				scale: MIN_FLYER_SCALE + Math.random() * (MAX_FLYER_SCALE - MIN_FLYER_SCALE),
			},
		]);
	};

	function onFlyerArrive(f: Flyer, orbitAngleDeg: number) {
		const dX = f.endX - katamariBallCenterX;
		const dY = f.endY - katamariBallCenterY;
		const worldAngleDeg = (Math.atan2(dY, dX) * 180) / Math.PI;
		const angleDeg = worldAngleDeg - orbitAngleDeg;
		const radiusPx = Math.sqrt(dX * dX + dY * dY);

		setFlyers((prev) => prev.filter((x) => x.id !== f.id));
		setStuck((prev) => [
			...prev,
			{
				id: f.id,
				src: f.src,
				angleDeg,
				radiusPx,
				scale: f.scale,
			},
		]);
	}

	useRafLoop(() => {
		// Tween the progress tracker scaling smoothly toward the latest target
		const speed = 0.12;
		const cur = currentProgressScaleRef.current;
		const next = lerp(cur, targetProgressScaleRef.current, speed);
		currentProgressScaleRef.current = next;

		if (Math.abs(next - progressScale) > 0.0005) {
			setProgressScale(next);
		}

		// Process pending donation events
		// Removing animation checker for now, no interrupting animations defined
		// if (!animationPlaying && katamariObject == undefined) {
		if (pendingEvents.length > 0) {
			katamariEvent(pendingEvents[0]);
			const ev: FormattedDonation[] = [...pendingEvents];
			ev.splice(0, 1);
			setPendingEvents(ev);
		}
		// }
	});

	// Listens for GDQ Donation event
	useListenFor('donation', (donation: FormattedDonation) => {
		const ev: FormattedDonation[] = [...pendingEvents];
		ev.push(donation);
		setPendingEvents(ev);
	});

	useEffect(() => {
		targetProgressScaleRef.current = Math.max(0.001, targetScale);
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
				appear();
				// setTimeout(() => {
				// 	// let country: Country = generateRandomCountry();
				// 	// Roll until unique
				// 	// while (country.id == currentCountry.id) {
				// 	// 	country = generateRandomCountry();
				// 	// }
				// 	// setCurrentCountry(country);
				// 	appear();
				// }, 11200);
			}
		}
	}, [total?.raw, goalTarget, animationPlaying]);

	return (
		<Container>
			<ParallaxBackground
				backgrounds={bgPool}
				selectedIndex={bgIndex}
				// selectedIndex={5}
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
			<KatamariBall size={katamariBall.size} xOffset={katamariBall.xOffset} yOffset={katamariBall.yOffset} />
			<DonationFlyers
				flyers={flyers}
				stuck={stuck}
				targetX={katamariBallCenterX}
				targetY={katamariBallCenterY}
				onFlyerArrive={onFlyerArrive}
			/>
			<KatamariTracker size={360} xOffset={-100} yOffset={-125} scale={progressScale}>
				<TotalEl>
					$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
				</TotalEl>
				<GoalAmount>{goalAmountLocked}</GoalAmount>
			</KatamariTracker>
		</Container>
	);
}
