import { useState, useEffect } from 'react';
import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import gdq_deck from './assets/gdq_deck.png';

interface LogoProps {
	beneficiaryShort: string | null;
}

// Register channel
registerChannel('Balatro', 42, Balatro, {
	position: 'topRight',
	site: 'GitHub',
	handle: 'therafescv, dylbyl',
});

const suits = ['♦', '♥', '♠', '♣'];

const getSuitColor = (suit: string, donationAmount: number) => {
	if (donationAmount >= 500) {
		return 'purple';
	} else if (donationAmount >= 250) {
		return 'green';
	} else {
		switch (suit) {
			case '♦':
			case '♥':
				return 'red';
			case '♠':
			case '♣':
				return 'black';
			default:
				return 'black';
		}
	}
};

const DynamicLargeRoundBox = ({ beneficiaryShort }: { beneficiaryShort: string | null }) => {
	let description;

	switch (beneficiaryShort) {
		case 'PCF':
			description = 'Benefitting the\nPrevent Cancer Foundation';
			break;
		case 'MSF':
			description = 'Benefitting\nDoctors Without Borders';
			break;
		case 'Malala Fund':
			description = 'Benefitting the\nMalala Fund';
			break;
		default:
			description = 'Games Done Quick';
	}

	return (
		<LargeRoundBox darkOrange>
			<LeftSideText>{description}</LeftSideText>
		</LargeRoundBox>
	);
};

