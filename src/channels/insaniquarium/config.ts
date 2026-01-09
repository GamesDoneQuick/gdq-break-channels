import { FishType } from "./entities/Fish"
import { ItemType } from "./entities/Item"

export const MIN_FISH: number = 6
export const MAX_FISH: number = 15

// this determines how often the fish will get bored with their swimming direction
export const MIN_FISH_BOREDOM: number = 20.0
export const MAX_FISH_BOREDOM: number = 450.0

export const FOOD_RELEASE_INTERVAL: number = 250.0

/**
 * When turned on, a user can interact by:
 * - left-clicking dropped money
 * - right-clicking to feed
 * NOTE: controls will be hijacked when a donation item is dropped.
 * Cursor is not locked, you can leave the canvas wheneever you like.
 */
export const ALLOW_DEVELOPER_INTERACTION: boolean = true

export const FOOD_SCALE_TO_GROW_BIG: number = 1.0

export const SUBSCRIBER_NAMETAG_DURATION: number = 600.0

/**
 * Will be evaluated from top-bottom. Default fish will be used if no fish spawn chance is hit.
 * Spawn chance is (0-1).
 **/
export const FISH_SPAWN_CHANCES: Record<FishType, number> = {
    'fishDiamond': 0.05,
    'fishLarge': 0.25,
    'fishMed': 0.85,
    'fishSmall': 1.0
}
export const DEFAULT_FISH_TYPE: FishType = 'fishSmall'

export const FISH_MOVE_SPEEDS: Record<FishType, { min: number, max: number }> = {
    'fishSmall': { min: 0.3, max: 0.4 },
    'fishMed': { min: 0.6, max: 0.9 },
    'fishLarge': { min: 0.3, max: 0.4 },
    'fishDiamond': { min: 0.3, max: 0.4 },
}

export const FISH_DROP_INTERVALS: Record<FishType, { min: number, max: number }> = {
    'fishSmall': { min: 820.0, max: 1000.0 },
    'fishMed': { min: 650.0, max: 620.0 },
    'fishLarge': { min: 350.0, max: 620.0 },
    'fishDiamond': { min: 250.0, max: 620.0 },
}

/**
 * Identifies the chances of each type of drop to fall from a fish.
 * Values are prioritized by placement in the array.
 */
export const FISH_DROPS: Record<FishType, [ItemType, number][]> = {
    'fishSmall': [['coinSilver', 1.0]],
    'fishMed': [['coinSilver', 1.0]],
    'fishLarge': [['coinSilver', 0.15], ['coinGold', 1.0]],
    'fishDiamond': [['diamond', 1.0]]
}