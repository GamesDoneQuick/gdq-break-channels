import * as PIXI from 'pixi.js'
import { MutableRefObject, useEffect, useRef } from 'react'

import bgTextureData from './bg.json'
import bgTexture from './bg.png'
import cursorTexture from './cursor-2.png'
import fishTextureData from './fish.json'
import fishTexture from './fish.png'
import hudOverlayTexture from './hud-overlay.png'
import itemsTextureData from './items.json'
import itemsTexture from './items.png'
import waveTexture from './wave.png'

const useSprites = (app: MutableRefObject<PIXI.Application | undefined>) => {
    const sprites = useRef<Record<string, PIXI.Spritesheet | PIXI.Sprite>>()

    useEffect(() => {
        if (!app.current) return

        const loadSpritesheet = async (text: PIXI.TextureSource, spritesheetData: PIXI.ISpritesheetData): Promise<PIXI.Spritesheet> => {
            const sprite = PIXI.Texture.from(text)
            const sheet = new PIXI.Spritesheet(sprite, spritesheetData)
            await sheet.parse()
            return sheet
        }


        const loadSprites = async () => {
            // spritesheets
            const bgSpritesheet = await loadSpritesheet(bgTexture, bgTextureData)
            const fishSpritesheet = await loadSpritesheet(fishTexture, fishTextureData)
            const itemsSpritesheet = await loadSpritesheet(itemsTexture, itemsTextureData)
            // static
            const hudOverlay = new PIXI.Sprite(PIXI.Texture.from(hudOverlayTexture))
            const cursor = new PIXI.Sprite(PIXI.Texture.from(cursorTexture))
            const wave = new PIXI.Sprite(PIXI.Texture.from(waveTexture))

            sprites.current = {
                bg: bgSpritesheet,
                fish: fishSpritesheet,
                items: itemsSpritesheet,
                hudOverlay,
                cursor,
                wave
            }
        }


        if (!sprites.current) {
            loadSprites()
        }

        return () => {
            for (const key in sprites.current) {
                const obj = sprites.current[key] as PIXI.Sprite | PIXI.Spritesheet
                try {
                    obj.destroy(true);
                }
                catch (_) { }
            }
        };
    }, [app])


    return sprites
}

export default useSprites