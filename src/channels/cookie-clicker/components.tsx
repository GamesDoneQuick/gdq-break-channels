import { useRef, FC } from 'react';
import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { Building } from './buildings';
import { random } from 'lodash';

// images
import background from './assets/bgBlue.png';
import vignette from './assets/shadedBordersSoft.png';
import panelVertical from './assets/panelVertical.png';
import panelHorizontal from './assets/panelHorizontal.png'
import cookieGlow from './assets/shine.png';
import cookieShadow from './assets/cookieShadow.png';
import perfectCookie from './assets/perfectCookie.png';
import cookieParticle from './assets/cookieParticle.png'

// sprite sheets
import storeBackground from './assets/storeTile.png'
import buildingIcons from './assets/buildingIcons.png'

export let BuildingSection: FC<{buildingObject : Building}> = ({buildingObject}) => {
    buildingObject.canvasRef = useRef<HTMLCanvasElement>(null)

    // pasting saved building canvas
    let context = buildingObject.canvasRef.current?.getContext("2d");
    if(buildingObject.savedCanvas) context?.putImageData(buildingObject.savedCanvas, 0, 0);

    return <>
        <canvas height="150%" width="600%" css={css`${HorizontalSection}; background: repeat-x url('${buildingObject.background}') top/25%;`} 
            ref={buildingObject.canvasRef}/> 
    </>
}

export let StoreSection: FC<{buildingObject : Building}> = ({buildingObject}) => {
    buildingObject.storeRef = useRef<HTMLDivElement>(null)

    return <>
        <div css={css`${StoreWindow}; background: url('${storeBackground}') 0 ${(buildingObject.index % 4) * 64}px;`} ref={buildingObject.storeRef}>
            <div css={css`${StoreIcon}; background: url('${buildingIcons}') 0 ${-buildingObject.index * 64}px;`}/>
            <FormattedText> 
                <TotalText>{buildingObject.total}</TotalText>
                <Store>{buildingObject.name}</Store>
                <Price>&gt; ${buildingObject.price} Donation</Price>
            </FormattedText>
        </div>
    </>;
}

let HorizontalSection = css`
    position: relative;
    image-rendering: pixelated;
    vertical-align: top;
    border-image: url('${panelHorizontal}') 16 round;
    border-bottom-width: 16px;
    border-bottom-style: solid;
    width: 110%;
    height: 128px;
`
let Store = styled.div`
    position: absolute;
    top: 9px;
    font-size: 95%;
    text-align: left;
    right: 2.5%;
    width: calc(100% - 64px);
`

let StoreWindow = css`
    position: relative;
    vertical-align: top;
    width: 100%;
    height: 64px;

    background: ;
`

let StoreIcon = css`
    position absolute;
    image-rendering: pixelated;
    left: 0;
    width: 64px;
    height: 64px;
    filter: drop-shadow(0 0 5px black);
`

let TotalText = styled.div`
    position: absolute;
    text-align: right;
    font-size: 230%;
    right: 0;
    width: 100%;
    color: black;
    opacity: 0.4;
`

let Price = styled.div`
    position: absolute;
    text-shadow: 0px 1px 3px black;
    text-align: left;
    color: #66ff66;
    font-size: 45%;
    right: 2.5%;
    top:32px;
    width: calc(100% - 64px);
`

export function ParticleAnimation(locationX : number, locationY : number){
    let flipped = (random(0,1) == 0) ? 1 : -1;

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
        100%:{
            left: ${locationX + (6 * flipped)}%;
            top: ${locationY + 3}%
            transform: rotate(20deg);
            opacity: 0;
    }`);
}

export let FadeUpAnimation = (locationY: number) => {
    return keyframes`
        from{
            top: ${locationY}%;
            opacity: 1;
        }
        to{
            top: ${locationY - 10}%;
            opacity: 0;
        }`;
}

export let FloatText = (locationX : number) => {
    return css`
        position: absolute;
        font-family: Merriweather;
        font-size: 100%;
        text-shadow: 0px 1px 5px black;
        left: ${locationX + "%"};
    `;
}

export let CookieClicked = keyframes`
    from{
        transform: scale(1)
    }
    15%{
        transform: scale(0.9)
    }
    25%{
        transform: scale(1)
    }
    65%{
        transform: scale(0.95)
    }
    to{
        transform: scale(1)
    }
`;

export let staticFadeUp = keyframes`
    from{
        top: 25%;
        opacity: 1;
    }
    90%{
        top: 25%;
        opacity: 1;
    }
    to{
        top: 0%;
        opacity: 0;
    }
`

export let CookieParticle = styled.img`
    position: absolute;
    content:url(${cookieParticle});
    image-rendering: pixelated;
;`

export let Container = styled.div`
    position: absolute;
    background: url('${background}');
    background-repeat: repeat;
    width: 100%;
    height: 100%;
`;

export let VerticalSection = styled.div`
    position: absolute;
    background: url('${vignette}');
    border-image: url('${panelVertical}') 16 round;
    border-right-width: 16px;
    border-right-style: solid;
    width: 30%;
    height: 100%;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    overflow-y: scroll;
    overflow-x: hidden;
`;

export let Cookie = styled.div`
    position: absolute;
    top:5%;
    width:100%;
    height:100%;
    
    background: url(${perfectCookie}), url(${cookieShadow});
    background-size: 70% 70%, 85% 85%;
    background-repeat: no-repeat, no-repeat;
    background-position: center, center;
`;

export let CookieGlow = styled.div`
    position: absolute;
    top: 55%;
    left: 50%;
    width: 100%;
    height: 100%;

    transform-origin: center;
    background: url(${cookieGlow});
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-position: center;

    animation-name: rotate;
    animation-duration: 10s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    @keyframes rotate{
        from{
            transform: translate(-50%, -50%) rotate(0deg);
        }
        to{
            transform: translate(-50%, -50%) rotate(360deg);
        }
    }
`;

export let AnnouncementSection = styled.div`
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    background: url('${vignette}'), url('${background}');
    background-size: 100% 100%, 50% 50%;
    background-repeat: no-repeat, repeat;

    border-image: url('${panelHorizontal}') 16 round;
    border-bottom-width: 16px;
    border-bottom-style: solid;
    width: 100%;
    height: 20%;
`;

export let FormattedText = styled.div`
    position: absolute;
    font-family: Merriweather;
    font-size: 150%;
    text-align: center;
    text-shadow: 0px 1px 5px black;
    width: 100%;
    top: 5%;

    & > small{
        position: relative;
        vertical-align: top;
        color: #66ff66;
        line-height: 1.5;
        font-size: 45%;
    }
`;

export let AnnouncementText = styled.div`
    position: absolute;
    font-family: Merriweather;
    font-size: 100%;
    text-align: center;
    text-shadow: 5px 5px 8px black;
    width: 100%;
    top: 25%;
    margin: 0px 10px 10px 10px;
`