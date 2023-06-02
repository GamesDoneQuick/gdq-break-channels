import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/react';
import TweenNumber from '@gdq/lib/components/TweenNumber';

import { useEffect, useRef } from 'react';
import React from 'react';
import { useRafLoop } from 'react-use';

import clouds1 from './images/clouds1.png';
import clouds2 from './images/clouds2.png';
import clouds3 from './images/clouds3.png';
import clouds4 from './images/clouds4.png';
import clouds5 from './images/clouds5.png';
import dragon from './images/dragon.gif';
import sue from './images/sue.gif';
import level from './images/level.png';
import balrog from './images/balrog.gif';
import ghostcat from './images/ghostcat.gif';
import bat from './images/bat.gif';
import critterSmall from './images/critterSmall.gif';
import critterBig from './images/critterBig.gif';
import misery from './images/misery.gif';
import puppy from './images/puppy.gif';
import quote from './images/quote.gif';
import quoteMask from './images/quoteMask.gif';
import curly from './images/curly.gif';

registerChannel('Cave Story', 290, CaveStory, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'omgitsraven',
});

function CaveStory(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);

	const flyingDonationsHolder = useRef<FlyingDonationsHolder>(null);

	const curDeck = useRef<Array<string>>([]);
	const nextDeck = useRef<Array<string>>([]);
	const decksInitializedYet = useRef<boolean>(false);
	
	function putIntoBackHalfOfDeck(item:string){
		const startHalfLength = Math.ceil(nextDeck.current.length/2);
		const remainingHalfLength = nextDeck.current.length-startHalfLength;
		const finalIndex = startHalfLength + Math.floor(Math.random()*(remainingHalfLength+1));
		nextDeck.current.splice(finalIndex, 0, item);
	}
	function putRandomlyInDeck(item:string){
		curDeck.current.splice(Math.floor(curDeck.current.length*Math.random()),0,item);
	}
	function getRandomCharacter(){
		if (!decksInitializedYet.current) {
			putRandomlyInDeck("Balrog");
			putRandomlyInDeck("Quote");
			putRandomlyInDeck("Curly");
			putRandomlyInDeck("Misery");
			putRandomlyInDeck("Puppy");
			decksInitializedYet.current = true;
		}
		var result:string = curDeck.current.shift()!;
		putIntoBackHalfOfDeck(result);
		if (curDeck.current.length == 0) {
			curDeck.current = nextDeck.current;
			nextDeck.current = [];
		}
		return result;
	}

	useListenFor('donation', (donation: FormattedDonation) => {
		if (!flyingDonationsHolder.current) return;
		
		var dollars = donation.rawAmount;
		var character;
		if (dollars >= 100) {
			character = getRandomCharacter();
			if (character == "Quote") {
				if (Math.random() < 1/3) {
					character = "QuoteMask";
				}
			}
		} else if (dollars >= 50) {
			character = "GhostCat";
		} else if (dollars >= 25) {
			character = "CritterBig";
		} else if (dollars >= 10) {
			character = "CritterSmall";
		} else {
			character = "Bat";
		}
		
		const newDonation:DonationFlyerData = {id:performance.now()+"",moneyString:donation.amount,character:character};
		
		const stateRefAdding = flyingDonationsHolder.current.state;
		stateRefAdding.data.add(newDonation);
		flyingDonationsHolder.current.setState(stateRefAdding);

		setTimeout(() => {
			if (!flyingDonationsHolder.current) return;
			const stateRefRemoving = flyingDonationsHolder.current.state;
			stateRefRemoving.data.delete(newDonation);
			flyingDonationsHolder.current.setState(stateRefRemoving);
		}, 5000);
	});

	return (
		<Container>
			<PreloadHider>
				<Misery src={misery}/>
				<Balrog src={balrog}/>
				<Quote src={quote}/>
				<Quote src={quoteMask}/>
				<Quote src={curly}/>
				<Puppy src={puppy}/>
				<GhostCat src={ghostcat}/>
				<CritterBig src={critterBig}/>
				<CritterSmall src={critterSmall}/>
				<Bat src={bat}/>
			</PreloadHider>
			
			<Clouds1/>
			<Clouds2/>
			<Clouds3/>
			<Clouds4/>
			<Clouds5/>
			<Clouds5/>
			<FlyingDonationsHolder ref={flyingDonationsHolder}/>
			<Level src={level}/>
			<Dragon src={dragon}/>
			<Sue src={sue}/>
			<TotalEl>
				$<TweenNumber value={total?.raw} />
			</TotalEl>
		</Container>
	);
}



type DonationFlyerData = {
	id:string,
	moneyString:string,
	character:string
}

class FlyingDonationsHolder extends React.Component<{}, {data:Set<DonationFlyerData>}> {
	constructor(props:{}) {
		super(props);
		this.state = {data:new Set<DonationFlyerData>()};
	}
	render() {
		return(
			<FlyingDonationsStyler>
				{
					[...this.state.data].map((item:DonationFlyerData) => (
						<SidewaysMover key={item.id}>
							<VerticalMover>
								<DonationLabel>{item.moneyString}</DonationLabel>
								<FlyingCharacter character={item.character}/>
							</VerticalMover>
						</SidewaysMover>
					))
				}
			</FlyingDonationsStyler>
		);
	}
}

