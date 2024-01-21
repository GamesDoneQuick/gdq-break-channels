import { useEffect, useReducer, useRef, useState } from 'react';
import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { ChannelProps, registerChannel } from '../channels';
import { useListenFor, useReplicant } from 'use-nodecg';
import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';

import { Face } from './Face';
import { Tile } from './Tile';
import { TILE_DIMENSION, GRID_COLUMNS, GRID_ROWS, TILE_MAP, MINE_CHANCE, MIN_REVEAL_DONATION } from './constants';
import { createTileCluster, getTileRevealThreshold, random, randomFromArray, splitTileIndex } from './utils';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';
import { cloneDeep } from 'lodash';
import type { FaceType, GridState, TileData } from './types';

registerChannel('Minesweeper', 132, Minesweeper, {
	position: 'bottomRight',
	handle: 'rshig',
});

function generateInitialGridState(): GridState {
	const state: GridState = { grid: [], mines: [], nonMines: [] };
	for (let i = 0; i < GRID_ROWS; i++) {
		state.grid[i] = [];
		for (let j = 0; j < GRID_COLUMNS; j++) {
			const isMine = Math.random() < MINE_CHANCE;
			const id = `${i}:${j}`;
			state.grid[i][j] = {
				id,
				isMine,
				tileType: TILE_MAP.HIDDEN,
			};
			if (isMine) {
				state.mines.push(id);
			} else {
				state.nonMines.push(id);
			}
		}
	}
	return state;
}

const stateReplicant = nodecg.Replicant<GridState>('minesweeper-state', {
	defaultValue: generateInitialGridState(),
	persistent: true,
});

const actions = {
	RESET: 'reset',
	FLAG_TILE: 'flag',
	REVEAL_TILES: 'reveal',
	QUESTION_TILE: 'question',
} as const;

type GridAction =
	| { type: typeof actions.FLAG_TILE }
	| { type: typeof actions.RESET }
	| { type: typeof actions.REVEAL_TILES; donationAmount: number }
	| { type: typeof actions.QUESTION_TILE };

function gridReducer(state: GridState, action: GridAction) {
	switch (action.type) {
		case actions.RESET: {
			const newState = generateInitialGridState();
			stateReplicant.value = newState;
			return newState;
		}
		case actions.FLAG_TILE: {
			if (state.mines.length > 0) {
				const tileIndexStr = randomFromArray(state.mines);
				const [rowIndex, tileIndex] = splitTileIndex(tileIndexStr);

				const newGrid = [...state.grid];
				newGrid[rowIndex][tileIndex].tileType = TILE_MAP.FLAGGED;

				const newMines = state.mines.filter((mineIndex) => mineIndex !== tileIndexStr);

				const newState = { ...state, grid: newGrid, mines: newMines };
				stateReplicant.value = newState;
				return newState;
			}
			return state;
		}
		case actions.REVEAL_TILES: {
			if (state.nonMines.length > 0) {
				const revealThreshold = Math.min(
					// ensure the threashold doesn't exceed the number of nonMine tiles
					getTileRevealThreshold(action.donationAmount),
					state.nonMines.length,
				);

				let revealedTiles: TileData[] = [];
				let grid = [...state.grid];
				let nonMines = [...state.nonMines];

				// ensures that bigger donations reveal more tiles
				while (revealedTiles.length < revealThreshold) {
					const tileIndexStr = randomFromArray(nonMines);
					const tilesToReveal = createTileCluster(grid, tileIndexStr);
					revealedTiles = [...revealedTiles, ...tilesToReveal];

					grid = grid.map((row) => {
						return row.map((tile) => {
							const tileInRevealList = tilesToReveal.find((tileToReveal) => tileToReveal.id === tile.id);
							return tileInRevealList || tile;
						});
					});

					// remove any revealed tiles from the nonMines list so they can't be selected again
					const revealedTileIds = tilesToReveal.map((revealedTile) => revealedTile.id);
					nonMines = nonMines.filter((id) => !revealedTileIds.includes(id));
				}

				const newState = { ...state, grid, nonMines };
				stateReplicant.value = newState;
				return newState;
			}
			return state;
		}
		case actions.QUESTION_TILE: {
			if (state.mines.length > 0) {
				const tileIndexStr = randomFromArray(state.mines);
				const [rowIndex, tileIndex] = splitTileIndex(tileIndexStr);

				const newGrid = [...state.grid];
				newGrid[rowIndex][tileIndex].tileType = TILE_MAP.QUESTION_MARK;

				const newState = { ...state, grid: newGrid };
				stateReplicant.value = newState;
				return newState;
			}
			return state;
		}
		default: {
			return state;
		}
	}
}

