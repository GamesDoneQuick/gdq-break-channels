/*
Here Comes Niko! Handsome Frog Widget
By: Naomi @ twitch.tv/naomiiiplays
With permission from: Frog Vibes
*/

//Import Defaults
import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';

//Import Custom
//Modules
import { useState, useRef } from 'react';
import { keyframes } from '@emotion/react';

//Image Assets
//Background
import homeBackground from './assets/home_background.png';

//Frogs
import frogNormal from './assets/frog.gif';
import frogHandsome from './assets/handsome.gif';
import frogGaming from './assets/gaming.gif';

//Tamagotchi Body
import tamagotchiBody from './assets/tamagotchi/tamagotchi_body.png';
import tamagotchiLRButton from './assets/tamagotchi/tamagotchi_arrow_button.png';
import tamagotchiMainButton from './assets/tamagotchi/tamagotchi_action_button.png';
import tamagotchiKC01 from './assets/tamagotchi/tamagotchi_kc_caterpillar.png';
import tamagotchiKC02 from './assets/tamagotchi/tamagotchi_kc_helix.png';

//Tamagotchi Game
import snailPet from './assets/tamagotchi/sprites/snail.gif';
import snailSad from './assets/tamagotchi/sprites/snailSad.gif';
import speechBubble from './assets/tamagotchi/sprites/speechbubble.png';
import snailFoodEmpty from './assets/tamagotchi/sprites/bowl_empty.png';
import snailFoodFull from './assets/tamagotchi/sprites/bowl_full.png';
import snailKitchen from './assets/tamagotchi/sprites/kitchen.png';

//FX
import vignette from './assets/vignette.png';
import glimmer_01 from './assets/glimmer_01.gif';
import glimmer_02 from './assets/glimmer_02.gif';
import dialogueBox from './assets/dialogue_box.png';

//Channel
registerChannel('Here Comes Niko', 31, Niko, {
	position: 'bottomLeft',
	site: 'Twitch',
	handle: 'NaomiiiPlays',
});

//Variables
let DIALOGUE_ACTIVE = false;
let DIALOGUE_COUNTER = 0;
let TAMAGOTCHI_ACTIVE = false;
let PREVIOUS_DLG_TO_PLAY = -1;

