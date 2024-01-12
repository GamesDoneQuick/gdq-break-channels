import * as PIXI from 'pixi.js';
import { AFFINE, Container2d, TilingSprite2d } from 'pixi-projection';
import { MutableRefObject, useEffect, useRef, useState } from 'react';

import {
	alphaFlightBanner,
	dawnGuardBanner,
	mask,
	nightWatchBanner,
	Sprites,
	zetaShiftBanner,
	omegaShiftBanner,
} from './sprites';
import { dayTime, shiftTime } from './daytime';
import { useHarmonicIntervalFn } from 'react-use';

export function useObjects(app: MutableRefObject<PIXI.Application | undefined>) {
	const [timeDay, setTimeDay] = useState<'night' | 'dawn' | 'day' | 'dusk'>('day');
	const [shift, setShift] = useState<'zeta' | 'dawn' | 'alpha' | 'night' | 'omega'>('night');
	const objects = useRef<Record<string, PIXI.DisplayObject> | null>(null);
	const textures = useRef<Record<string, PIXI.Texture> | null>(null);

	useHarmonicIntervalFn(() => {
		const currentTime = dayTime();
		if (timeDay !== currentTime) setTimeDay(currentTime);
		const currentShift = shiftTime();
		if (shift !== currentShift) setShift(currentShift);
	}, 1000);

	useEffect(() => {
		if (!app.current) return;

		textures.current = {
			sandMask: PIXI.Texture.from(mask),
			sandday: PIXI.Texture.from(Sprites.day.sand),
			lightSandday: PIXI.Texture.from(Sprites.day.lightSand),
			busStopday: PIXI.Texture.from(Sprites.day.busStop),
		};

		objects.current = {
			background: new PIXI.Graphics(),
			desert: new TilingSprite2d(textures.current.lightSand, 546, 166),
			road: new PIXI.Graphics(),
			sandPitsMask: new PIXI.Sprite(textures.current.sandMask),
			sandPits: new TilingSprite2d(textures.current.sandday, 546, 166),
			lights: new PIXI.Graphics(),
			meridianMask: new PIXI.Graphics(),
			meridian: new PIXI.Graphics(),
			busStop: new PIXI.Sprite(textures.current.busStopday),
			banner: new PIXI.Sprite(textures.current.bannernight),
			container: new Container2d(),
		};

		//(objects.current.sandPits as TilingSprite2d).convertTo2s();

		const container = objects.current.container as Container2d;
		const filter = new PIXI.filters.AlphaFilter(1);
		filter.resolution = 0.5;

		container.filters = [filter];

		container.addChild(objects.current.background);
		container.addChild(objects.current.desert);
		container.addChild(objects.current.road);
		container.addChild(objects.current.sandPits);
		container.addChild(objects.current.sandPitsMask);
		container.addChild(objects.current.lights);
		container.addChild(objects.current.meridian);
		container.addChild(objects.current.meridianMask);
		container.addChild(objects.current.busStop);
		container.addChild(objects.current.banner);

		(objects.current.busStop as PIXI.Sprite).anchor.set(0.5, 1.0);
		(objects.current.banner as PIXI.Sprite).anchor.set(0.5, 1.0);
		(objects.current.desert as TilingSprite2d).anchor.set(0.5, 0.0);
		(objects.current.desert as TilingSprite2d).proj.affine = AFFINE.NONE;

		objects.current.sandPits.mask = objects.current.sandPitsMask as PIXI.Graphics;
		objects.current.meridian.mask = objects.current.meridianMask as PIXI.Graphics;

		app.current?.stage.addChild(container);

		container.setTransform(0, 0, 2, 2);

		return () => {
			for (const key in objects.current) {
				const obj = objects.current[key];
				if (!obj.destroyed) obj.destroy(true);
			}
			for (const key in textures.current) {
				const tex = textures.current[key];
				tex.destroy(true);
			}

			filter.destroy();
			if (!container.destroyed) container.destroy(true);
		};
	}, [app]);

	useEffect(() => {
		if (!app.current || !textures.current || !objects.current) return;

		if (!textures.current[`sand${timeDay}`]) {
			textures.current[`sand${timeDay}`] = PIXI.Texture.from(Sprites[timeDay].sand);
		}

		if (!textures.current[`lightSand${timeDay}`]) {
			textures.current[`lightSand${timeDay}`] = PIXI.Texture.from(Sprites[timeDay].lightSand);
		}

		if (!textures.current[`busStop${timeDay}`]) {
			textures.current[`busStop${timeDay}`] = PIXI.Texture.from(Sprites[timeDay].busStop);
		}

		if (!textures.current[`banner${shift}`]) {
			if (shift === 'zeta') textures.current[`bannerzeta`] = PIXI.Texture.from(zetaShiftBanner);
			else if (shift === 'dawn') textures.current[`bannerdawn`] = PIXI.Texture.from(dawnGuardBanner);
			else if (shift === 'alpha') textures.current[`banneralpha`] = PIXI.Texture.from(alphaFlightBanner);
			else if (shift === 'night') textures.current[`bannernight`] = PIXI.Texture.from(nightWatchBanner);
			else if (shift === 'omega') textures.current[`banneromega`] = PIXI.Texture.from(omegaShiftBanner);
		}

		(objects.current.desert as TilingSprite2d).texture = textures.current[`lightSand${timeDay}`];
		(objects.current.sandPits as TilingSprite2d).texture = textures.current[`sand${timeDay}`];
		(objects.current.busStop as PIXI.Sprite).texture = textures.current[`busStop${timeDay}`];
		(objects.current.banner as PIXI.Sprite).texture = textures.current[`banner${shift}`];
	}, [app, timeDay, shift]);

	return { timeDay, objects, textures };
}
