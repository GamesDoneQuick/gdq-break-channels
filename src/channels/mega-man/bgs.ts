import type { ScrollingBackgroundFactory } from './backgrounds';
import backgroundFactoryMM2Wily1 from './backgrounds/mm2-wily1';
import backgroundFactoryMM3Gemini from './backgrounds/mm3-gemini';
import backgroundFactoryMM4Cos4 from './backgrounds/mm4-cos4';

export const MegaManBGList: { [bg: string]: ScrollingBackgroundFactory } = {
	MM2WILY1: backgroundFactoryMM2Wily1,
	MM3GEMINI: backgroundFactoryMM3Gemini,
	MM4COS4: backgroundFactoryMM4Cos4,
};
const enemyListKeys = Object.keys(MegaManBGList);

export function getRandomBG(): ReturnType<ScrollingBackgroundFactory> {
	const idx = Math.floor(Math.random() * enemyListKeys.length);
	return MegaManBGList[enemyListKeys[idx]]();
}
