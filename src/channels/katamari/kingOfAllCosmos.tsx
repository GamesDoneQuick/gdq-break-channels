import React, { useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useRafLoop } from 'react-use';
import { GridSprite } from './sprites';
import { clampInt } from './utilities';

export type KingOfAllCosmosProps = {
	xOffset?: number | string;
	yOffset?: number;
	centered?: boolean;
	scale?: number;
	faceSrc: string;
	bgSprite?: {
		src: string;
		tileWidth: number;
		tileHeight: number;
		columns: number;
		rows: number;
		fps?: number;
		scale?: number;
		frameCount?: number;
	};
	mouthSrcs: string[];
	mouthIndex?: number;
	mouthForceWide?: boolean;
	mouthWideSrc?: string;
	mouthWideWidth?: number;
	mouthWideHeight?: number;
	rainbow?: {
		src: string;
		yOffset?: number;
		durationMsIn?: number;
		durationMsOut?: number;
		finalScaleX?: number;
		finalScaleY?: number;
	};
	rainbowActive?: boolean;
	rainbowRunId?: number;
	speaking?: boolean;
	mouthFps?: number;
	mouthAnchorX?: number;
	mouthAnchorY?: number;
	mouthWidth?: number;
	mouthHeight?: number;
	text?: string;
	bubbleMaxWidth?: number;
	bubbleGap?: number;
	className?: string;
	style?: React.CSSProperties;
};

export function KingOfAllCosmos({
	xOffset = 0,
	yOffset = 0,
	centered = false,
	scale = 1,
	faceSrc,
	bgSprite,
	mouthSrcs,
	mouthIndex,
	mouthForceWide = false,
	mouthWideSrc,
	mouthWidth = 96,
	mouthHeight = 48,
	mouthWideWidth,
	mouthWideHeight,
	rainbow,
	rainbowActive = false,
	rainbowRunId = 0,
	speaking = false,
	mouthFps = 10,
	mouthAnchorX = 0.5,
	mouthAnchorY = 0.72,
	text,
	bubbleMaxWidth = 420,
	bubbleGap = 14,
	className,
	style,
}: KingOfAllCosmosProps) {
	const s = Math.max(0.001, scale);

	const [now, setNow] = useState(() => Date.now());
	useRafLoop(() => {
		if (speaking && mouthIndex == null && mouthSrcs.length > 1) setNow(Date.now());
	});

	const mouthCount = mouthSrcs?.length ?? 0;
	let activeMouthIndex = -1;

	if (mouthCount) {
		const maxIndex = mouthCount - 1;

		if (mouthIndex != null) {
			activeMouthIndex = clampInt(mouthIndex, 0, maxIndex);
		} else if (!speaking || mouthCount === 1) {
			activeMouthIndex = 0;
		} else {
			activeMouthIndex = Math.floor((now / 1000) * mouthFps) % mouthCount;
		}
	}

	const mouthSrc = activeMouthIndex >= 0 ? mouthSrcs[activeMouthIndex] : undefined;
	const bubbleVisible = Boolean(text && text.trim().length > 0);

	const baseMouthPos = {
		left: `${mouthAnchorX * 100}%`,
		top: `${mouthAnchorY * 100}%`,
	};

	const mouthStyle = {
		...baseMouthPos,
		width: mouthWidth,
		height: mouthHeight,
	};

	const mouthWideStyle = {
		...baseMouthPos,
		top: '78%',
		width: mouthWideWidth,
		height: mouthWideHeight,
	};

	return (
		<KingRoot
			className={className}
			style={{
				left: xOffset,
				top: yOffset,
				transform: centered ? `translateX(-50%) scale(${s})` : `scale(${s})`,
				['--k-scale' as any]: s,
				...style,
			}}>
			<FaceStack>
				{bgSprite && (
					<BgLayer>
						<GridSprite
							src={bgSprite.src}
							tileWidth={bgSprite.tileWidth}
							tileHeight={bgSprite.tileHeight}
							columns={bgSprite.columns}
							rows={bgSprite.rows}
							fps={bgSprite.fps ?? 10}
							scale={bgSprite.scale ?? 1}
							frameCount={bgSprite.frameCount ?? 0}
							xOffset={-((bgSprite.tileWidth * (bgSprite.scale ?? 1)) / 2)}
							yOffset={-((bgSprite.tileHeight * (bgSprite.scale ?? 1)) / 2)}
							pixelated={false}
						/>
					</BgLayer>
				)}
				<FaceImg src={faceSrc} draggable={false} />
				{mouthForceWide && mouthWideSrc ? (
					<MouthImg src={mouthWideSrc} draggable={false} style={mouthWideStyle} />
				) : (
					mouthSrc && <MouthImg src={mouthSrc} draggable={false} style={mouthStyle} />
				)}

				{rainbow && (
					<RainbowAnchor
						style={{
							left: `${mouthAnchorX * 100}%`,
							top: `${mouthAnchorY * 100}%`,
							marginTop: rainbow.yOffset ?? 0,
						}}>
						<RainbowImg
							key={`rainbow-run-${rainbowRunId}`}
							src={rainbow.src}
							data-active={rainbowActive}
							style={{
								['--rain-in' as any]: `${rainbow.durationMsIn ?? 600}ms`,
								['--rain-out' as any]: `${rainbow.durationMsOut ?? 450}ms`,
								['--rain-sx' as any]: `${rainbow.finalScaleX ?? 1}`,
								['--rain-sy' as any]: `${rainbow.finalScaleY ?? 1}`,
							}}
						/>
					</RainbowAnchor>
				)}

				{bubbleVisible && (
					<BubbleAnchor style={{ marginTop: bubbleGap }}>
						<Bubble style={{ width: 'max-content', maxWidth: bubbleMaxWidth / s }}>
							<BubbleText>{text}</BubbleText>
						</Bubble>
					</BubbleAnchor>
				)}
			</FaceStack>
		</KingRoot>
	);
}