function Balatro(props: ChannelProps) {
	// Replicants
	const [total] = useReplicant<Total | null>('total', null);
	const [dono, setDono] = useReplicant<FormattedDonation | null>('rawAmount', null);
	const [cards, setCards] = useState<any[]>([]); // Array to hold multiple cards and their states
	const [donationCount, setDonationCount] = useState(0); // Track the number of donations
	const currentEvent = nodecg.Replicant<Event>('currentEvent');
	const [beneficiaryShort, setBeneficiaryShort] = useState<string | null>(null);
	const [shortname, setShortname] = useState<string>('');

	// Event listener for new donation
	useListenFor('donation', (donation: FormattedDonation) => {
		console.log('New donation received:', donation);
		console.log(currentEvent.value);

		if (donation) {
			setDono({ ...donation, rawAmount: donation.rawAmount });
			setDonationCount((prevCount) => prevCount + 1);

			// Generate a random suit for the new card
			const randomSuit = suits[Math.floor(Math.random() * suits.length)];
			// Generate random X position (30% to 90% of canvas width)
			const randomX = Math.floor(Math.random() * 60) + 30;
			const randomY = Math.floor(Math.random() * 100);

			// Add the new card to the list of cards with an expiration timer
			setCards((prevCards) => [
				...prevCards,
				{
					id: Date.now(), // Unique ID for each card
					suit: randomSuit,
					donationAmount: donation.rawAmount,
					xPos: randomX,
					yPos: randomY,
				},
			]);
		} else {
			console.log('dono is null, cannot update');
		}
	});

	useEffect(() => {
		const timers = cards.map((card) =>
			setTimeout(() => {
				setCards((prevCards) => prevCards.filter((c) => c.id !== card.id));
			}, 3000),
		);

		return () => {
			timers.forEach((timer) => clearTimeout(timer));
		};
	}, [cards]);

	useEffect(() => {
		const currentEventReplicant = nodecg.Replicant<Event>('currentEvent');
		currentEventReplicant.on('change', (newValue) => {
			// Extract 'beneficiaryShort' from the event data
			setBeneficiaryShort(newValue?.beneficiaryShort || null);
		});
	}, []);

	useEffect(() => {
		const currentEventReplicant = nodecg.Replicant<Event>('currentEvent');
		// Listen for changes to the replicant
		currentEventReplicant.on('change', (newValue) => {
			if (newValue?.shortname) {
				// Extract the shortname and format it (add a space before the numbers)
				const formattedShortname = newValue.shortname.replace(/(\D)(\d)/, '$1 $2');
				setShortname(formattedShortname); // Update state with the formatted shortname
			}
		});
	}, []);

	// Function to handle the end of the animation
	const handleAnimationEnd = (cardId: number, animationName: string) => {
		if (animationName === 'slideOut') {
			setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
		}
	};

	return (
		<Container>
			<LiquifiedTextWrapper>
				<svg width="0" height="0">
					<filter id="liquify-filter">
						<feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="4" result="turbulence" />
						<feDisplacementMap in="SourceGraphic" in2="turbulence" scale="300" />
					</filter>
				</svg>
				<LiquifiedText>
					<TextDark>BalatroGDQ</TextDark>
					<TextLight>BalatroGDQ</TextLight>
				</LiquifiedText>
			</LiquifiedTextWrapper>

			<LeftBar>
				<BoxWrapper>
					<RoundBox darkOrange>
						<EventTitle>{shortname || '...'}</EventTitle>
					</RoundBox>
					<DynamicLargeRoundBox beneficiaryShort={beneficiaryShort} />
					<RoundBox>
						<LeftSideText>Score</LeftSideText>
						<InnerBox>
							<PokerChip />
							<TweenNumber value={total?.raw ?? 0} />
						</InnerBox>
					</RoundBox>
					<LargeRoundBox style={{ paddingBottom: '5px' }}>
						<Column>
							<LeftSideText>Animals</LeftSideText>
							<Row style={{ alignSelf: 'end', justifySelf: 'end' }}>
								<BlueBox className={donationCount > 0 && donationCount % 10 === 0 ? 'flame' : ''}>
									SAVE
								</BlueBox>
								<Xbox> X </Xbox>
								<RedBox className={donationCount > 0 && donationCount % 10 === 0 ? 'flame' : ''}>
									KILL
								</RedBox>
							</Row>
						</Column>
					</LargeRoundBox>
				</BoxWrapper>
			</LeftBar>

			{/* Render all cards */}
			{cards.map((card) => (
				<Card
					key={card.id}
					color={getSuitColor(card.suit, card.donationAmount)}
					cardStartX={card.xPos}
					cardStartY={card.yPos}
					onAnimationEnd={(e) => handleAnimationEnd(card.id, e.animationName)} // Listen for animation end and detect which animation ended
				>
					<CardTopLeft color={getSuitColor(card.suit, card.donationAmount)}>{card.suit}</CardTopLeft>
					<CardBottomRight color={getSuitColor(card.suit, card.donationAmount)}>{card.suit}</CardBottomRight>
					<TweenNumber value={card.donationAmount} />
				</Card>
			))}
			{/* Stack the images */}
			{Array.from({ length: 12 }).map((_, index) => (
				<StackedImage
					key={index}
					src={gdq_deck}
					alt="GDQ Deck"
					style={{
						bottom: `${10 + index * 1.01}px`, // Adjust vertical offset
						right: `${50 - index * 1.01}px`, // Adjust horizontal offset
					}}
				/>
			))}
			<ScanLinesOverlay />
		</Container>
	);
}

