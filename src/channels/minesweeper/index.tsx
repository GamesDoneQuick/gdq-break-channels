import { useEffect, useReducer, useRef, useState } from 'react';
import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { ChannelProps, registerChannel } from '../channels';
import { useListenFor, useReplicant } from 'use-nodecg';
import type { Event, FormattedDonation, Total } from '@gdq/types/tracker';

import { Face } from './Face';
import { Tile, TileData } from './Tile';
import { TILE_DIMENSION, GRID_COLUMNS, GRID_ROWS, TILE_MAP, MINE_CHANCE, mineNumberTiles } from './constants';
import { createTileCluster, getMineCount, randomFromArray, splitTileIndex } from './utils';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';
import { cloneDeep } from 'lodash';

registerChannel('Minesweeper', 132, Minesweeper, {
	position: 'bottomRight',
	handle: 'rshig',
});

type GridState = {
	grid: TileData[][];
	mines: string[];
	nonMines: string[];
};

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
} as const;

type GridAction =
	| { type: typeof actions.FLAG_TILE }
	| { type: typeof actions.RESET }
	| { type: typeof actions.REVEAL_TILES; revealChance: number };

function gridReducer(state: GridState, action: GridAction) {
	switch (action.type) {
		case actions.RESET: {
			const newState = generateInitialGridState();
			stateReplicant.value = newState;
			return newState;
		}
		case actions.FLAG_TILE: {
			if (state.mines.length > 0) {
				const mineIndexStr = randomFromArray(state.mines);
				const [rowIndex, tileIndex] = splitTileIndex(mineIndexStr);

				const newGrid = state.grid.map((row, ri) => {
					if (ri !== rowIndex) return row;
					return row.map<TileData>((tile, ti) =>
						ti === tileIndex
							? {
									...tile,
									tileType: TILE_MAP.FLAGGED,
							  }
							: tile,
					);
				});

				const newMines = state.mines.filter((mineIndex) => mineIndex !== mineIndexStr);

				const newState = { ...state, grid: newGrid, mines: newMines };
				stateReplicant.value = newState;
				return newState;
			}
			return state;
		}
		case actions.REVEAL_TILES: {
			if (state.nonMines.length > 0) {
				const tileId = randomFromArray(state.nonMines);
				const tiles = createTileCluster(state.grid, tileId, action.revealChance);

				const grid = state.grid.map((row) => {
					return row.map<TileData>((tile) => {
						const mineCount = getMineCount(state.grid, tile.id);
						return tiles.includes(tile?.id)
							? {
									...tile,
									tileType: mineNumberTiles[mineCount],
							  }
							: tile;
					});
				});

				const nonMines = state.nonMines.filter((id) => !tiles.includes(id));

				const newState = { ...state, grid, nonMines };
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

	const [face, setFace] = useState<Face>('smile');
	const faceChangeTImeout = useRef<NodeJS.Timeout | undefined>(undefined);

	useListenFor('donation', (donation: FormattedDonation) => {
		/**
		 * The magic numbers in here are sort of arbitrary placeholders since
		 * I don't have much context for realistic donation behavior
		 */
		clearTimeout(faceChangeTImeout.current);
		setFace(donation.rawAmount < 50 ? 'open_mouth' : 'sunglasses');
		faceChangeTImeout.current = setTimeout(() => setFace('smile'), 2000);

		if (donation.rawAmount < 50 && gridState.mines.length > 0) {
			dispatch({ type: actions.FLAG_TILE });
		} else {
			// TODO: figure out which reveal chances to set for certain donation ranges
			dispatch({ type: actions.REVEAL_TILES, revealChance: 0.5 });
		}
	});

	useEffect(() => {
		if (gridState.nonMines.length === 0) {
			// reset the grid when we run out of hidden tiles to reveal
			dispatch({ type: actions.RESET });
		}
	}, [gridState.nonMines]);

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