function Niko(props: ChannelProps) {
	//Donation Total
	const [total] = useReplicant<Total | null>('total', null);

	//Dialogue
	const dlg = useRef<HTMLSpanElement>(null);
	const tdlg = useRef<HTMLSpanElement>(null);

	//UseStates
	const [FROG_CURRENT_SPRITE, setCurrentSprite] = useState(frogNormal);
	const [FONT_SIZE, setFontSize] = useState('45px');
	const [VIGNETTE_STATE, enableVignette] = useState(false);

	//Tamagotchi UseStates
	const [TAMAGOTCHI_STATE, enableTamagotchi] = useState(false);
	const [SNAIL_PET, setSnailSprite] = useState(snailSad);
	const [SNAIL_CENTER, showSnailCenter] = useState(true);
	const [SNAIL_LEFT, moveSnailLeft] = useState(false);
	const [SNAIL_RIGHT, moveSnailRight] = useState(false);
	const [SNAIL_SPEECH_CENTER, showSnailSpeechCenter] = useState(false);
	const [SNAIL_FOOD, setSpriteFoodBowl] = useState(snailFoodEmpty);
	const [SNAIL_FOOD_CENTER, showFoodCenter] = useState(false);
	const [SNAIL_FOOD_RIGHT_TO_CENTER, moveFoodRightToCenter] = useState(false);
	const [SNAIL_FOOD_CENTER_TO_RIGHT, moveFoodCenterToRight] = useState(false);
	const [SNAIL_KITCHEN_CENTER, showKitchenCenter] = useState(false);
	const [SNAIL_KITCHEN_RIGHT_TO_CENTER, moveKitchenRightToCenter] = useState(false);
	const [SNAIL_KITCHEN_CENTER_TO_RIGHT, moveKitchenCenterToRight] = useState(false);

	useListenFor('donation', (donation: FormattedDonation) => {
		if (!DIALOGUE_ACTIVE && !TAMAGOTCHI_ACTIVE && Math.random() > 0.1 && DIALOGUE_COUNTER < 3) {
			(async () => {
				//Lock dialogue, displays the dialogue box
				DIALOGUE_ACTIVE = true;
				props.lock();

				let DLG_TO_PLAY = Math.floor(Math.random() * playDialogue.length);

				//Don't play the same dialogue twice in succession
				if (DLG_TO_PLAY == PREVIOUS_DLG_TO_PLAY) {
					while (DLG_TO_PLAY == PREVIOUS_DLG_TO_PLAY) {
						DLG_TO_PLAY = Math.floor(Math.random() * playDialogue.length);
					}
				}

				//Play dialogue
				await playDialogue[DLG_TO_PLAY](dlg, donation.amount);
				setCurrentSprite(frogHandsome);
				setFontSize('50px');
				enableVignette(true);

				await playPunchline[DLG_TO_PLAY](dlg, donation.amount);
				setCurrentSprite(frogNormal);
				setFontSize('45px');
				enableVignette(false);

				PREVIOUS_DLG_TO_PLAY = DLG_TO_PLAY;
				DIALOGUE_COUNTER = DIALOGUE_COUNTER + 1;
				DIALOGUE_ACTIVE = false;
				props.unlock();
			})();
		}

		//If no dialogue is triggered, Handsome Frog opens the Tamagotchi, cares for its snail, then returns to charming.
		//This is guaranteed to happen after 3 dialogues have been triggered
		if (!DIALOGUE_ACTIVE && !TAMAGOTCHI_ACTIVE) {
			(async () => {
				TAMAGOTCHI_ACTIVE = true;
				props.lock();

				setCurrentSprite(frogGaming);
				setSnailSprite(snailSad);
				enableTamagotchi(true);

				await delay(1100);
				showSnailSpeechCenter(true);
				await dialog(tdlg, `I am hungry!`, 2000, 0);

				//Move Snail to Left
				showSnailCenter(false);
				showSnailSpeechCenter(false);
				moveSnailLeft(true);
				moveFoodRightToCenter(true);
				moveKitchenRightToCenter(true);

				await delay(1000);
				moveFoodRightToCenter(false);
				moveKitchenRightToCenter(false);
				showFoodCenter(true);
				showKitchenCenter(true);
				moveSnailLeft(false);

				await delay(500);
				setSpriteFoodBowl(snailFoodFull);
				setSnailSprite(snailPet);

				await delay(2000);
				moveFoodCenterToRight(true);
				moveKitchenCenterToRight(true);
				showFoodCenter(false);
				showKitchenCenter(false);
				moveSnailRight(true);

				await delay(1000);
				moveFoodCenterToRight(false);
				moveKitchenCenterToRight(false);
				moveSnailRight(false);
				showSnailCenter(true);
				showSnailSpeechCenter(true);
				await dialog(tdlg, `Hello friend!`, 2000, 0);

				setSpriteFoodBowl(snailFoodEmpty);
				showSnailSpeechCenter(false);
				enableTamagotchi(false);
				setCurrentSprite(frogNormal);
				TAMAGOTCHI_ACTIVE = false;
				DIALOGUE_COUNTER = 0;
				props.unlock();
			})();
		}
	});

	return (
		<Container>
			<BG />
			<Frog src={FROG_CURRENT_SPRITE} />
			<Vignette VIGNETTE_STATE={VIGNETTE_STATE} />
			<Glimmer src={glimmer_02} VIGNETTE_STATE={VIGNETTE_STATE} POS_LEFT="25%" POS_TOP="15%" />
			<Glimmer src={glimmer_01} VIGNETTE_STATE={VIGNETTE_STATE} POS_LEFT="4%" POS_TOP="55%" />
			<DialogBox src={dialogueBox} DIALOGUE_ACTIVE={DIALOGUE_ACTIVE} />
			<DialogueWrapper FONT_SIZE={FONT_SIZE}>
				<DialogueText ref={dlg}></DialogueText>
			</DialogueWrapper>

			<TamagotchiActiveWrapper TAMAGOTCHI_ACTIVE={TAMAGOTCHI_STATE}>
				<TamagotchiBody src={tamagotchiBody}></TamagotchiBody>
				<TamagotchiKeychain src={tamagotchiKC01}></TamagotchiKeychain>
				<TamagotchiKeychain src={tamagotchiKC02}></TamagotchiKeychain>
				<TamagotchiLRButton
					src={tamagotchiLRButton}
					POS_LEFT="15%"
					POS_TOP="68%"
					TRANSFORM="translate(50%, 50%) scaleX(1)"></TamagotchiLRButton>
				<TamagotchiLRButton
					src={tamagotchiLRButton}
					POS_LEFT="55%"
					POS_TOP="68%"
					TRANSFORM="translate(50%, 50%) scaleX(-1)"></TamagotchiLRButton>
				<TamagotchiMainButton src={tamagotchiMainButton}></TamagotchiMainButton>
				<TamagotchiGameScreen>
					<SnailPetCenter src={SNAIL_PET} VISIBLE={SNAIL_CENTER} />
					<SnailPetLeft src={SNAIL_PET} VISIBLE={SNAIL_LEFT} />
					<SnailPetRight src={SNAIL_PET} VISIBLE={SNAIL_RIGHT} />
					<SpeechBubbleCenter src={speechBubble} VISIBLE={SNAIL_SPEECH_CENTER} />
					<FoodCenter src={SNAIL_FOOD} VISIBLE={SNAIL_FOOD_CENTER} />
					<FoodCenterToRight src={SNAIL_FOOD} VISIBLE={SNAIL_FOOD_CENTER_TO_RIGHT} />
					<FoodRightToCenter src={SNAIL_FOOD} VISIBLE={SNAIL_FOOD_RIGHT_TO_CENTER} />
					<TamagotchiKitchenCenter src={snailKitchen} VISIBLE={SNAIL_KITCHEN_CENTER} />
					<TamagotchiKitchenCenterToRight src={snailKitchen} VISIBLE={SNAIL_KITCHEN_CENTER_TO_RIGHT} />
					<TamagotchiKitchenRightToCenter src={snailKitchen} VISIBLE={SNAIL_KITCHEN_RIGHT_TO_CENTER} />
					<TamagotchiDlgWrapper>
						<TamagotchiDlgText ref={tdlg}></TamagotchiDlgText>
					</TamagotchiDlgWrapper>
				</TamagotchiGameScreen>
			</TamagotchiActiveWrapper>

			<TamagotchiInactiveWrapper TAMAGOTCHI_ACTIVE={TAMAGOTCHI_STATE}>
				<TamagotchiBody src={tamagotchiBody}></TamagotchiBody>
				<TamagotchiKeychain src={tamagotchiKC01}></TamagotchiKeychain>
				<TamagotchiKeychain src={tamagotchiKC02}></TamagotchiKeychain>
				<TamagotchiLRButton
					src={tamagotchiLRButton}
					POS_LEFT="15%"
					POS_TOP="68%"
					TRANSFORM="translate(50%, 50%) scaleX(1)"></TamagotchiLRButton>
				<TamagotchiLRButton
					src={tamagotchiLRButton}
					POS_LEFT="55%"
					POS_TOP="68%"
					TRANSFORM="translate(50%, 50%) scaleX(-1)"></TamagotchiLRButton>
				<TamagotchiMainButton src={tamagotchiMainButton}></TamagotchiMainButton>
				<TamagotchiGameScreen>
					<SnailPetCenter src={SNAIL_PET} VISIBLE={SNAIL_CENTER} />
				</TamagotchiGameScreen>
			</TamagotchiInactiveWrapper>

			<TotalEl>
				$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
			</TotalEl>
		</Container>
	);
}

