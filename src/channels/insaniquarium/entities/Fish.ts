import * as PIXI from 'pixi.js'
import { FISH_DROP_INTERVALS, FISH_DROPS, FISH_MOVE_SPEEDS, FOOD_SCALE_TO_GROW_BIG, MAX_FISH_BOREDOM, MIN_FISH_BOREDOM } from '../config'
import { getDistanceBetweenPositions, normalizePoint } from '../helpers'
import Item, { ItemType } from './Item'

export type FishType = 'fishSmall' | 'fishMed' | 'fishLarge' | 'fishDiamond'
export type FishAnimationType = 'swimming' | 'eating' | 'turning' | 'chasing'
type BonkDataType = { left: boolean, right: boolean, top: boolean, bottom: boolean }

class Fish extends PIXI.AnimatedSprite {
    readonly BASE_ANIMATION_SPEED: number = 0.15
    readonly BASE_FOOD_AMOUNT: number = 3

    public fishType!: FishType
    public currentState!: FishAnimationType

    private app_: PIXI.Application
    private spritesheet_: PIXI.Spritesheet
    private moveSpeed_!: number
    private desiredDir_: PIXI.Point = new PIXI.Point(0.0, 0.0)
    private boredomValue_!: number
    private currentBoredomValue_!: number

    private dropInterval_!: number
    private currentDropInterval_!: number

    private hungry_: boolean = false // randomly decides per-action if we are hungry
    private foodItems_: Item[] = []
    private currentFoodItem_: Item | null = null
    private currentGrowth_: number = 0
    private sizeJiggle_: number = 1.0

    // provided by scene
    private requestDrop_: (itemType: ItemType, position: PIXI.Point) => void

    constructor(app: PIXI.Application, spritesheet: PIXI.Spritesheet, fishType: FishType, requestDrop: (itemType: ItemType, position: PIXI.Point) => void) {
        super(Object.values(spritesheet.animations)[0])
        this.play()


        this.animationSpeed = this.BASE_ANIMATION_SPEED

        this.app_ = app
        this.spritesheet_ = spritesheet

        this.forceSize(fishType)

        const { x, y } = this.getRandomPosition()
        this.x = x
        this.y = y

        this.desiredDir_ = this.getRandomDirection()
        this.resetBoredom()
        this.resetDropInterval()

        this.requestDrop_ = requestDrop

        // if our direction changed, pause this and go to the turn direction state
        const xFlipped = this.scale.x < 0.0 && this.desiredDir_.x > 0.0 || this.scale.x > 0.0 && this.desiredDir_.x < 0.0
        if (xFlipped) {
            this.changeState('turning')
        }
    }

    // -- override
    update(deltaTime: number): void {
        super.update(deltaTime)

        switch (this.currentState) {
            case 'swimming':
                this.handleSwimming_()
                this.handleHungry_()
                this.updateBoredom_()
                break
            case 'turning':
                if (this.currentFrame === this.totalFrames - 1) {
                    this.scale.x *= -1
                    this.changeState('swimming')
                }
                break
            case 'chasing':
                this.handleChaseFood_()
                this.handleSwimming_()
                break
            case 'eating':
                if (this.currentFrame == this.totalFrames - 1) {
                    this.changeState('swimming')
                    if (this.currentFoodItem_ && !this.currentFoodItem_.destroyed) this.currentFoodItem_.destroy()
                    this.currentGrowth_++
                    this.updateSize()
                }
        }

        this.handleSizeJiggle()
        this.keepInBounds()
        this.updateDropInterval_()
    }

    handleSizeJiggle() {
        if (this.sizeJiggle_ !== 1.0) {
            this.sizeJiggle_ *= 0.8

            if (Math.abs(this.sizeJiggle_) <= 0.9) this.sizeJiggle_ = 1.0
        }

        this.scale.y = this.sizeJiggle_
    }

    // -- public
    changeState(state: FishAnimationType) {
        this.currentState = state
        const fullAnimationName: string = this.getAnimationName(state)

        if (this.spritesheet_.animations[fullAnimationName]) {
            this.textures = this.spritesheet_.animations[fullAnimationName]
            this.play()
        }

        this.animationSpeed = this.BASE_ANIMATION_SPEED
        if (this.currentState === 'swimming') {
            // flip x if we are not traveling in the direction of our scale
            const xFlipped = this.scale.x < 0.0 && this.desiredDir_.x > 0.0 || this.scale.x > 0.0 && this.desiredDir_.x < 0.0
            if (xFlipped) this.scale.x *= -1
        }
        if (this.currentState === 'eating') this.animationSpeed = 0.65
    }

