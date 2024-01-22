import { useEffect, useReducer, useRef, useState } from 'react';
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
import {Container, VerticalSection, HorizontalSection, StoreWindow, StoreIcon, Cookie, CookieGlow, CookieParticle, 
    FloatText, AnnouncementSection, FormattedText} from './components'

registerChannel('Cookie Clicker', 10, cookieClicker, {
	position: 'bottomLeft',
	handle: 'satalight',
    site: 'GitHub'
});

let flavorText = [
    '<i>"We\'re fast grandmas."</i> - grandma',
    "Your cookies are popular at the venue.",
    "News: cookie factories on strike, TASBot employed to replace workforce!",
    "News: time machines involved in any% speedrunning scandal! Or are they?",
    'News: "explain to me again why we need particle accelerators to benefit charity?" asks misguided local woman.',
    "News: speedrunner forced to cancel Oreo sleeve 100% run after unrelated indigestion.",
    'News: "cookies helped me stay focused during my marathon runs" reveals runner.',
]

let donationQueue = Array<FormattedDonation>();
let init = false;
let usedFlavorText = Array<string>();

export function cookieClicker(props: ChannelProps){
    const [total] = useReplicant<Total | null>('total', null);
    const currentEventRep = nodecg.Replicant<Event>('currentEvent');
    
    let cookieRef = useRef<HTMLDivElement>(null);
    let announcementRef = useRef<HTMLDivElement>(null);
    
    //announcement ticker loop
    if(announcementRef.current && !init){
        init = true;

        let announcementInterval = setInterval(() =>{
            
            if(announcementRef.current) {
                cssAnimate(announcementRef.current as HTMLElement, "announcementFade");

                setTimeout(() => {
                    let announcementIndex = random(0, flavorText.length - 1);
                    announcementRef.current.innerHTML = flavorText[announcementIndex]

                    usedFlavorText.push(flavorText[announcementIndex]);
                    flavorText.splice(announcementIndex, 1);
                }, 900)
            
                if(flavorText.length == 0){
                    flavorText = usedFlavorText;
                    usedFlavorText = Array<string>();
                }
            }else clearInterval(announcementInterval!)

        }, 5000);
    }

    //creating building  / store windows
    let horizontalSection = <></>;
    let storeSection = <></>;

    buildings.forEach(building =>{
        building.canvasRef = useRef<HTMLCanvasElement>(null)
        building.storeRef = useRef<HTMLDivElement>(null)

        if(building.name != "Cursor")
            horizontalSection = <>
                <HorizontalSection height="150%" width="600%" ref={building.canvasRef} id={building.background}/> 
                {horizontalSection} 
            </>;

        storeSection = <>
            <StoreWindow ref={building.storeRef} id={`${building.id}`}>
                <StoreIcon id={`${building.id}`}/>
                <FormattedText> 
                    <total>{building.total}</total>
                    <store>{building.name}</store>
                    <price>&gt; ${building.price} Donation</price>
                </FormattedText>
            </StoreWindow>
            {storeSection}
        </>;

        if(building.savedCanvas && building.canvasRef.current){
            let context = building.canvasRef.current.getContext("2d");
            context.putImageData(building.savedCanvas, 0, 0);
        }
    });
    
    // donations
    useListenFor('donation', (donation: FormattedDonation) => {
        donationQueue.unshift(donation);

        if(cookieRef.current){
            // buying building
            for (let building of buildings){
                if(donation.rawAmount > building.price){
                    if(building.name != "Cursor"){
                        let context = building.canvasRef.current.getContext("2d");

                        //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
                        context.drawImage(htmlBuildingIcons, 128, 64 * building.id, 64, 64, (building.total % 10) * random(53, 60), 
                        ((building.total % 2) == 0) ? random(70 - building.yRandomization, 70) : random(85 - building.yRandomization, 85), 64, 64);

                        building.savedCanvas = context.getImageData(0, 0, building.canvasRef.current.width, building.canvasRef.current.height)
                    };

                    building.total+=1;

                    building.canvasRef.current.scrollIntoView({ block: 'end',  behavior: 'smooth' });
                    building.storeRef.current.scrollIntoView({ block: 'end',  behavior: 'smooth' });
                    break;
                }
            }

            setTimeout(() =>{
                processDonation(donationQueue[0], cookieRef.current as HTMLElement);
            }, 1300 * (donationQueue.length - 1))
        }
	});

    //JSX
    return (
        <Container>

            {/* Big Cookie */}
            <VerticalSection style={{overflow: 'clip'}}>
                <CookieGlow/>
                <CookieGlow style={{animation: "rotate 8s infinite linear reverse"}}/>

                <Cookie ref={cookieRef}/>

                <FormattedText>
                    <TweenNumber value={Math.floor(total?.raw ?? 0)} /> cookies<br/>
                    <small>to {currentEventRep.value?.beneficiary}</small>
                </FormattedText>
            </VerticalSection>

            {/* Buildings */}
            <VerticalSection style={{left: "calc(30% + 16px)", width: "45%", bottom: "0"}}>
                <AnnouncementSection>
                        <FormattedText ref={announcementRef} css={css`margin: auto; text-shadow: 5px 5px 8px black; top: 25%; font-size: 100%;`}/>
                </AnnouncementSection>

                {horizontalSection}
            </VerticalSection>

            {/* Store */}
            <VerticalSection style={{left: "calc(75% + 32px)", width: "calc(25% - 32px)", border: "0px"}}>
                {storeSection}
            </VerticalSection>

        </Container>
    )
}

function processDonation(donation: FormattedDonation, element: HTMLElement){
    // animating cookie
    cssAnimate(element, "cookieClicked");

    //drawing cookie particle
    let particleLocation = [random(15,70), random(35, 65)]
    let particle = 
    <>
        <FloatText id={`${particleLocation[1]}`} style={{left: `${particleLocation[0] + "%"}`}}>
            + {donation.amount}
        </FloatText>
        <CookieParticle css={css`animation: ${returnParticleAnimation(particleLocation)} 1.5s ease-out;`}/>
    </>

    render(particle, element)
    // deleting cookie particle
    setTimeout(() =>{
        unmountComponentAtNode(element);
        donationQueue.splice(0,1);
    }, 1200)
}

function cssAnimate(element: HTMLElement, animationClass: string){
    // Copied from papers-please index.tsx
    element.style.animation = 'none';
    element.offsetHeight; /* trigger reflow */
    element.style.removeProperty('animation');
    element.classList.add(animationClass)
}

function returnParticleAnimation(location: Array<number>){
    let flipped
    (random(0,1) == 0) ? flipped = 1 : flipped = -1;

    return (
    keyframes`
        from{
            left: ${location[0]}%;
            top: ${location[1]}%;
            transform: rotate(0);
            opacity: 1;
        }
        20%{
            left: ${location[0] + (1 * flipped)}%;
            top: ${location[1] - 2}%;
            transform: rotate(5deg);
            opacity: 0.8;
        }
        40%{
            left: ${location[0] + (2.5 * flipped)}%;
            top: ${location[1] - 3}%;
            transform: rotate(10deg);
            opacity: 0.6;
        }
        60%{
            left: ${location[0] + (4 * flipped)}%;
            top: ${location[1] - 2}%;
            transform: rotate(15deg);
            opacity: 0.4;
        }
        80%{
            left: ${location[0] + (5 * flipped)}%;
            top: ${location[1]}%;
            transform: rotate(20deg);
            opacity: 0.2;
        }
        to:{
            left: ${location[0] + (6 * flipped)}%;
            top: ${location[1] + 2.7}%
            trnasform: rotate(20deg);
            opacity: 0;
    }`);
}