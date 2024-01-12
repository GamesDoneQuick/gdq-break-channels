type SpritePaths = {
	bus: string;

	wheel1: string;
	wheel2: string;

	numbersWhite: string;

	sand: string;
	lightSand: string;

	busStop: string;
};

export const Sprites = {
	day: {
		bus: busDay,
		wheel1: wheel1Day,
		wheel2: wheel2Day,
		numbersWhite: numbersWhiteDay,
		sand: sandDay,
		lightSand: lightSandDay,
		busStop: busStopDay,
	} satisfies SpritePaths,
	dusk: {
		bus: busDusk,
		wheel1: wheel1Day,
		wheel2: wheel2Day,
		numbersWhite: numbersWhiteDay,
		sand: sandDusk,
		lightSand: lightSandDusk,
		busStop: busStopDusk,
	} satisfies SpritePaths,
	night: {
		bus: busNight,
		wheel1: wheel1Night,
		wheel2: wheel2Night,
		numbersWhite: numbersWhiteNight,
		sand: sandNight,
		lightSand: lightSandNight,
		busStop: busStopNight,
	} satisfies SpritePaths,
	dawn: {
		bus: busDawn,
		wheel1: wheel1Dawn,
		wheel2: wheel2Dawn,
		numbersWhite: numbersWhiteDawn,
		sand: sandDawn,
		lightSand: lightSandDawn,
		busStop: busStopDawn,
	} satisfies SpritePaths,
};

import busDay from './images/day/bus.png';
import wheel1Day from './images/day/wheel1.png';
import wheel2Day from './images/day/wheel2.png';
import sandDay from './images/day/sand_texture.png';
import lightSandDay from './images/day/light_sand_texture.png';
import numbersWhiteDay from './images/day/numbers_white.png';
import busStopDay from './images/day/bus-stop.png';

import busNight from './images/night/bus.png';
import wheel1Night from './images/night/wheel1.png';
import wheel2Night from './images/night/wheel2.png';
import sandNight from './images/night/sand_texture.png';
import lightSandNight from './images/night/light_sand_texture.png';
import numbersWhiteNight from './images/night/numbers_white.png';
import busStopNight from './images/night/bus-stop.png';

import busDusk from './images/dusk/bus.png';
import sandDusk from './images/dusk/sand_texture.png';
import lightSandDusk from './images/dusk/light_sand_texture.png';
import busStopDusk from './images/dusk/bus-stop.png';

import busDawn from './images/dawn/bus.png';
import wheel1Dawn from './images/dawn/wheel1.png';
import wheel2Dawn from './images/dawn/wheel2.png';
import sandDawn from './images/dawn/sand_texture.png';
import lightSandDawn from './images/dawn/light_sand_texture.png';
import numbersWhiteDawn from './images/dawn/numbers_white.png';
import busStopDawn from './images/dawn/bus-stop.png';

import zetaShiftBanner from './images/day/zeta-shift.png';
import dawnGuardBanner from './images/day/dawn-guard.png';
import alphaFlightBanner from './images/day/alpha-flight.png';
import nightWatchBanner from './images/day/night-watch.png';
import omegaShiftBanner from './images/day/omega-shift.png';

import tree from './images/tree.gif';
import line1 from './images/line1.png';
import line2 from './images/line2.png';
import line3 from './images/line3.png';
import line4 from './images/line4.png';
import line5 from './images/line5.png';
import line6 from './images/line6.png';
import line7 from './images/line7.png';

import numbersBlack from './images/numbers_black.png';

import bug from './images/bug.png';
import splat from './images/splat.png';
import mask from './images/sand_banks_mask.png';

import headlights from './images/night/headlights.png';

export {
	tree,
	line1,
	line2,
	line3,
	line4,
	line5,
	line6,
	line7,
	numbersBlack,
	bug,
	splat,
	mask,
	headlights,
	zetaShiftBanner,
	dawnGuardBanner,
	alphaFlightBanner,
	nightWatchBanner,
	omegaShiftBanner,
};