    dropItem(itemType?: ItemType) {
        // determine desired drop
        if (!itemType) {
            itemType = this.getDropType()
        }

        if (itemType) {
            this.requestDrop_(itemType, this.getDropPosition())
        }
    }

    provideFoodItems(foodItems: Item[]) {
        this.foodItems_ = foodItems
    }

    forceSize(fishType: FishType) {
        const growthFactor: Record<number, FishType> = this.getGrowthFactor()
        this.currentGrowth_ = parseInt(Object.keys(growthFactor).find((factor) => growthFactor[parseInt(factor)] === fishType) || '0.0') || 0.0
        this.updateSize()
    }

    updateSize() {
        // @ts-ignore
        const growthFactor = this.getGrowthFactor()

        let nearestGrowthFactor: number = parseInt(Object.keys(growthFactor)[0])
        for (const factor in growthFactor) {
            if (this.currentGrowth_ >= parseInt(factor)) {
                nearestGrowthFactor = parseInt(factor)
            }
        }
        const nearestFishType = growthFactor[nearestGrowthFactor]

        if (this.fishType != nearestFishType) {
            this.fishType = nearestFishType
            this.updateSize()
            this.sizeJiggle_ = 2.0
            this.changeState('swimming')
        }
    }

    resetBoredom() {
        this.boredomValue_ = MIN_FISH_BOREDOM + (MAX_FISH_BOREDOM - MIN_FISH_BOREDOM) * Math.random()
        this.currentBoredomValue_ = 0.0
        this.resetMoveSpeed()

        this.hungry_ = Math.random() > 0.95
        if (this.fishType === 'fishSmall') this.hungry_ = Math.random() > 0.35
    }

    resetMoveSpeed() {
        const { min, max } = FISH_MOVE_SPEEDS[this.fishType]
        this.moveSpeed_ = min + (max - min) * Math.random()
    }

    resetDropInterval() {
        const { min, max } = FISH_DROP_INTERVALS[this.fishType]
        this.dropInterval_ = min + (max - min) * Math.random()
        this.currentDropInterval_ = 0.0
    }

    keepInBounds() {
        const bonks = this.checkForBonk_()
        if (bonks.left) this.x = (this.width / 2) + 1
        if (bonks.right) this.x = this.app_.view.width - (this.width / 2) - 1
        if (bonks.top) this.y = (this.height / 2) + 1
        if (bonks.bottom) this.y = this.app_.view.height - (this.height / 2) - 1

        if (this.currentState === 'swimming') {
            if (bonks.left || bonks.right || bonks.top || bonks.bottom) {
                this.changeDirection_(bonks)
            }
        }
    }

    // -- private
    handleSwimming_() {
        this.x += this.getMoveSpeed() * -this.desiredDir_.x
        this.y += this.getMoveSpeed() * this.desiredDir_.y
    }

    handleHungry_() {
        if (!this.hungry_) return
        const availableFoodItems: Item[] = this.foodItems_
            .filter(e => !!e && !e.destroyed)
            .filter((e: Item) => !e.beingEaten)

        if (availableFoodItems.length > 0) {
            // find nearest food item
            let closest = availableFoodItems[0]
            if (availableFoodItems.length > 1) {
                for (let i = 1; i < availableFoodItems.length; i++) {
                    const next = availableFoodItems[i]
                    const distToClosest = getDistanceBetweenPositions({ x: this.x, y: this.y }, { x: closest.x, y: closest.y })
                    const distToNext = getDistanceBetweenPositions({ x: this.x, y: this.y }, { x: next.x, y: next.y })
                    if (distToNext < distToClosest) closest = next
                }
            }

            this.currentFoodItem_ = closest
            this.changeState('chasing')
            return
        }
        this.currentFoodItem_ = null
    }

