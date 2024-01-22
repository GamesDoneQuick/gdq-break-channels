import styled from '@emotion/styled';

import background from './assets/bgBlue.png';
import vignette from './assets/shadedBordersSoft.png';
import panelVertical from './assets/panelVertical.png';
import panelHorizontal from './assets/panelHorizontal.png'
import cookieGlow from './assets/shine.png';
import cookieShadow from './assets/cookieShadow.png';
import perfectCookie from './assets/perfectCookie.png';
import cursorImage from './assets/cursor.png';
import cookieParticle from './assets/cookieParticle.png'

import storeBackground from './assets/storeTile.png'
import buildingIcons from './assets/buildingIcons.png'

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

export let HorizontalSection = styled.canvas(`
    position: relative;
    // image-rendering: pixelated;
    vertical-align: top;
    border-image: url('${panelHorizontal}') 16 round;
    border-bottom-width: 16px;
    border-bottom-style: solid;
    width: 110%;
    height: 128px;

    background: ;`, 
    props => (`background: repeat-x url('${props.id}') top/25%;`)
);

export let StoreWindow = styled.div(`
    position: relative;
    vertical-align: top;
    width: 100%;
    height: 64px;

    background: ;`,
    props => (`background: url('${storeBackground}') 0 ${(parseFloat(props.id as string) % 4) * 64}px;`) 
);

export let StoreIcon = styled.div(`
    position absolute;
    image-rendering: pixelated;
    left: 0;
    width: 64px;
    height: 64px;
    filter: drop-shadow(0 0 5px black);

    background: ;`,
    props =>(`background: url('${buildingIcons}') 0 ${-parseFloat(props.id as string) * 64}px;`)
);

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
    width:100%;
    height:100%;

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

export let CookieParticle = styled.img`
    position: absolute;
    content:url(${cookieParticle});
    image-rendering: pixelated;
;`

export let FloatText = styled.div(`
    position: absolute;
    font-family: Merriweather;
    font-size: 100%;
    text-shadow: 0px 1px 5px black;

    animation: fadeUp 1.5s linear;`,
    props => (
    `@keyframes fadeUp{
        from{
            top: ${props.id}%;
            opacity: 1;
        }
        to{
            top: ${parseFloat(props.id as string) - 10}%;
            opacity: 0;
        };
    }`)
);

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

    & > store{
        position: absolute;
        top: 9px;
        font-size: 95%;
        text-align: left;
        right: 2.5%;
        width: calc(100% - 64px);
    }

    & > price{
        position: absolute;
        text-shadow: 0px 1px 3px black;
        text-align: left;
        color: #66ff66;
        font-size: 45%;
        right: 2.5%;
        top:32px;
        width: calc(100% - 64px);
    }

    & > total{
        position: absolute;
        text-align: right;
        font-size: 230%;
        right: 0;
        width: 100%;
        color: black;
        opacity: 0.4;
    }
`;