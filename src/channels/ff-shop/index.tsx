import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useListenFor, useReplicant } from 'use-nodecg';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';
import styled from '@emotion/styled';

import { useRef } from 'react';

import cursor from './assets/cursor.png';

import { getItemFromDonation, getRandomItems, ShopItem } from './shopItems';
import { getRandomTheme, ShopTheme } from './shopThemes';

import TweenNumber from '@gdq/lib/components/TweenNumber';

registerChannel('FFMenu', 97, FFMenu, {
	position: 'bottomRight',
	site: 'Twitter',
	handle: 'dyl_byl',
});

const NUMBER_OF_ITEMS = 5;
const MAXIMUM_SCROLL = 195;
const STARTING_SCROLL_WINDOW = 100;
const MINUMUM_SCROLL = 1;

const currentShopItems = nodecg.Replicant<ShopItem[]>('ff-shop-current', {
	defaultValue: getRandomItems(NUMBER_OF_ITEMS),
});

function randomScrollPosition(): number {
	return MAXIMUM_SCROLL - Math.floor(Math.random() * STARTING_SCROLL_WINDOW);
}

export function FFMenu(props: ChannelProps) {
	const [event] = usePreloadedReplicant<Event>('currentEvent');
	const [total] = useReplicant<Total | null>('total', null);
	const theme = useRef<ShopTheme>(getRandomTheme());
	const scrollPosition = useRef<number>(randomScrollPosition());

	useListenFor('donation', (donation: FormattedDonation) => {
		const newItem = getItemFromDonation(donation);
		// eslint is mad that currentShopItems.value can be undefined, cannot use spread operator
		const oldShopItems = currentShopItems.value || [];
		const newShopItems = [newItem, ...oldShopItems];
		newShopItems.splice(-1);
		currentShopItems.value = newShopItems;
		if (scrollPosition.current <= MINUMUM_SCROLL) {
			scrollPosition.current = randomScrollPosition();
		} else {
			scrollPosition.current = scrollPosition.current - 1;
		}
	});

	const formatCurrency = (val: number) =>
		val.toLocaleString('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0,
		});

	return (
		<Container>
			<Background />
			<Container>
				<Column>
					<Row style={{ height: '20%' }}>
						<MenuCard gradient={theme.current.gradient}>What would you like to donate?</MenuCard>
						<MenuCard gradient={theme.current.gradient} style={{ justifyContent: 'center', width: '45%' }}>
							{' '}
							Donation Shop
						</MenuCard>
					</Row>
					<Row style={{ height: '20%' }}>
						<MenuCard gradient={theme.current.gradient}>
							<ItemDescription highlightColor={theme.current.highlightColor}>
								{currentShopItems.value != undefined && currentShopItems.value[0].description}
							</ItemDescription>
						</MenuCard>
					</Row>
					<Row>
						<MenuCard gradient={theme.current.gradient} style={{ padding: '0' }}>
							<Row style={{ padding: '8px 0px 8px 56px' }}>
								<Column style={{ flexDirection: 'column-reverse', alignSelf: 'center', height: '92%' }}>
									{currentShopItems.value != undefined &&
										currentShopItems.value.map((item, i) => (
											<ItemRow key={`${item.id}-${i}`}>
												<SpriteContainer>
													<ItemSprite src={item.sprite} />
												</SpriteContainer>
												<ItemName>{item.name}</ItemName>
												{item.donationAmount != undefined && (
													<ItemAmount>{formatCurrency(item.donationAmount)}</ItemAmount>
												)}
											</ItemRow>
										))}
								</Column>
								<ScrollBar scrollbarColor={theme.current.scrollbarColor}>
									<ScrollBlock scrollPosition={scrollPosition.current} />
								</ScrollBar>
							</Row>
						</MenuCard>
						<MenuCard
							gradient={theme.current.gradient}
							style={{ width: '40%', alignItems: 'start', padding: '16px 8px 8px 16px' }}>
							<Column>
								<DonationText highlightColor={theme.current.highlightColor}>
									Gil Raised for
								</DonationText>
								<DonationTextBigger highlightColor={theme.current.highlightColor}>
									{event.beneficiary}
								</DonationTextBigger>
								<TotalEl>
									$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
								</TotalEl>
							</Column>
						</MenuCard>
					</Row>
				</Column>
			</Container>
			<CursorShadow src={cursor} />
			<Cursor src={cursor} />
		</Container>
	);
}

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	overflow: hidden;
	font-family: 'Reactor7';
	text-shadow: 2px 2px 1px rgba(0, 0, 0, 1);