//Display handsome dialogue
const dialog = (
	dlg: React.RefObject<HTMLSpanElement>,
	text: string,
	duration: number,
	delay: number,
): Promise<void> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			const ref = dlg.current;
			if (ref) ref.innerText = text;

			setTimeout(() => {
				const ref = dlg.current;
				if (ref) ref.innerText = '';
				resolve();
			}, duration);
		}, delay);
	});
};

const playDialogue: ((dlg: React.RefObject<HTMLSpanElement>, amount: string) => Promise<void>)[] = [
	async (dlg, amount) => {
		await dialog(dlg, `Wow! A ${amount} donation!`, 4000, 0);
		await dialog(dlg, `There is a special name for a person who donates.`, 4000, 0);
		await dialog(dlg, 'It is spelled with just two letters.', 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `Another ${amount} donation for charity!`, 4000, 0);
		await dialog(dlg, `To me - you're like a rare coin.`, 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `You're amazing for donating ${amount} to charity.`, 4000, 0);
		await dialog(dlg, `Did you know frogs have a lifespan up to 30 years?`, 4000, 0);
		await dialog(dlg, `I wish I was a cat, they get 9 lives...`, 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `${amount} for charity!`, 4000, 0);
		await dialog(dlg, `If I could...`, 3000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `A ${amount} donation for a good cause!`, 4000, 0);
		await dialog(dlg, `Just between you and me.`, 4000, 0);
		await dialog(dlg, `If I could rearrange the alphabet...`, 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `Your ${amount} donation just revealed something magical!`, 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `Your ${amount} donation is turning my world upside down.`, 4000, 0);
		await dialog(dlg, `I never believed in love at first sight...`, 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `Because you donated ${amount}, I will share a fun frog fact!`, 4000, 0);
		await dialog(dlg, `Did you know frogs eat butterflies?`, 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `You donating ${amount} is a day to remember.`, 4000, 0);
		await dialog(dlg, `I'm learning about other important dates as well!`, 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `What a generous ${amount} donation!`, 4000, 0);
		await dialog(dlg, `I don't know your name, but...`, 4000, 0);
	},
];

