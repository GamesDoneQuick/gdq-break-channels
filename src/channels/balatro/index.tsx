import { useState, useEffect } from 'react';
import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';
import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import gdq_deck from './assets/gdq_deck.png';
import gdq_logo from './assets/gdq.png';
import pcf_logo from './assets/pcf2.png';

// Register channel
registerChannel('Balatro', 42, Balatro, {
  position: 'topRight',
  site: 'GitHub',
  handle: 'therafescv',
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

function Balatro(props: ChannelProps) {
	// Replicants
	const [total] = useReplicant<Total | null>('total', null);
	const [dono, setDono] = useReplicant<FormattedDonation | null>('rawAmount', null);
	const [cards, setCards] = useState<any[]>([]); // Array to hold multiple cards and their states
	const [donationCount, setDonationCount] = useState(0); // Track the number of donations
  
	// Event listener for new donation
	useListenFor('donation', (donation: FormattedDonation) => {
	  console.log('New donation received:', donation);
  
	  if (donation) {
		setDono({ ...donation, rawAmount: donation.rawAmount });
		setDonationCount(prevCount => prevCount + 1);
  
		// Generate a random suit for the new card
		const randomSuit = suits[Math.floor(Math.random() * suits.length)];
		// Generate random X position (30% to 90% of canvas width)
		const randomX = Math.floor(Math.random() * 60) + 30; 
  
		// Add the new card to the list of cards with an expiration timer
		setCards(prevCards => [
		  ...prevCards,
		  {
			id: Date.now(), // Unique ID for each card
			suit: randomSuit,
			donationAmount: donation.rawAmount,
			xPos: randomX,
		  }
		]);
	  } else {
		console.log('dono is null, cannot update');
	  }
	});
  
	useEffect(() => {
	  const timers = cards.map(card =>
		setTimeout(() => {
		  setCards(prevCards => prevCards.filter(c => c.id !== card.id));
		}, 3000)
	  );
  
	  return () => {
		timers.forEach(timer => clearTimeout(timer));
	  };
	}, [cards]);
  
	// Function to handle the end of the animation
	const handleAnimationEnd = (cardId: number, animationName: string) => {
	  if (animationName === "slideOut") {
		setCards(prevCards => prevCards.filter(card => card.id !== cardId));
	  }
	};
  
	return (
	  <Container>
		<LiquifiedTextWrapper>
		  <svg width="0" height="0">
			<filter id="liquify-filter">
			  <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" result="turbulence" />
			  <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="500" />
			</filter>
		  </svg>
		  <LiquifiedText>BalatroGDQ</LiquifiedText>
		</LiquifiedTextWrapper>
  
		<LeftBar>
		  <BoxWrapper>
			<RoundBox darkOrange>
			  AGDQ 2025
			</RoundBox>
			<LargeRoundBox darkOrange>
			<Logo src={pcf_logo} alt="PCF Logo" />
			  Benefitting the<br></br>Prevent Cancer Foundation
			</LargeRoundBox>
			<RoundBox>
			  <LeftSideText>Score</LeftSideText>
			  <InnerBox>
				<PokerChip />
				<TweenNumber value={total?.raw ?? 0} />
			  </InnerBox>
			</RoundBox>
			<LargeRoundBox>
			  <BlueBox className={donationCount > 0 && donationCount % 10 === 0 ? "flame" : ""}>Save</BlueBox>
			  <Xbox> X </Xbox>
			  <RedBox className={donationCount > 0 && donationCount % 10 === 0 ? "flame" : ""}>Kill</RedBox>
			</LargeRoundBox>
		  </BoxWrapper>
		</LeftBar>
  
		{/* Render all cards */}
		{cards.map(card => (
		  <Card
			key={card.id}
			color={getSuitColor(card.suit, card.donationAmount)}
			cardStartX={card.xPos}
			onAnimationEnd={(e) => handleAnimationEnd(card.id, e.animationName)} // Listen for animation end and detect which animation ended
		  >
			<CardTopLeft color={getSuitColor(card.suit, card.donationAmount)}>
			  {card.suit}
			</CardTopLeft>
			<CardBottomRight color={getSuitColor(card.suit, card.donationAmount)}>
			  {card.suit}
			</CardBottomRight>
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
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  background-color: rgb(67, 137, 114); /* Medium green background */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const LiquifiedText = styled.div`
  position: absolute;
  z-index: 0; /* Set a lower value to move it behind other elements */
  top: 50%; /* Center vertically */
  left: 50%; /* Center horizontally */
  transform: translate(-50%, -50%);
  font-family: 'Press Start 2P';
  font-size: 500px;
  font-weight: bold;
  color: rgba(51, 51, 51, 0.3);
  filter: url(#liquify-filter); /* Apply SVG filter */
//   animation: liquifyAnimation 6s infinite;

// @keyframes liquifyAnimation {
//   0%, 100% {
//     transform: translate(-50%, -50%) rotate(0deg) scale(1);
//   }
//   15% {
//     transform: translate(-50%, -50%) rotate(5deg) scale(1.05); /* Slight wobble with scaling up */
//   }
//   30% {
//     transform: translate(-50%, -50%) rotate(-5deg) scale(0.95); /* Slight wobble with scaling down */
//   }
//   45% {
//     transform: translate(-50%, -50%) rotate(5deg) scale(1.05); /* Wobble with scaling up */
//   }
//   60% {
//     transform: translate(-50%, -50%) rotate(-5deg) scale(0.95); /* Wobble with scaling down */
//   }
//   75% {
//     transform: translate(-50%, -50%) rotate(3deg) scale(1.02); /* Slight wobble with smaller scaling */
//   }
//   90% {
//     transform: translate(-50%, -50%) rotate(-3deg) scale(0.98); /* Slight wobble with smaller scaling */
//   }
// }
// @keyframes liquifyAnimation {
//   0% {
//     transform: translate(-50%, -50%) rotate(0deg) scale(3); /* Start at 300% */
//   }
//   50% {
//     transform: translate(-50%, -50%) rotate(180deg) scale(2); /* Rotate halfway while scaling down to 100% */
//   }
//   100% {
//     transform: translate(-50%, -50%) rotate(360deg) scale(3); /* Full rotation back to 300% */
//   }
// }
// @keyframes liquifyAnimation {
//   0% {
//     transform: translate(-50%, -50%) rotate(0deg) scale(1.2); /* Slightly scaled and at initial position */
//   }
//   25% {
//     transform: translate(-48%, -52%) rotate(10deg) scale(1.3); /* Slight wobble to top-right with scaling */
//   }
//   50% {
//     transform: translate(-52%, -48%) rotate(-10deg) scale(1.1); /* Wobble to bottom-left with slight shrink */
//   }
//   75% {
//     transform: translate(-51%, -49%) rotate(5deg) scale(1.25); /* Wobble back to slightly off-center */
//   }
//   100% {
//     transform: translate(-50%, -50%) rotate(0deg) scale(1.2); /* Back to original position */
//   }
// }
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

const LiquifiedTextWrapper = styled.div`
  position: absolute;
  z-index: -1; /* Keep this below cards and other elements */
  width: 100%;
  height: 100%;
`;

const LeftBar = styled.div`
  position: absolute;
  width: 20%;
  height: 100%;
  background-color: rgb(50, 50, 50);
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
  background-color: ${(props) => (props.darkOrange ? 'rgb(160, 102, 0)' : 'rgb(40, 40, 40)')};
  border-radius: 12px;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  font-weight: bold;
`;

const LargeRoundBox = styled.div<{ darkOrange?: boolean }>`
  width: 80%;
  height: 70px;
  background-color: ${(props) =>
    props.darkOrange ? 'rgba(160, 102, 0, 0.6)' : 'rgb(40, 40, 40)'};
  border-radius: 12px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`;

const LeftSideText = styled.div`
  font-family: 'Press Start 2P';
  font-size: 16px;
  color: white;
  text-align: left;
  width: auto;
  padding-left: 0px;
  margin-right: 10px;
`;

const InnerBox = styled.div`
  width: 85%;
  height: 40px;
  background-color: rgb(50, 50, 50);
  border-radius: 12px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: white;
  font-family: 'Press Start 2P';
  font-size: 16px;
  padding-left: 10px;
  gap: 10px;
`;

const PokerChip = styled.div`
  width: 20px;
  height: 20px;
  background-color: rgb(206, 204, 174);
  border-radius: 50%;
  border: 1px dashed rgb(98, 18, 172);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-family: gdqpixel;
  font-size: 14px;
`;

const RedBox = styled.div`
  width: 80%;
  height: 40px;
  background-color: rgb(255, 68, 64);
  border-radius: 12px;
  display: flex;
  justify-content: left;
  align-items: center;
  color: white;
  font-family: 'Press Start 2P';
  font-size: 18px;
  text-align: center;
  box-shadow: 0px 4px 8px rgb(156, 41, 30);
  margin-top: 40px;
  margin-bottom: 20px;
  font-weight: bold;
  padding-left: 5px;
`;

const Xbox = styled.div`
  width: auto;
  height: auto;
  color: rgb(255, 68, 64);
  font-family: 'Press Start 2P';
  font-size: 22px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 5px;
  padding-right: 5px;
  margin-top: 40px;
  margin-bottom: 20px;
  font-weight: bold;
`;

const BlueBox = styled.div`
  width: 80%;
  height: 40px;
  background-color: rgb(0, 148, 246);
  border-radius: 12px;
  display: flex;
  justify-content: right;
  align-items: center;
  color: white;
  font-family: 'Press Start 2P';
  font-size: 18px;
  text-align: center;
  box-shadow: 0px 4px 8px rgb(0, 90, 157);
  margin-top: 40px;
  margin-bottom: 20px;
  font-weight: bold;
  padding-right: 5px;
`;

// Card with animation for coming up from below and moving off to the right
const Card = styled.div<{ color: string; cardStartX: number }>`
  width: 75px;
  height: 90px;
  background-color: white;
  border-radius: 8px;
  border: 2px solid white;
  position: absolute;
  bottom: -100px; /* Start from below the canvas */
  left: ${(props) => `${props.cardStartX}%`}; /* Horizontal start position */
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.color};
  font-family: 'Press Start 2P';
  font-size: 28px;
  font-weight: bold;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3); /* Drop shadow: 0px offset horizontally, 4px vertically, 8px blur, 30% opacity */
  z-index: 1;

  /* Entering animation */
  animation: slideIn 2s forwards, slideOut 4s 2s;

  /* Keyframes for entering the screen */
  @keyframes slideIn {
    0% {
      bottom: -100px;
      transform: translateX(0);
    }
    100% {
      bottom: 60px; /* New final position after entering */
      transform: translateX(0); /* Maintain horizontal position during entry */
    }
  }

  /* Keyframes for sliding out to the right */
  @keyframes slideOut {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(100vw); /* Move all the way to the right off-screen */
    }
  }
`;

const CardTopLeft = styled.div<{ color: string }>`
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 24px;
  font-family: 'Press Start 2P';
  color: ${(props) => props.color};
`;

const CardBottomRight = styled.div<{ color: string }>`
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 24px;
  font-family: 'Press Start 2P';
  color: ${(props) => props.color};
`;

const StackedImage = styled.img`
  position: absolute;
  width: 100px; /* Adjust width as needed */
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
    transparent,
    transparent 4px,
    rgba(0, 0, 0, 0.1) 4px,
    rgba(0, 0, 0, 0.1) 5px
  ); /* Creates 1px lines with 4px spacing */
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid lightgreen;
  object-fit: cover; /* Makes sure the image fits into the circle without distorting */
  margin-left: 15px; /* Adds a small gap between the image and the text */
  margin-right: 10px; /* Adds a small gap between the image and the text */
  transform: translateX(-10px);  /* Shifts the image to the left */
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.4);
`;

export default Balatro;