`;

const Background = styled.div`
	position: absolute;
	width: 100%;
	height: 100%
	padding: 0;
	margin: 0;
	background-color: rgb(0,1,23);
`;

const MenuCard = styled.div<{ gradient: string }>`
	width: 100%;
	height: auto;
	padding: 0px 8px 0px 32px;
	margin: 7px;
	border-radius: 2px;
	box-shadow: 0 0 0 2px rgba(0, 1, 23, 1), 0 0 0 4px rgba(255, 255, 255, 1), 0 0 0 6px rgba(187, 187, 187, 1);
	background-color: rgb(0, 1, 23);
	background: ${({ gradient }) => gradient};
	display: flex;
	align-items: center;
	font-size: 25px;
`;

const Column = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
`;

const Row = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: row;
`;

const ItemRow = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
`;

const SpriteContainer = styled.div`
	width: 25px;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 0 12px 0 0px;
`;

const ItemSprite = styled.img<{ src: string | undefined }>`
	transform: scale(${({ src }) => (src != undefined && src.includes('materia') ? '2.5' : '1.75')});
	image-rendering: pixelated;
	image-rendering: -moz-crisp-edges;
	image-rendering: crisp-edges;
`;

const ItemName = styled.div`
	width: auto;
	height: 100%;
	flex-grow: 1;
	display: flex;
	judtify-content: center;
	align-items: center;
	font-size: 28px;
	padding-top: 2px;
`;

const ItemAmount = styled.div`
	height: 100%;
	text-align: right;
	display: flex;
	judtify-content: center;
	align-items: center;
	justify-self: end;
	font-family: gdqpixel;
	font-size: 16px;
`;

const ItemDescription = styled.div<{ highlightColor: string }>`
	color: ${({ highlightColor }) => highlightColor};
	font-weight: 900;
`;

const ScrollBar = styled.div<{ scrollbarColor: string }>`
	position: relative;
	width: 3%;
	height: 100%
	padding: 0;
	margin-left: 56px;
	right: 0;
	background-color: ${({ scrollbarColor }) => scrollbarColor};
	display: flex;
	flex-direction: column;
	justify-content: end;
`;

const ScrollBlock = styled.div<{ scrollPosition: number }>`
	position: relative;
	width: calc(100% - 2px);
	height: 10%;
	margin-top: 0;
	margin-bottom: ${({ scrollPosition }) => scrollPosition}px;
	right: 0;
	background-color: rgba(159, 162, 163, 1);
	border: 2px outset rgba(215, 215, 215, 1);
`;

const DonationText = styled.div<{ highlightColor: string }>`
	color: ${({ highlightColor }) => highlightColor};
	font-weight: 900;
	font-size: 25px;
`;

const DonationTextBigger = styled.div<{ highlightColor: string }>`
	color: ${({ highlightColor }) => highlightColor};
	font-weight: 900;
	font-size: 40px;
	line-height: 0.7;
`;

const CursorShadow = styled.img`
	position: absolute;
	left: 12px;
	bottom: 10px;
	height: 12px;
	width: 44px;
	transform: scaleY(1);
	filter: brightness(0%) opacity(0.7) blur(1px);
	image-rendering: pixelated;
	image-rendering: -moz-crisp-edges;
	image-rendering: crisp-edges;
`;

const Cursor = styled.img`
	position: absolute;
	left: 8px;
	bottom: 18px;
	image-rendering: pixelated;
	image-rendering: -moz-crisp-edges;
	image-rendering: crisp-edges;
`;

const TotalEl = styled.div`
	margin-top: 16px;
	font-family: gdqpixel;
	font-size: 36px;
	color: white;
`;