export function Minesweeper(props: ChannelProps) {
	const [currentEvent] = usePreloadedReplicant<Event>('currentEvent');
	const [total] = useReplicant<Total | null>('total', null);

	const [gridState, dispatch] = useReducer(gridReducer, cloneDeep(stateReplicant.value!));

	const [face, setFace] = useState<FaceType>('smile');
	const faceChangeTimeout = useRef<ReturnType<typeof setTimeout>>();

	function changeFace(face: FaceType) {
		clearTimeout(faceChangeTimeout.current!);
		setFace(face);
		faceChangeTimeout.current = setTimeout(() => setFace('smile'), 2_500);
	}

	useListenFor('donation', (donation: FormattedDonation) => {
		changeFace(donation.rawAmount < MIN_REVEAL_DONATION ? 'open_mouth' : 'sunglasses');

		if (donation.rawAmount < MIN_REVEAL_DONATION && gridState.mines.length > 0) {
			dispatch({ type: actions.FLAG_TILE });
		} else {
			dispatch({ type: actions.REVEAL_TILES, donationAmount: donation.rawAmount });
		}
	});

	useListenFor('subscription', () => {
		changeFace('heart_eyes');
	});

	useEffect(() => {
		if (gridState.nonMines.length === 0) {
			// reset the grid when we run out of hidden tiles to reveal
			dispatch({ type: actions.RESET });
		}
	}, [gridState.nonMines]);

	const flagTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
	useEffect(() => {
		function flagTiles(timeoutMS: number) {
			// Add a question mark every 5-10 seconds
			const newTimeout = random(5_000, 10_000);
			flagTimeoutRef.current = setTimeout(() => {
				dispatch({ type: actions.QUESTION_TILE });
				flagTiles(newTimeout);
			}, timeoutMS);
		}

		flagTiles(5_000);

		return () => {
			clearTimeout(flagTimeoutRef.current!);
		};
	}, []);

	return (
		<Container>
			<Global
				styles={css`
					* {
						box-sizing: border-box;
					}
				`}
			/>
			<Wrapper>
				<Header>
					<LCDContainer
						css={css`
							justify-content: flex-start;
						`}>
						<LCDText>{currentEvent.shortname}</LCDText>
					</LCDContainer>
					<Face face={face} />
					<LCDContainer
						css={css`
							justify-content: flex-end;
						`}>
						<LCDText>
							$<TweenNumber value={Math.floor(total?.raw ?? 0)} />
						</LCDText>
					</LCDContainer>
				</Header>
				<Grid>
					{gridState.grid.map((row) => {
						return row.map((cell) => <Tile key={cell.id} {...cell} />);
					})}
				</Grid>
			</Wrapper>
		</Container>
	);
}

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	background: #c0c0c0;
	border: 1px solid;
	border-color: #fff #aca899 #aca899 #fff;
`;

const Wrapper = styled.div`
	position: relative;
	display: flex;
	gap: 5px;
	flex-direction: column;
	height: 100%;
	background-color: #bdbdbd;
	padding: 5px;
	border-left: 3px solid #fff;
	border-top: 3px solid #fff;
`;

const Header = styled.header`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 5px;
	height: 50px;
	border: 2px solid;
	border-color: #7d7d7d #fff #fff #7d7d7d;
`;

const Grid = styled.div`
	flex: 1;
	display: grid;
	grid-template-rows: repeat(${GRID_ROWS}, ${TILE_DIMENSION}px);
	grid-template-columns: repeat(${GRID_COLUMNS}, ${TILE_DIMENSION}px);
	place-content: center;
	border: 2px solid;
	border-color: #7d7d7d #fff #fff #7d7d7d;
`;

const LCDContainer = styled.div`
	flex: 1;
	display: flex;
`;

const LCDText = styled.div`
	font-family: minesweeper;
	font-size: 32px;
	text-transform: uppercase;
	color: #ea3323;
	background: #000;
	border: 1px solid;
	border-color: #808080 #fff #fff #808080;
	padding: 1px;
`;
