import * as PIXI from 'pixi.js'
import { getDistanceBetweenPositions } from '../helpers'
import Item from './Item'

class Cursor extends PIXI.AnimatedSprite {
    readonly MOVE_SPEED: number = 12.0

    private app_: PIXI.Application

    private itemsQueue_: Item[] = []
    private currentItem_?: Item

    // provided by scene 
    private requestCollect_: (item: Item) => void

    constructor(app: PIXI.Application, sprite: PIXI.Sprite, requestCollect: (item: Item) => void) {
        super([sprite.texture])

        this.app_ = app

        const { x, y } = this.getRandomPosition()
        this.x = x
        this.y = y
        this.play()

        this.requestCollect_ = requestCollect
    }

    // -- overrides
    update(deltaTime: number): void {
        super.update(deltaTime)

        this.handleMoveTowardItem_()
    }

    // -- public
    addItemToQueue(item: Item) {
        this.itemsQueue_.push(item)

        if (!this.currentItem_) this.nextItem()
    }

    nextItem() {
        this.currentItem_ = this.itemsQueue_.shift()
    }

    warpMouseToPosition(position: { x: number, y: number }) {
        // if there is a current item, no manual warping
        if (this.currentItem_) return
        this.x = position.x + this.width * 0.65
        this.y = position.y + this.height * 0.4
    }

    // -- private
    handleMoveTowardItem_() {
        if (!this.currentItem_) return

        const dir = { x: (this.currentItem_.x + this.currentItem_.width / 2) - this.x, y: (this.currentItem_.y + this.currentItem_.height / 2) - this.y }

        this.x += dir.x * this.MOVE_SPEED * 0.01
        this.y += dir.y * this.MOVE_SPEED * 0.025

        // if we've reached the item, collect
        const dist = getDistanceBetweenPositions({ x: this.x, y: this.y }, { x: this.currentItem_.x + this.currentItem_.width / 2, y: this.currentItem_.y + this.currentItem_.height / 2 })
        if (dist < 2.5) {
            this.requestCollect_(this.currentItem_)
            this.nextItem()
        }
    }

    // -- getters
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

export default Cursor