    handleChaseFood_() {
        if (!this.currentFoodItem_ || this.currentFoodItem_.destroyed) {
            this.resetBoredom()
            this.changeState('swimming')
            this.changeDirection_()
            return
        }

        const x = this.x - this.width / 2
        const y = this.y - this.height / 2

        const cX = this.currentFoodItem_.x - this.currentFoodItem_.width / 2
        const cY = this.currentFoodItem_.y - this.currentFoodItem_.height / 2

        const dir = normalizePoint(new PIXI.Point(x - cX, cY - y))

        this.desiredDir_ = dir

        // flip x if we are not traveling in the direction of our scale
        const xFlipped = this.scale.x < 0.0 && this.desiredDir_.x > 0.0 || this.scale.x > 0.0 && this.desiredDir_.x < 0.0
        if (xFlipped) this.scale.x *= -1

        // if we've reached the food, eat the food!
        const dist = getDistanceBetweenPositions({ x, y }, { x: cX, y: cY })
        if (dist < 3.5) {
            if (this.currentFoodItem_.beingEaten) {
                this.changeState('swimming')
                this.changeDirection_()
            }
            else {
                this.changeState('eating')
            }
        }

    }

    changeDirection_(bonkData: BonkDataType | null = null) {
        const lastDir = this.desiredDir_
        this.desiredDir_ = this.getRandomDirection()

        this.resetBoredom()

        // if we bonked, tell our fish to NOT continue to go in that direction
        if (bonkData?.left && this.desiredDir_.x > 0.0) this.desiredDir_.x *= -1.3
        if (bonkData?.right && this.desiredDir_.x < 0.0) this.desiredDir_.x *= -1.3
        if (bonkData?.top && this.desiredDir_.y < 0.0) {
            this.desiredDir_.y *= -1.3
            this.desiredDir_.x = lastDir.x // hold the last x direction
        }
        if (bonkData?.bottom && this.desiredDir_.y > 0.0) {
            this.desiredDir_.y *= -1.3
            this.desiredDir_.x = lastDir.x // hold the last x direction
        }

        // if our direction changed, pause this and go to the turn direction state
        const xFlipped = this.scale.x < 0.0 && this.desiredDir_.x > 0.0 || this.scale.x > 0.0 && this.desiredDir_.x < 0.0
        if (xFlipped) {
            this.changeState('turning')
        }
    }

    updateBoredom_() {
        this.currentBoredomValue_++
        if (this.currentBoredomValue_ > this.boredomValue_) {
            this.resetBoredom()
            this.changeDirection_()
        }
    }

    updateDropInterval_() {
        this.currentDropInterval_++
        if (this.currentDropInterval_ > this.dropInterval_) {
            this.resetDropInterval()
            this.dropItem()
        }
    }

    checkForBonk_(): BonkDataType {
        const bonks = { left: false, top: false, right: false, bottom: false }

        if ((this.x - this.width / 2) < 0) bonks.left = true
        if ((this.x + this.width / 2) > this.app_.view.width) bonks.right = true
        if ((this.y - this.height / 2) < 0) bonks.top = true
        if ((this.y + this.height / 2) > this.app_.view.height) bonks.bottom = true

        return bonks
    }

    // -- getters
    getAnimationName(animationName: string) {
        return `${this.fishType}_${animationName}`
    }

    getMoveSpeed() {
        if (this.currentState === 'chasing') return this.moveSpeed_ * 6.5
        return this.moveSpeed_
    }

    getGrowthFactor(): Record<number, FishType> {
        const growthFactor: Record<number, FishType> = (['fishSmall', 'fishMed', 'fishLarge'] as FishType[])
            .reduce<Record<number, FishType>>((acc, fishType, i) => ({ ...acc, [i * this.BASE_FOOD_AMOUNT * FOOD_SCALE_TO_GROW_BIG]: fishType }), {})

        return {
            ...growthFactor,
            999: 'fishDiamond'
        }
    }


    getDropType(): ItemType {
        const itemChances = FISH_DROPS[this.fishType]
        const chance: number = Math.random()
        for (const [type, itemChance] of itemChances) {
            if (chance <= itemChance) {
                return type
            }
        }

        return 'coinSilver'
    }

    getDropPosition() {
        return new PIXI.Point(this.x, this.y + this.height / 2)
    }

    getRandomDirection() {
        const x = Math.random() * 2.0 - 1.0
        const y = Math.random() * 2.0 - 1.0

        const max = Math.max(Math.abs(x), Math.abs(y))

        const normX = x / max
        const normY = y / max

        return new PIXI.Point(normX, normY)
    }

    getRandomPosition() {
        const offset: number = 20
        const halfW: number = this.width / 2
        const halfH: number = this.height / 2

        const viewW: number = this.app_.view.width
        const viewH: number = this.app_.view.height

        return {
            x: offset + halfW + ((viewW - halfW * 2) * Math.random()) - offset,
            y: offset + halfH + ((viewH - halfH * 2) * Math.random()) - offset,
        }
    }
}

export default Fish