const KingRoot = styled.div`
	position: absolute;
	pointer-events: none;
	transform-origin: top left;
`;

const FaceStack = styled.div`
	position: relative;
	display: inline-block;
`;

const rotateClockwise = keyframes`
	from { transform: translate(-50%, -50%) rotate(0deg); }
	to { transform: translate(-50%, -50%) rotate(360deg); }
`;

const BgLayer = styled.div`
	position: absolute;
	left: 50%;
	top: 50%;
	pointer-events: none;
	z-index: -1;
	animation: ${rotateClockwise} 10s linear infinite;
	transform-origin: center;
`;

const FaceImg = styled.img`
	display: block;
	height: auto;
	width: auto;
`;

const MouthImg = styled.img`
	position: absolute;
	transform: translate(-50%, -50%);
	image-rendering: pixelated;
`;

const RainbowAnchor = styled.div`
	position: absolute;
	transform: translate(-50%, 0);
	pointer-events: none;
	z-index: 5;
`;

const RainbowImg = styled.img`
	display: block;
	transform-origin: top center;
	transform: scale(0.02);
	opacity: 0;

	transition: transform var(--rain-out, 450ms) ease-in, opacity var(--rain-out, 450ms) ease-in;

	&[data-active='true'] {
		transform: scale(var(--rain-sx, 1), var(--rain-sy, 1));
		opacity: 1;
		transition: transform var(--rain-in, 600ms) ease-out, opacity var(--rain-in, 600ms) ease-out;
	}
`;

const BubbleAnchor = styled.div`
	position: absolute;
	left: 50%;
	top: 100%;
	transform: translateX(-50%);
`;

const Bubble = styled.div`
	position: relative;
	display: inline-block;
	background: #ffffff;
	border: 4px solid #000000;
	border-radius: 999px;
	padding: 14px 18px;
	box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25);
	&::before {
		content: '';
		position: absolute;
		top: -18px;
		left: 50%;
		transform: translateX(-50%);

		/* border (black outline) triangle */
		width: 0;
		height: 0;
		border-left: 16px solid transparent;
		border-right: 16px solid transparent;
		border-bottom: 18px solid #000000;
	}

	&::after {
		content: '';
		position: absolute;
		top: -14px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 12px solid transparent;
		border-right: 12px solid transparent;
		border-bottom: 14px solid #ffffff;
	}
`;

const BubbleText = styled.div`
	font-family: gdqpixel, serif;
	font-size: 20px;
	line-height: 1.15;
	color: #000;
	white-space: normal;
	word-break: normal;
	overflow-wrap: break-word;
	text-align: center;
`;
