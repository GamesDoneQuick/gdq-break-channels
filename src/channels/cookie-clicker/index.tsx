import { AnimationEventHandler, ReactElement, RefObject, useEffect, useReducer, useRef, useState } from 'react';
import {css, keyframes } from '@emotion/react';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { random } from 'lodash';
import { ChannelProps, registerChannel } from '../channels';
import { useListenFor, useReplicant, } from 'use-nodecg';
import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';
import { render, unmountComponentAtNode } from 'react-dom';

// sprite sheets
import buildingIcons from './assets/buildingIcons.png'
let htmlBuildingIcons = new Image()
htmlBuildingIcons.src = `${buildingIcons}`;

// local imports
import './main.css';
import {grandma, farm, mine, factory, bank, temple, tower, shipment, lab, portal, timeMachine, antimCondenser, prism} from './buildings';
let buildings = [prism, antimCondenser, timeMachine, portal, lab, shipment, tower, temple, bank, factory, mine, farm, grandma];
import {Container, VerticalSection, Cookie, CookieGlow, CookieParticle, FloatText, AnnouncementSection, FormattedText, 
    AnnouncementText, BuildingSection, StoreSection} from './components'
import { EmotionJSX } from '@emotion/react/types/jsx-namespace';

registerChannel('Cookie Clicker', 10, cookieClicker, {
	position: 'bottomLeft',
	handle: 'satasatalight',
    site: 'GitHub'
});

let flavorText = [
    '"We\'re fast grandmas." - grandma',
    "Your cookies are popular at the venue.",
    "News: cookie factories on strike, TASBot employed to replace workforce!",
    "News: time machines involved in any% speedrunning scandal! Or are they?",
    'News: "explain to me again why we need particle accelerators to benefit charity?" asks misguided local woman.',
    "News: speedrunner forced to cancel Oreo sleeve 100% run after unrelated indigestion.",
    'News: "cookies helped me stay focused during my marathon runs" reveals runner.',
]

let usedFlavorText = Array<string>();

export function cookieClicker(props: ChannelProps){
    const [total] = useReplicant<Total | null>('total', null);
    const currentEventRep = nodecg.Replicant<Event>('currentEvent');
    
    let cookieRef = useRef<HTMLDivElement>(null);
    let announcementRef = useRef<HTMLDivElement>(null);
    let [announcementText, setAnnouncementText] = useState('');
    let particles = Array<EmotionJSX.Element>();

    // init announcement ticker
    if(announcementRef.current)
        cssAnimate(announcementRef.current, "announcementFade");
    
    // donations
    useListenFor('donation', (donation: FormattedDonation) => {
        cssAnimate(cookieRef.current!, "cookieClicked");
        processDonation(donation, particles);
	});

    //JSX
    return (
        <Container>

            {/* Big Cookie */}
            <VerticalSection style={{overflow: 'clip'}}>
                <CookieGlow/>
                <CookieGlow style={{animation: "rotate 8s infinite linear reverse"}}/>

                <Cookie ref={cookieRef}>
                    <Particles/>
                </Cookie>

                <FormattedText>
                    <TweenNumber value={Math.floor(total?.raw ?? 0)} /> cookies<br/>
                    <small>to {currentEventRep.value?.beneficiary}</small>
                </FormattedText>
            </VerticalSection>

            {/* Buildings */}
            <VerticalSection style={{left: "calc(30% + 16px)", width: "45%", bottom: "0"}}>
                <AnnouncementSection>
                        <AnnouncementText ref={announcementRef} onAnimationEnd={() => announcementTicker(setAnnouncementText)}>
                            {announcementText}
                        </AnnouncementText>
                </AnnouncementSection>

                <BuildingSection buildingObject={grandma}/>
                <BuildingSection buildingObject={farm}/>
                <BuildingSection buildingObject={mine}/>
                <BuildingSection buildingObject={factory}/>
                <BuildingSection buildingObject={bank}/>
                <BuildingSection buildingObject={temple}/>
                <BuildingSection buildingObject={tower}/>
                <BuildingSection buildingObject={shipment}/>
                <BuildingSection buildingObject={lab}/>
                <BuildingSection buildingObject={portal}/>
                <BuildingSection buildingObject={timeMachine}/>
                <BuildingSection buildingObject={antimCondenser}/>
                <BuildingSection buildingObject={prism}/>
            </VerticalSection>

            {/* Store */}
            <VerticalSection style={{left: "calc(75% + 32px)", width: "calc(25% - 32px)", border: "0px"}}>
                <StoreSection buildingObject={grandma}/>
                <StoreSection buildingObject={farm}/>
                <StoreSection buildingObject={mine}/>
                <StoreSection buildingObject={factory}/>
                <StoreSection buildingObject={bank}/>
                <StoreSection buildingObject={temple}/>
                <StoreSection buildingObject={tower}/>
                <StoreSection buildingObject={shipment}/>
                <StoreSection buildingObject={lab}/>
                <StoreSection buildingObject={portal}/>
                <StoreSection buildingObject={timeMachine}/>
                <StoreSection buildingObject={antimCondenser}/>
                <StoreSection buildingObject={prism}/>
            </VerticalSection>

        </Container>
    )
}

