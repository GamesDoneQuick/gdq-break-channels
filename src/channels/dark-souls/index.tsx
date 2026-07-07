import { useRef, useState } from 'react';
import type { FormattedDonation, Total, TwitchSubscription } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import { useListenFor, useReplicant } from 'use-nodecg';
import TweenNumber from '@gdq/lib/components/TweenNumber';

// components
import {
	Container,
	TotalEl,
	Video,
	HealthBar,
	//TransHumanity,
	Items,
	TotalWrapper,
	HumanityCount,
	HumanityNum,
} from './components';

// videos
import bRoll from './videos/b-roll.webm';
import mainChar from './videos/main-char.webm';
import dad from './videos/dad.webm';
import kirk from './videos/kirk.webm';
import lautrec from './videos/lautrec.webm';
import logan from './videos/logan.webm';
import mindblank from './videos/mindblank.webm';
import siegmeyer from './videos/siegmeyer.webm';
import solaire from './videos/solaire.webm';
import havel from './videos/havel.webm';
import chester from './videos/chester.webm';
import artorias from './videos/artorias.webm';
import ninja1 from './videos/ninja1.webm';
import ninja2 from './videos/ninja2.webm';

// images
import healthBar from './img/health-bar.png';
import items from './img/items.png';
//import transHumanity from './img/trans-humanity.png';
import num0 from './img/numbers/0.png';
import num1 from './img/numbers/1.png';
import num2 from './img/numbers/2.png';
import num3 from './img/numbers/3.png';
import num4 from './img/numbers/4.png';
import num5 from './img/numbers/5.png';
import num6 from './img/numbers/6.png';
import num7 from './img/numbers/7.png';
import num8 from './img/numbers/8.png';
import num9 from './img/numbers/9.png';

const humanityNums: string[] = [num0, num1, num2, num3, num4, num5, num6, num7, num8, num9];
const cameos: string[] = [
	dad,
	kirk,
	lautrec,
	logan,
	mindblank,
	siegmeyer,
	solaire,
	havel,
	chester,
	artorias,
	ninja1,
	ninja2,
];

registerChannel('Dark Souls', 1337, DarkSouls, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'Nevets10',
});

function DarkSouls(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);

	// subscription tracking
	const [subCount, setSubCount] = useState<number>(0);
	const currentSubCount = useRef<number>(0);

	// video playback tracking
	const [cameo, setCameo] = useState<string>('');
	const cameoQueue = useRef<string[]>([]);

	useListenFor('donation', (donation: FormattedDonation) => {
		// Add random character to the queue after filtering the last one currently in the queue
		// The video will not play the same character back-to-back
		const filteredCameos = cameos.filter((cameo) => cameo !== cameoQueue.current[cameoQueue.current.length - 1]);
		const newCameo = filteredCameos[Math.floor(Math.random() * filteredCameos.length)];
		cameoQueue.current.push(newCameo);
		setCameo(cameoQueue.current[0]);
	});

	useListenFor('subscription', (subscription: TwitchSubscription) => {
		currentSubCount.current += 1;
		setSubCount(currentSubCount.current);
	});

	function handleOnEnded(): void {
		cameoQueue.current.shift();
		setCameo(cameoQueue.current[0]);
	}

	function getHumanityTens(): number {
		if (subCount > 99) return 9;
		if (subCount < 10) return 0;
		return +subCount.toString()[0];
	}

	function getHumanityOnes(): number {
		if (subCount > 99) return 9;
		if (subCount >= 10) {
			return +subCount.toString()[1];
		} else {
			return +subCount.toString()[0];
		}
	}

	return (
		<Container>
			<Video controls={false} autoPlay={true} loop={true} src={bRoll}></Video>
			<Video controls={false} autoPlay={true} src={cameo} onEnded={handleOnEnded}></Video>
			<Video controls={false} autoPlay={true} loop={true} src={mainChar}></Video>
			<TotalWrapper>
				<TotalEl>
					$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
				</TotalEl>
			</TotalWrapper>
			<HealthBar src={healthBar} />
			{/* <TransHumanity src={transHumanity} /> */}
			<HumanityCount>
				<HumanityNum src={humanityNums[getHumanityTens()]} />
				<HumanityNum src={humanityNums[getHumanityOnes()]} />
			</HumanityCount>
			<Items src={items}></Items>
		</Container>
	);
}