const playPunchline: ((dlg: React.RefObject<HTMLSpanElement>, amount: string) => Promise<void>)[] = [
	async (dlg, amount) => {
		await dialog(dlg, 'QT!', 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, 'Unique and special!', 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, 'And I would spend all 9 lives with you.', 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `I'd donate a dollar every time I thought of you.`, 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `I would put U next to I.`, 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, 'Whenever I look at you, everyone else disappears.', 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `But that's before I saw you.`, 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `I still get butterflies in my stomach when I think about you.`, 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `Do you want to be one of them?`, 4000, 0);
	},
	async (dlg, amount) => {
		await dialog(dlg, `I'm sure it is just as beautiful as you are.`, 4000, 0);
	},
];

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

//Styled Elements
//Default
const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	overflow: hidden;
`;

const BG = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
	background-image: url('${homeBackground}');
`;

//Donation Total
const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 46px;
	color: white;

	position: absolute;
	text-shadow: -3px 0 black, 0 -3px black, 3px 0 black, 0 3px black, -3px -3px black, -3px 3px black, 3px -3px black,
		3px 3px black;

	right: 30px;
	bottom: 30px;
`;

//Handsome Frog
const Frog = styled.img`
	position: absolute;
	height: 192px;
	width: 192px;
	left: 25%;
	top: 75%;
	transform: translate(-128px, -128px);
`;

const DialogBox = styled.img<{ DIALOGUE_ACTIVE: boolean }>`
	position: absolute;
	width: 100%;
	height: 100%;
	display: ${({ DIALOGUE_ACTIVE }) => (DIALOGUE_ACTIVE ? 'block' : 'none')};
`;

const DialogueWrapper = styled.div<{ FONT_SIZE: string }>`
	font-family: NikoDialogue;
	font-size: ${({ FONT_SIZE }) => FONT_SIZE || '38px'};
	line-height: 38px;
	position: absolute;
	width: 100%;
	left: 87%;
	top: 45%;
	font-weight: bold;
	overflow-wrap: break-word;
	transform: translate(-50%, -50%) rotate(1deg);