function announcementTicker(setText: Function){
    let announcementIndex = random(0, flavorText.length - 1);
    setText(flavorText[announcementIndex]);

    usedFlavorText.push(flavorText[announcementIndex]);
    flavorText.splice(announcementIndex, 1);

    if(flavorText.length == 0){
        flavorText = usedFlavorText;
        usedFlavorText = Array<string>();
    }
}

function processDonation(donation: FormattedDonation, particles: Array<EmotionJSX.Element>){
    // buying building
    for (let building of buildings){
        if(donation.rawAmount > building.price){
            let context = building.canvasRef?.current?.getContext("2d");

            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            context?.drawImage(htmlBuildingIcons, 128, 64 * building.id, 64, 64, (building.total % 10) * random(53, 60), 
                ((building.total % 2) == 0) ? random(70 - building.yRandomization, 70) : random(85 - building.yRandomization, 85), 64, 64);

            building.savedCanvas = context?.getImageData(0, 0, building.canvasRef!.current!.width, building.canvasRef!.current!.height);

            building.total+=1;

            building.canvasRef?.current?.scrollIntoView({ block: 'end',  behavior: 'smooth' });
            building.storeRef?.current?.scrollIntoView({ block: 'end',  behavior: 'smooth' });
            break;
        }
    }

    //drawing cookie particle
    // let particleLocationX = random(15,70);
    // let particleLocationY = random(35, 65);

    // particles.push(
    //     <div onAnimationEnd={() => particles.splice(0,1)}>
    //             <div css={css`${FloatText(particleLocationX, particleLocationY)};`}>
    //                 + {donation.amount}
    //             </div>
    //             <CookieParticle css={css`animation: ${returnParticleAnimation(particleLocationX, particleLocationY)} 1.5s ease-out;`}/>
    //     </div>
    // );

    // setParticles((particles: Array<EmotionJSX.Element>) =>
    //     particles.unshift(
    //         <div onAnimationEnd={setParticles((particles: Array<EmotionJSX.Element>) => particles.splice(0,1))}>
    //             <div css={css`${FloatText(particleLocationX, particleLocationY)};`}>
    //                 + {donation.amount}
    //             </div>
    //             <CookieParticle css={css`animation: ${returnParticleAnimation(particleLocationX, particleLocationY)} 1.5s ease-out;`}/>
    //         </div>
    //     )
    // );

    // if(particleRef.current) particleRef.current.onanimationend = () => {
    //     console.log("ihfgidhfgojio");
    //     if(particleRef.current) particleRef.current.remove();
    // }
}

function Particles(){
    let particles: Array<EmotionJSX.Element> = [];
    let particleLocationX = random(15,70);
    let particleLocationY = random(35, 65);
    
    useListenFor('donation', (donation: FormattedDonation) => {
        particles.push(
            <div onAnimationEnd={() => particles.splice(0,1)}>
                <div css={css`${FloatText(particleLocationX, particleLocationY)};`}>
                    + {donation.amount}
                </div>
                <CookieParticle css={css`animation: ${returnParticleAnimation(particleLocationX, particleLocationY)} 1.5s ease-out;`}/>
            </div>
        )
	});

    return <>{particles}</>;
}

function cssAnimate(element: HTMLElement, animationClass: string){
    // Copied from papers-please index.tsx
    element.style.animation = 'none';
    element.offsetHeight; /* trigger reflow */
    element.style.removeProperty('animation');
    element.classList.add(animationClass)
}

function returnParticleAnimation(locationX : number, locationY : number){
    let flipped
    (random(0,1) == 0) ? flipped = 1 : flipped = -1;

    return (
    keyframes`
        from{
            left: ${locationX}%;
            top: ${locationY}%;
            transform: rotate(0);
            opacity: 1;
        }
        20%{
            left: ${locationX + (1 * flipped)}%;
            top: ${locationY - 2}%;
            transform: rotate(5deg);
            opacity: 0.8;
        }
        40%{
            left: ${locationX + (2.5 * flipped)}%;
            top: ${locationY - 3}%;
            transform: rotate(10deg);
            opacity: 0.6;
        }
        60%{
            left: ${locationX + (4 * flipped)}%;
            top: ${locationY - 2}%;
            transform: rotate(15deg);
            opacity: 0.4;
        }
        80%{
            left: ${locationX + (5 * flipped)}%;
            top: ${locationY}%;
            transform: rotate(20deg);
            opacity: 0.2;
        }
        to:{
            left: ${locationX + (6 * flipped)}%;
            top: ${locationY + 2.7}%
            trnasform: rotate(20deg);
            opacity: 0;
    }`);
}