// Container with green background
const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	background-color: rgb(63, 113, 88); /* Medium green background */
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1;
`;

const LiquifiedText = styled.div`
	font-family: 'Arial';
	font-size: 500px;
	text-align: center;
	vertical-align: middle;
	filter: url(#liquify-filter); /* Apply SVG filter */
	animation: scaleAndResize 90s ease-in-out infinite; /* Animation applied here */

	@keyframes scaleAndResize {
		0% {
			transform: translate(-50%, -50%) scale(1.2); /* Start at normal size */
			font-size: 500px; /* Initial font size */
		}
		25% {
			transform: translate(-50%, -50%) scale(1.6); /* Slightly larger in the middle */
			font-size: 600px; /* Font size increases */
		}
		50% {
			transform: translate(-50%, -50%) scale(1.8); /* Slightly larger in the middle */
			font-size: 700px; /* Font size increases */
		}
		75% {
			transform: translate(-50%, -50%) scale(1.6); /* Slightly larger in the middle */
			font-size: 600px; /* Font size increases */
		}
		100% {
			transform: translate(-50%, -50%) scale(1.2); /* Return to original size */
			font-size: 500px; /* Font size returns to original */
		}
	}
`;

const TextLight = styled.div`
	position: absolute;
	z-index: 0; /* Set a lower value to move it behind other elements */
	top: 50%; /* Center vertically */
	left: 50%; /* Center horizontally */
	transform: translate(-50%, -50%);
	font-weight: 100;
	color: rgba(180, 240, 210, 0.1);
`;

const TextDark = styled.div`
	position: absolute;
	z-index: 0; /* Set a lower value to move it behind other elements */
	top: 50%; /* Center vertically */
	left: 50%; /* Center horizontally */
	transform: translate(-50%, -50%);
	font-weight: 800;
	color: rgba(44, 93, 64, 0.7);
	text-shadow: -16px -16px 0 rgba(38, 85, 55, 0.9), 16px -16px 0 rgba(38, 85, 55, 0.9),
		-16px 16px 0 rgba(38, 85, 55, 0.9), 16px 16px 0 rgba(38, 85, 55, 0.9);
`;

const LiquifiedTextWrapper = styled.div`
	position: absolute;
	z-index: -1; /* Keep this below cards and other elements */
	width: 100%;
	height: 100%;
`;

const LeftBar = styled.div`
	position: absolute;
	width: 23%;
	height: 100%;
	background-color: rgb(41, 51, 52);
	left: 2%;
	border-left: 2px solid rgb(160, 102, 0);
	border-right: 2px solid rgb(160, 102, 0);
	display: flex;
	justify-content: center;
	align-items: flex-start;
	padding-top: 20px;
`;

const BoxWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	width: 100%;
`;

const RoundBox = styled.div<{ darkOrange?: boolean }>`
	width: 80%;
	background-color: ${(props) => (props.darkOrange ? 'rgb(160, 102, 0)' : 'rgb(23, 34, 36)')};
	border-radius: 12px;
	padding: 10px;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: row;
	font-weight: bold;
	border-bottom-width: 3px;
	border-bottom-style: solid;
	border-bottom-color: ${(props) => (props.darkOrange ? 'rgb(110, 60, 20)' : 'rgba(3, 10, 18)')};
`;

const LargeRoundBox = styled.div<{ darkOrange?: boolean }>`
	width: 80%;
	height: 70px;
	background-color: ${(props) => (props.darkOrange ? 'rgba(160, 102, 0, 0.6)' : 'rgb(23, 34, 36)')};
	border-radius: 12px;
	padding: 10px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex-direction: row;
	border-bottom-width: 3px;
	border-bottom-style: solid;
	border-bottom-color: ${(props) => (props.darkOrange ? 'rgba(70, 45, 45, 0.7)' : 'rgba(3, 10, 18)')};
`;

const Row = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
`;

const Column = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
`;

const EventTitle = styled.div`
	font-family: 'Balatro';
	font-size: 20px;
	text-shadow: 0px 2px 1px rgba(0, 0, 0, 0.5);
	letter-spacing: 2px;
	color: white;
	text-align: left;
	width: auto;
	padding-left: 0px;
	margin-right: 10px;
`;

const LeftSideText = styled.div`
	font-family: 'Balatro';
	font-size: 16px;
	text-shadow: 0px 2px 1px rgba(0, 0, 0, 0.5);
	letter-spacing: px;
	color: white;
	text-align: left;
	width: auto;
	margin-left: 10px;
	margin-right: 10px;
	line-height: 125%;
`;

const InnerBox = styled.div`
	width: 85%;
	height: 40px;
	background-color: rgb(41, 51, 52);
	border-radius: 12px;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	color: white;
	font-family: 'Balatro';
	font-size: 16px;
	padding-left: 10px;
	gap: 10px;
`;

const PokerChip = styled.div`
	width: 10px;
	height: 10px;
	background-color: rgb(226, 224, 194);
	border-radius: 50%;
	border: 3px dashed rgb(98, 18, 172);
	display: flex;
	justify-content: center;
	align-items: center;
	color: white;
	font-family: Balatro;
	font-size: 14px;
`;

const RedBox = styled.div`
	width: 80%;
	height: 40px;
	background-color: rgb(255, 68, 64);
	border-radius: 8px;
	display: flex;
	justify-content: left;
	align-items: center;
	color: white;
	font-family: 'Balatro';
	font-size: 18px;
	text-shadow: 0px 2px 1px rgba(0, 0, 0, 0.5);
	letter-spacing: 2px;
	text-align: center;
	box-shadow: 0px 4px 8px rgba(156, 41, 30, 0.5);
	font-weight: bold;
	padding-left: 5px;
	border-bottom-width: 3px;
	border-bottom-style: solid;
	border-bottom-color: rgb(156, 41, 30);
`;

const Xbox = styled.div`
	width: auto;
	height: auto;
	color: rgb(255, 68, 64);
	font-family: 'Balatro';
	font-size: 22px;
	text-shadow: 0px 2px 1px rgba(0, 0, 0, 0.5);
	text-align: center;
	display: flex;
	justify-content: center;
	align-items: center;
	padding-left: 5px;
	padding-right: 5px;
	padding-bottom: 3px;
	font-weight: bold;
`;

const BlueBox = styled.div`
	width: 80%;
	height: 40px;
	background-color: rgb(0, 148, 246);
	border-radius: 8px;
	display: flex;
	justify-content: right;
	align-items: center;
	color: white;
	font-family: 'Balatro';
	font-size: 18px;
	text-shadow: 0px 2px 1px rgba(0, 0, 0, 0.5);
	letter-spacing: 2px;
	text-align: center;
	box-shadow: 0px 4px 8px rgba(0, 90, 157, 0.5);
	font-weight: bold;
	padding-right: 5px;
	border-bottom-width: 3px;
	border-bottom-style: solid;
	border-bottom-color: rgb(0, 90, 157);
`;

// Card with animation for coming up from below and moving off to the right
const Card = styled.div<{ color: string; cardStartX: number; cardStartY: number }>`
	width: 95px;
	height: 130px;
	background-color: white;
	border-radius: 8px;
	border: 1px solid white;
	position: absolute;
	bottom: ${(props) => `${props.cardStartY - 250}px`}; /* Start from below the canvas */
	left: ${(props) => `${props.cardStartX}%`}; /* Horizontal start position */
	display: flex;
	justify-content: center;
	align-items: center;
	color: ${(props) => props.color};
	font-family: 'Balatro';
	font-size: 28px;
	font-weight: bold;
	border: solid rgba(0, 0, 0, 0.1);
	border-width: 1px 2px 2px 1px;
	box-shadow: 1px 12px 1px rgba(0, 0, 0, 0.4); /* Drop shadow: 0px offset horizontally, 4px vertically, 8px blur, 30% opacity */
	z-index: 1;

	/* Entering animation */
	animation: ease-out slideIn 0.2s forwards, ease-in slideOut 0.4s 1s;

	/* Keyframes for entering the screen */
	@keyframes slideIn {
		0% {
			transform: translateY(0) translateX(0);
		}
		100% {
			transform: translateY(-40vh) translateX(0); /* Maintain horizontal position during entry */
		}
	}

	/* Keyframes for sliding out to the right */
	@keyframes slideOut {
		0% {
			transform: translateY(-40vh) translateX(0);
		}
		100% {
			transform: translateY(-40vh) translateX(100vw) skew(40deg, 0deg); /* Move all the way to the right off-screen */
		}
	}
`;

const CardTopLeft = styled.div<{ color: string }>`
	position: absolute;
	top: -5px;
	left: 5px;
	font-size: 32px;
	font-family: 'Balatro';
	color: ${(props) => props.color};
`;

const CardBottomRight = styled.div<{ color: string }>`
	position: absolute;
	bottom: 8px;
	right: 5px;
	font-size: 32px;
	font-family: 'Balatro';
	color: ${(props) => props.color};
`;

const StackedImage = styled.img`
	position: absolute;
	width: 150px; /* Adjust width as needed */
	height: auto; /* Maintain aspect ratio */
	z-index: 0; /* Stack them above the background but below other elements */
	opacity: 0.8; /* Optional: Adjust opacity for a layered effect */
`;

const ScanLinesOverlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none; /* Allow clicks to pass through */
	z-index: 9999; /* High value to place it above all content */
	background: repeating-linear-gradient(
		transparent 1px,
		transparent 3px,
		rgba(100, 0, 0, 0.1) 3px,
		rgba(0, 50, 100, 0.1) 5px
	); /* Creates 1px lines with 4px spacing */
	filter: blur(0.8px);
`;

export default Balatro;