`;

const DialogueText = styled.span`
	color: #4c3573;
	display: inline-block;
	text-align: center;
	padding-right: 500px;
	width: 100%;
	box-sizing: border-box;
`;

const Vignette = styled.img<{ VIGNETTE_STATE: boolean }>`
	position: absolute;
	width: 100%;
	height: 100%;
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
	background-image: url('${vignette}');
	display: ${({ VIGNETTE_STATE }) => (VIGNETTE_STATE ? 'block' : 'none')};
`;

const Glimmer = styled.img<{ VIGNETTE_STATE: boolean; POS_LEFT: string; POS_TOP: string }>`
	position: absolute;
	height: 128px;
	width: 128px;
	left: ${({ POS_LEFT }) => POS_LEFT || '100%'};
	top: ${({ POS_TOP }) => POS_TOP || '100%'};
	display: ${({ VIGNETTE_STATE }) => (VIGNETTE_STATE ? 'block' : 'none')};
`;

//Tamagotchi Body
const slideUp = keyframes`
	from {top: 200%}
	to {top: 40%}
`;

const TamagotchiActiveWrapper = styled.div<{ TAMAGOTCHI_ACTIVE: boolean }>`
	position: absolute;
	height: 384px;
	width: 384px;
	left: 45%;
	top: 40%;
	transform: translate(-128px, -128px);
	display: ${({ TAMAGOTCHI_ACTIVE }) => (TAMAGOTCHI_ACTIVE ? 'block' : 'none')};
	animation: ${slideUp} 1s;
	animation-timing-function: cubic-bezier(0, -2, 0.8, 2);
`;

const TamagotchiInactiveWrapper = styled.div<{ TAMAGOTCHI_ACTIVE: boolean }>`
	position: absolute;
	height: 384px;
	width: 384px;
	left: 45%;
	top: 200%;
	transform: translate(-128px, -128px);
	display: ${({ TAMAGOTCHI_ACTIVE }) => (TAMAGOTCHI_ACTIVE ? 'none' : 'block')};
	animation: ${slideUp} 1s;
	animation-direction: reverse;
	animation-timing-function: cubic-bezier(0, -2, 0.8, 2);
`;

const TamagotchiBody = styled.img`
	position: absolute;
	height: 100%;
	width: 100%;
`;

const TamagotchiKeychain = styled.img`
	position: absolute;
	height: 384px;
	width: 192px;
	left: 71%;
	top: 48%;
`;

const TamagotchiLRButton = styled.img<{ POS_LEFT: string; POS_TOP: string; TRANSFORM: string }>`
	position: absolute;
	height: 44px;
	width: 59px;
	left: ${({ POS_LEFT }) => POS_LEFT || '15%'};
	top: ${({ POS_TOP }) => POS_TOP || '70%'};
	transform: ${({ TRANSFORM }) => TRANSFORM || 'translate(50%, 50%) scaleX(1)'};
`;

const TamagotchiMainButton = styled.img`
	position: absolute;
	height: 66px;
	width: 66px;
	left: 50%;
	top: 80%;
	transform: translate(-33px, -33px);
`;

//Tamagotchi Game Styled
//Game Screen - acts as wrapper for the game
const TamagotchiGameScreen = styled.div`
	position: absolute;
	background-color: #90c3a9;
	height: 160px;
	width: 160px;
	left: 63%;
	top: 61%;
	transform: translate(-128px, -128px);
	overflow: hidden;
`;

const TamagotchiDlgWrapper = styled.div`
	font-family: NikoTamagotchi;
	font-size: 20px;
	line-height: 15px;
	position: absolute;
	width: 100%;
	left: 50%;
	top: 15%;
	overflow-wrap: break-word;
	transform: translate(-50%, -50%);