class FlyingCharacter extends React.Component<{ character: string },{}> {
	render() {
		switch(this.props.character){
			case "Misery":
				return <Misery src={misery}/>;
			case "Balrog":
				return <Balrog src={balrog}/>;
			case "Quote":
				return <Quote src={quote}/>;
			case "QuoteMask":
				return <Quote src={quoteMask}/>;
			case "Curly":
				return <Quote src={curly}/>;
			case "Puppy":
				return <Puppy src={puppy}/>;
			case "GhostCat":
				return <GhostCat src={ghostcat}/>;
			case "CritterBig":
				return <CritterBig src={critterBig}/>;
			case "CritterSmall":
				return <CritterSmall src={critterSmall}/>;
			case "Bat":
				return <Bat src={bat}/>;
		}
	}
}



const PreloadHider = styled.div`
	position: absolute;
	left: 200px;
	width:1px;
	height:1px;
	overflow:hidden;
`;


const sidewaysAnim = keyframes`
	from { left: 1192px; }
	to { left: -100px; }
`;
const SidewaysMover = styled.div`
	position: absolute;
	animation: ${sidewaysAnim} 5s linear;
`;

const verticalAnim = keyframes`
	from { top: 0px; }
	to { top: 100px; }
`;
const VerticalMover = styled.div`
	position: relative;
	animation: ${verticalAnim} 1s alternate infinite ease-in-out;
`;

const DonationLabel = styled.div`
	font-family: gdqpixel;
	font-size: 18px;
	color: white;
	transform: translate(-50%, 0%);
	padding-bottom: 0.5em;
`;

const Balrog = styled.img`
	position: relative;
	left: -39px;
	width: 78px;
	height: 46px;
	image-rendering: pixelated;
`;
const GhostCat = styled.img`
	position: relative;
	left: -41px;
	width: 82px;
	height: 92px;
	image-rendering: pixelated;
`;
const Bat = styled.img`
	position: relative;
	left: -13px;
	width: 26px;
	height: 32px;
	image-rendering: pixelated;
`;
const CritterSmall = styled.img`
	position: relative;
	left: -16px;
	width: 32px;
	height: 32px;
	image-rendering: pixelated;
`;
const CritterBig = styled.img`
	position: relative;
	left: -24px;
	width: 48px;
	height: 48px;
	image-rendering: pixelated;
`;
const Misery = styled.img`
	position: relative;
	left: -13px;
	width: 26px;
	height: 32px;
	image-rendering: pixelated;
`;
const Puppy = styled.img`
	position: relative;
	left: -16px;
	width: 32px;
	height: 34px;
	image-rendering: pixelated;
`;
const Quote = styled.img`
	position: relative;
	left: -60px;
	width: 120px;
	height: 442px;
	image-rendering: pixelated;
`;

const FlyingDonationsStyler = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 1092px;
	height: 332px;
	overflow: hidden;
`;

const Level = styled.img`
	position: absolute;
	top: 0px;
	left: 0px;
	width: 748px;
	height: 332px;
	image-rendering: pixelated;
`;

const Sue = styled.img`
	position: absolute;
	top: 132px;
	left: 650px;
	width: 32px;
	height: 28px;
	image-rendering: pixelated;
`;

const Dragon = styled.img`
	position: absolute;
	top: 104px;
	left: 568px;
	width: 76px;
	height: 56px;
	image-rendering: pixelated;
`;

const cloudsAnim = keyframes`
	from { background-position: 0 0; }
	to { background-position: -640px 0; }
`;

const Clouds1 = styled.div`
	position: absolute;
	top: 252px;
	left: 0;
	width: 100%;
	height: 80px;
	image-rendering: pixelated;
	background-image: url(${clouds1});
	background-size: 640px 80px;
	animation: ${cloudsAnim} 1.5s linear infinite;
`;
const Clouds2 = styled.div`
	position: absolute;
	top: 192px;
	left: 0;
	width: 100%;
	height: 60px;
	image-rendering: pixelated;
	background-image: url(${clouds2});
	background-size: 640px 60px;
	animation: ${cloudsAnim} 3s linear infinite;
`;
const Clouds3 = styled.div`
	position: absolute;
	top: 146px;
	left: 0;
	width: 100%;
	height: 46px;
	image-rendering: pixelated;
	background-image: url(${clouds3});
	background-size: 640px 46px;
	animation: ${cloudsAnim} 6s linear infinite;
`;
const Clouds4 = styled.div`
	position: absolute;
	top: 76px;
	left: 0;
	width: 100%;
	height: 70px;
	image-rendering: pixelated;
	background-image: url(${clouds4});
	background-size: 640px 70px;
	animation: ${cloudsAnim} 12s linear infinite;
`;
const Clouds5 = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 78px;
	image-rendering: pixelated;
	background-image: url(${clouds5});
	background-size: 1092px 78px;
`;

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
`;

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	position: absolute;

	left: 97%;
	top: 90%;
	transform: translate(-100%, -100%);
`;

