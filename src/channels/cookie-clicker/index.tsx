import { useRef, useState } from 'react';
import { css } from '@emotion/react';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { random } from 'lodash';
import { ChannelProps, registerChannel } from '../channels';
import { useListenFor, useReplicant, } from 'use-nodecg';
import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';

// sprite sheets
import buildingIcons from './assets/buildingIcons.png'
let htmlBuildingIcons = new Image()
htmlBuildingIcons.src = `${buildingIcons}`;

// local imports
import {buildings} from './buildings';
import {Container, VerticalSection, Cookie, CookieGlow, CookieParticle, FloatText, AnnouncementSection, FormattedText, 
    AnnouncementText, BuildingSection, StoreSection, ParticleAnimation, FadeUpAnimation, CookieClicked, staticFadeUp} from './components'
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
let sequentialKey  = 0; // to give unique keys to array elements

export function cookieClicker(props: ChannelProps){
    const [total] = useReplicant<Total | null>('total', null);
    const currentEventRep = nodecg.Replicant<Event>('currentEvent');
    
    let cookieRef = useRef<HTMLDivElement>(null);
    let announcementRef = useRef<HTMLDivElement>(null);
    let [announcementText, setAnnouncementText] = useState<string>('');
    let [particles, setParticles] = useState<Array<EmotionJSX.Element>>([]);

    // init announcement ticker
    cssAnimate(announcementRef.current!);
    
    // donations
    useListenFor('donation', (donation: FormattedDonation) => {
        cssAnimate(cookieRef.current!);
        drawBuilding(donation);
        drawParticle(donation, setParticles);
	});

    //JSX
    return (
        <Container>

            {/* Big Cookie */}
            <VerticalSection style={{overflow: 'clip'}}>
                <CookieGlow/>
                <CookieGlow style={{animation: "rotate 8s infinite linear reverse"}}/>

                <Cookie css={css`animation: ${CookieClicked} 1s; animation-iteration-count: 1;`} ref={cookieRef}>
                    {particles}
                </Cookie>

                <FormattedText>
                    <TweenNumber value={Math.floor(total?.raw ?? 0)} /> cookies<br/>
                    <small>to {currentEventRep.value?.beneficiary}</small>
                </FormattedText>
            </VerticalSection>

            {/* Buildings */}
            <VerticalSection style={{left: "calc(30% + 16px)", width: "45%", bottom: "0"}}>
                <AnnouncementSection>
                        <AnnouncementText css={css`animation: ${staticFadeUp} 5s; animation-iteration-count: 1;`} 
                            ref={announcementRef} onAnimationEnd={() => announcementTicker(setAnnouncementText)}>
                            {announcementText}
                        </AnnouncementText>
                </AnnouncementSection>
                
                {buildings.map((building) => {
                    return <BuildingSection buildingObject={building}/>
                })}
            </VerticalSection>

            {/* Store */}
            <VerticalSection style={{left: "calc(75% + 32px)", width: "calc(25% - 32px)", border: "0px"}}>
                {buildings.map((building) => {
                    return <StoreSection buildingObject={building}/>
                })}
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

function drawBuilding(donation: FormattedDonation){
    // buying building
    for (let i = buildings.length - 1; i >= 0; i--){
        let building = buildings[i];

        if(donation.rawAmount > building.price){
            let context = building.canvasRef?.current?.getContext("2d");

            // drawing image by cropping out the building icon from the sprite sheet
            // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            context?.drawImage(htmlBuildingIcons, 128, 64 * building.index, 64, 64, (building.total % 10) * random(53, 60), 
                ((building.total % 2) == 0) ? random(70 - building.yRandomization, 70) : random(85 - building.yRandomization, 85), 64, 64);

            building.savedCanvas = context?.getImageData(0, 0, building.canvasRef!.current!.width, building.canvasRef!.current!.height);

            building.total+=1;

            building.canvasRef?.current?.scrollIntoView({ block: 'end',  behavior: 'smooth' });
            building.storeRef?.current?.scrollIntoView({ block: 'end',  behavior: 'smooth' });
            break;
        }
    }
}

function drawParticle(donation : FormattedDonation, setParticles: Function){
    let particleLocationX = random(15,70);
    let particleLocationY = random(35, 65);

    setParticles((prevParticles : Array<EmotionJSX.Element>) => [...prevParticles, 
        <div key={++sequentialKey} onAnimationEnd={() => {removeParticle(setParticles);}}>
            <CookieParticle css={css`
                animation: ${ParticleAnimation(particleLocationX, particleLocationY)} 2s ease-out; animation-fill-mode: forwards;`}/>

            <div css={css`${FloatText(particleLocationX)}; animation: ${FadeUpAnimation(particleLocationY)} 1.5s linear;`}>
                + {donation.amount}
            </div>
        </div>
    ]);
}

function removeParticle(setParticles : Function){
    setParticles((prevParticles : Array<Object>) => prevParticles.slice(1, prevParticles.length));
}

function cssAnimate(element: HTMLElement){
    // mostly Copied from papers-please index.tsx
    if (!element) return;
    element.style.animation = 'none';
    element.offsetHeight; /* trigger reflow */
    element.style.removeProperty('animation');
}