`;

const TamagotchiDlgText = styled.span`
	color: #20453b;
	display: inline-block;
	text-align: center;
	padding-right: 0px;
	width: 100%;
	box-sizing: border-box;
`;

//Animation to move the screen to the left or the right
const screenSlideRightToCenter = keyframes`
	from {left: 150%}
	to {left: 15%}
`;

const screenSlideCenterToLeft = keyframes`
	from {left: 15%}
	to {left: -150%}
`;

const screenSlideCenterToLeftSpeechBubble = keyframes`
	from {left: 0%}
	to {left: -150%}
`;

//Screen 01, Snail Pet
const SnailPetCenter = styled.img<{ VISIBLE: boolean }>`
	position: absolute;
	height: 68%;
	width: 68%;
	left: 15%;
	top: 34%;
	display: ${({ VISIBLE }) => (VISIBLE ? 'block' : 'none')};
`;

const SnailPetLeft = styled.img<{ VISIBLE: boolean }>`
	position: absolute;
	height: 68%;
	width: 68%;
	left: -150%;
	top: 34%;
	display: ${({ VISIBLE }) => (VISIBLE ? 'block' : 'none')};
	animation: ${screenSlideCenterToLeft} linear 1s;
`;

const SnailPetRight = styled.img<{ VISIBLE: boolean }>`
	position: absolute;
	height: 68%;
	width: 68%;
	left: -150%;
	top: 34%;
	display: ${({ VISIBLE }) => (VISIBLE ? 'block' : 'none')};
	animation: ${screenSlideCenterToLeft} linear 1s;
	animation-direction: reverse;
`;

//Screen 01, Snail Speech Bubble above the snail
//Includes the text as well
const SpeechBubbleCenter = styled.img<{ VISIBLE: boolean }>`
	position: absolute;
	height: 18.75%;
	width: 100%;
	left: 0%;
	top: 20%;
	display: ${({ VISIBLE }) => (VISIBLE ? 'block' : 'none')};
`;

//Screen 02, Snail Pet Food
const FoodCenter = styled.img<{ VISIBLE: boolean }>`
	position: absolute;
	height: 68%;
	width: 68%;
	left: 15%;
	top: 34%;
	display: ${({ VISIBLE }) => (VISIBLE ? 'block' : 'none')};
`;

const FoodCenterToRight = styled.img<{ VISIBLE: boolean }>`
	position: absolute;
	height: 68%;
	width: 68%;
	left: 150%;
	top: 34%;
	display: ${({ VISIBLE }) => (VISIBLE ? 'block' : 'none')};
	animation: ${screenSlideRightToCenter} linear 1s;
	animation-direction: reverse;
`;

const FoodRightToCenter = styled.img<{ VISIBLE: boolean }>`
	position: absolute;
	height: 68%;
	width: 68%;
	left: 150%;
	top: 34%;
	display: ${({ VISIBLE }) => (VISIBLE ? 'block' : 'none')};
	animation: ${screenSlideRightToCenter} linear 1s;
`;

const TamagotchiKitchenCenter = styled.img<{ VISIBLE: boolean }>`
	position: absolute;
	height: 13.33%;
	width: 70%;
	left: 15%;
	top: 5%;
	display: ${({ VISIBLE }) => (VISIBLE ? 'block' : 'none')};
`;

const TamagotchiKitchenCenterToRight = styled.img<{ VISIBLE: boolean }>`
	position: absolute;
	height: 13.33%;
	width: 70%;
	left: 150%;
	top: 5%;
	display: ${({ VISIBLE }) => (VISIBLE ? 'block' : 'none')};
	animation: ${screenSlideRightToCenter} linear 1s;
	animation-direction: reverse;
`;

const TamagotchiKitchenRightToCenter = styled.img<{ VISIBLE: boolean }>`
	position: absolute;
	height: 13.33%;
	width: 70%;
	left: 150%;
	top: 5%;
	display: ${({ VISIBLE }) => (VISIBLE ? 'block' : 'none')};
	animation: ${screenSlideRightToCenter} linear 1s;
`;
