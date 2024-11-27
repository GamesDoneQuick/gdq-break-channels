import { css } from '@emotion/react';

import { FACE_DIMENSION, FACE_ORDER } from './constants';
import type { FaceType } from './types';

import faces from './assets/faces.png';

const SPRITES_PER_ROW = 5;
const SPRITESHEET_ROWS = 1;

function getFaceOffset(face: FaceType) {
	const faceIndex = FACE_ORDER.indexOf(face);
	return faceIndex * FACE_DIMENSION;
}

type FaceProps = {
	face: FaceType;
};

export function Face({ face }: FaceProps) {
	return (
		<div
			css={css`
				width: ${FACE_DIMENSION}px;
				height: ${FACE_DIMENSION}px;
				background: url(${faces}) no-repeat;
				background-position: -${getFaceOffset(face)}px;
				background-size: ${FACE_DIMENSION * SPRITES_PER_ROW}px ${FACE_DIMENSION * SPRITESHEET_ROWS}px;
			`}
		/>
	);
}
