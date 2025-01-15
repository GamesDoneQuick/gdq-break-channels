import type { Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';
import { useListenForFn } from '@gdq/lib/hooks/useListenForFn';
import { usePIXICanvas } from '@gdq/lib/hooks/usePIXICanvas';
import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';
import * as PIXI from 'pixi.js';
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { useReplicant } from 'use-nodecg';
import { ALLOW_DEVELOPER_INTERACTION, DEFAULT_FISH_TYPE, FISH_SPAWN_CHANCES, FOOD_RELEASE_INTERVAL, MAX_FISH, MIN_FISH } from './config';
import Cursor from './entities/Cursor';
import Fish, { FishType } from './entities/Fish';
import Item, { ItemType } from './entities/Item';
import Nametag from './entities/Nametag';
import Wave from './entities/Wave';
import useSprites from './sprites/useSprites';

/**
 * Insaniquarium Channel!
 * Sprite resources from:
 *  - https://www.spriters-resource.com/pc_computer/insaniquarium/ (SleepyHarry)
 *  - Diamond sprite: https://insaniquarium.fandom.com/wiki/Money
 */
registerChannel('Insaniquarium', 6, Insaniquarium, {
	position: 'bottomLeft',
	site: 'GitHub',
	handle: 'jaclynonacloud',
});

function Insaniquarium(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const [currentEvent] = usePreloadedReplicant<Event>('currentEvent');
	const [app, canvasRef] = usePIXICanvas({ width: 1092, height: 332 }, () => {
		// initializer
		if (app.current && sprites.current && !sceneInitialized) initializeScene()
		// don't continue unless initialized
		if (!sceneInitialized) return

		updateWaves()
		updateNametags()
		updateFoodRelease()
	})

	const sprites = useSprites(app)

	const [sceneInitialized, setSceneInitialized] = useState(false)
	const [delayedDonation, setDelayedDonation] = useState(0.0)
	const [foodReleaseDelay, setFoodReleaseDelay] = useState(0.0)
	const mouseOverStage = useRef(false)

	let bgSprite = useRef<PIXI.Sprite>()
	let hudSprite = useRef<PIXI.Sprite>()
	let fishContainer = useRef<PIXI.Container>()
	let itemContainer = useRef<PIXI.Container>()
	let foodContainer = useRef<PIXI.Container>()
	let nametagContainer = useRef<PIXI.Container>()
	let waveContainer = useRef<Wave>()
	let cursor = useRef<Cursor>()

	// uninitializer
	useEffect(() => {
		return () => uninitializeScene()
	}, [sprites])


	useListenForFn('donation', (donation) => {
		generateDonationItem(donation)
	});

	useListenForFn('subscription', (subscription: any) => {
		const fish = promoteFish()
		if (fish) {
			generateNametag(subscription.user_name, fish)
		}

	});

	const generateNametag = (text:string, fish:Fish) => {
		const nametag:Nametag = new Nametag(text, fish)
		nametagContainer.current!.addChild(nametag)
	}


	/* --------------------------------- */
	/*           INITIALIZERS            */
	/* --------------------------------- */
	const initializeScene = () => {
		setSceneInitialized(true)

		if (total) {
			setDelayedDonation(total?.raw)
		}

		// generate random background
		bgSprite.current = getBGImage()!
		app.current!.stage.addChild(bgSprite.current)

		// generate the graphics containers
		fishContainer.current = new PIXI.Container()
		app.current!.stage.addChild(fishContainer.current)

		// generate waves
		waveContainer.current = new Wave(sprites.current!.wave as PIXI.Sprite)
		app.current!.stage.addChild(waveContainer.current)

		// generate more graphics containers
		itemContainer.current = new PIXI.Container()
		app.current!.stage.addChild(itemContainer.current)

		nametagContainer.current = new PIXI.Container()
		app.current!.stage.addChild(nametagContainer.current)

		foodContainer.current = new PIXI.Container()
		app.current!.stage.addChild(foodContainer.current)

		if (ALLOW_DEVELOPER_INTERACTION) app.current!.stage.cursor = 'none'

		// generate the hud -- keeps spawning in the wrong spot so wrapping in a timeout
		setTimeout(() => {
			const hardcodedWidth = 1092 / 2
			hudSprite.current = sprites.current!.hudOverlay as PIXI.Sprite
			app.current!.stage.addChild(hudSprite.current)
			hudSprite.current.x = hardcodedWidth - (hudSprite.current.width / 2)
			hudSprite.current.y = 8

			// generate the cursor
			const requestCollect = (item:Item) => {
				collectItem(item)
			}
			cursor.current = new Cursor(app.current!, sprites.current!.cursor as PIXI.Sprite, requestCollect)
			app.current!.stage.addChild(cursor.current)

			initializeDevmode()
		}, 100)

		// functionality
		initializeFishes()
	}

	const uninitializeScene = () => {
		setSceneInitialized(false)

		const safeDestroyGraphic = (ref:MutableRefObject<PIXI.Sprite | PIXI.Container | undefined>) => (ref.current && !ref.current.destroyed && ref.current.destroy())

		safeDestroyGraphic(bgSprite)
		safeDestroyGraphic(fishContainer)
		safeDestroyGraphic(foodContainer)
		safeDestroyGraphic(itemContainer)
		safeDestroyGraphic(waveContainer)
		safeDestroyGraphic(cursor)
		safeDestroyGraphic(hudSprite)

		if (app.current?.stage) {
			for (let i = 0; i < app.current.stage.children.length; i++) {
				const child = app.current.stage.getChildAt(i)
				if (child && !child.destroyed) child.destroy()
			}
		}
	}

	/* --------------------------------- */
	/*           FUNCTIONALITY           */
	/* --------------------------------- */
	const initializeDevmode = () => {
		if (!app.current) return
		if (!cursor.current) return
		if (!ALLOW_DEVELOPER_INTERACTION) return


		// disable context menu
		app.current.view.addEventListener('contextmenu', e => e.preventDefault())

		app.current.stage.interactive = true
		app.current.stage.on('mousemove', (e) => {
			if (!mouseOverStage.current) return
			const { x, y } = e.data.global
			cursor.current?.warpMouseToPosition({ x: x - 24.0, y: y - 7.0 })
		})
		app.current.stage.on('mouseover', (_) => { mouseOverStage.current = true })
		app.current.stage.on('mouseout', (_) => { mouseOverStage.current = false })
		app.current.stage.on('rightclick', (e) => {
			const { x , y } = e.data.global
			const food = spawnFood()
			food.x = x
			food.y = y
		})
	}

	const initializeFishes = () => {
		if (!sprites.current?.fish) return
		if (!fishContainer.current) return

		const determineFishType = ():FishType => {
			const chance:number = Math.random()
			for (const key in FISH_SPAWN_CHANCES) {
				const fishType = key as FishType
				if (chance <= FISH_SPAWN_CHANCES[fishType]) return fishType
			}
			return DEFAULT_FISH_TYPE
		}

		const fishAmount:number = MIN_FISH + Math.floor((MAX_FISH + 1 - MIN_FISH) * Math.random())
		
		// spawn the fish
		for (let i = 0; i < fishAmount; i++) {
			spawnFish(determineFishType())
		}
	}

	const spawnFish = (fishType:FishType) => {
		if (!sprites.current?.fish) return
		if (!fishContainer.current) return
		
		const requestDrop = (itemType: ItemType, position: { x: number, y: number }) => {
			spawnItem(itemType, position)
		}
		const fish = new Fish(app.current!, sprites.current.fish as PIXI.Spritesheet, fishType, requestDrop)
		fishContainer.current.addChild(fish)
		return fish
	}

	const spawnItem = (itemType:ItemType,  position?: { x: number, y: number }, requestCollect?:(item:Item) => void) => {
		if (!requestCollect) {
			requestCollect = (_item:Item) => { /** no-op */ }
		}
		const item = new Item(app.current!, sprites.current!.items as PIXI.Spritesheet, itemType, requestCollect)
		itemContainer.current!.addChild(item)
		item.sceneCursor = cursor.current!

		if (position) {
			item.x = position.x - item.width / 2
			item.y = position.y - item.height / 2
		}

		return item
	}

	const spawnFood = () => {
		const requestCollect = (_item:Item) => { /** no-op */ }
		const foodType:ItemType = (['foodFlake', 'foodPellet'] as ItemType[]).sort((_a, _b) => Math.random() > 0.5 ? 1 : -1)[0]
		const food = new Item(app.current!, sprites.current!.items as PIXI.Spritesheet, foodType, requestCollect)
		foodContainer.current!.addChild(food)

		// tell our fish there is food!
		for (const fish of fishContainer.current!.children) {
			(fish as Fish).provideFoodItems(foodContainer.current!.children as Item[])
		}

		return food
	}

	/**
	 * Will make a non-diamond fish a diamond fish!
	 */
	const promoteFish = () => {
		if (!fishContainer.current) return
		const fishes = fishContainer.current.children.sort((_a, _b) => Math.random() > 0.5 ? 1.0 : -1.0)
		for (let i = 0; i < fishes.length; i++) {
			const fish:Fish = fishes[i] as Fish
			if (fish.fishType === 'fishDiamond') continue
			fish.forceSize('fishDiamond')
			return fish
		}

		// if no fish was promoted, make us a new fish! for the subscribers
		const fish = spawnFish('fishDiamond')
		return fish
	}

	const generateDonationItem = (donation:any) => {
		// generate an item and then mouse to it
		const fish:Fish = fishContainer.current!.children[Math.floor(fishContainer.current!.children.length * Math.random())] as Fish
		const itemType:ItemType = fish.getDropType()

		const requestCollect = (item:Item) => {
			setDelayedDonation(donation.rawNewTotal)
		}

		const item:Item = spawnItem(itemType, fish.getDropPosition(), requestCollect)
		item.donatorItem = true

		cursor.current!.addItemToQueue(item)
	}

	const collectItem = (item:Item) => {
		const spr = hudSprite.current!
		const collectPosition = { x: spr.x + spr.width * 0.12, y: spr.y + spr.height / 2 }
		collectPosition.x -= item.width / 2
		collectPosition.y -= item.height / 2
		item.collect(collectPosition)
	}


	const updateWaves = () => {
		if (!waveContainer.current) return
		waveContainer.current.update()
	}

	const updateNametags = () => {
		if (!nametagContainer.current) return
		for (let i = 0; i < nametagContainer.current.children.length; i++) {
			const nametag:Nametag = nametagContainer.current.children[i] as Nametag
			if (nametag && !nametag.destroyed) {
				nametag.update()
			}
		}
	}

	const updateFoodRelease = () => {
		setFoodReleaseDelay(foodReleaseDelay + 1)

		if (foodReleaseDelay > FOOD_RELEASE_INTERVAL) {
			spawnFood()
			setFoodReleaseDelay(0)
		}
	}


	/* --------------------------------- */
	/*              GETTERS              */
	/* --------------------------------- */
	const getBGImage = () => {
		if (!sprites.current) return null
		const bgs = Object.values((sprites.current.bg as PIXI.Spritesheet).textures)
		return new PIXI.Sprite(bgs[Math.floor(bgs.length * Math.random())])
	}

	return (
		<Container>
			<Canvas width={1092} height={332} ref={canvasRef} />
			<TotalEl>
				<TweenNumber value={Math.floor(delayedDonation)} />
			</TotalEl>
			<EventEl>{currentEvent ? `Tank - ${(currentEvent as any).shortname}` : ''}</EventEl>
		</Container>
	);
}

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
`;

const Canvas = styled.canvas`
	position: absolute;
	width: 100% !important;
	height: 100% !important;
`;

const TotalEl = styled.div`
	position: absolute;
    top: 30px;
    left: 50%;
	width: 328px;
    translate: -50% 0;
    font-size: 26px;
    text-align: right;
	font-family: gdqpixel;
	color: #B2FB54;
	pointer-events: none;
	user-select: none;
`;

const EventEl = styled.div`
	position: absolute;
    bottom: 15px;
    right: 25px;
    font-size: 20px;
    text-align: right;
	font-family: Open Sans, Segoe UI, sans-serif;
	color: white;
	opacity: 0.6;
	pointer-events: none;
	user-select: none;
`;
