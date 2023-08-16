import { css } from '@emotion/react';
import { FACE_DIMENSION, FACE_ORDER } from './constants';

import faces from './assets/faces.png';

export type FaceType = (typeof FACE_ORDER)[number];

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
				transform: scale(1.25);
				width: ${FACE_DIMENSION}px;
				height: ${FACE_DIMENSION}px;
				background: url(${faces}) no-repeat;
				background-position: -${getFaceOffset(face)}px;
			`}
		/>
	);
}
