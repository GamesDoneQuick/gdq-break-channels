import * as PIXI from 'pixi.js'
import { ALLOW_DEVELOPER_INTERACTION } from '../config'
import Cursor from './Cursor'

export type ItemType = 'coinSilver' | 'coinGold' | 'star' | 'pearl' | 'diamond' | 'foodFlake' | 'foodPellet'

class Item extends PIXI.AnimatedSprite {
    readonly MOVE_SPEED: number = 0.85
    readonly BOTTOM_TOUCH_DURATION: number = 45.0
    readonly BOTTOM_TOUCH_DISTANCE: number = 25.0
    readonly FADE_OUT_DURATION: number = 20.0

    public type: ItemType
    // provided by scene
    public donatorItem: boolean = false
    public sceneCursor!: Cursor
    // provided by fish
    public beingEaten: boolean = false

    private app_: PIXI.Application
    private spritesheet_: PIXI.Spritesheet

    private currentBottomTouchDuration_: number = 0.0
    private currentFadeOutDuration_: number = 0.0

    private collecting_: boolean = false
    private collectingPosition_: { x: number, y: number } = { x: 0, y: 0 }

    // provided by scene
    private requestCollect_: (item: Item) => void

    constructor(app: PIXI.Application, spritesheet: PIXI.Spritesheet, type: ItemType, requestCollect: (item: Item) => void) {
        super(Object.values(spritesheet.animations)[0])

        this.app_ = app
        this.spritesheet_ = spritesheet

        this.type = type
        this.textures = this.spritesheet_.animations[this.type]
        this.animationSpeed = 0.25
        this.play()

        // position just above scene
        this.x = this.getRandomXPosition()
        this.y = -this.height

        if (ALLOW_DEVELOPER_INTERACTION) {
            this.interactive = true
            this.on('click', _ => !this.donatorItem && this.collect())
        }

        this.requestCollect_ = requestCollect
    }

    // -- overrides
    update(deltaTime: number): void {
        super.update(deltaTime)
        if (this.handleCollecting_()) return

        if (this.currentBottomTouchDuration_ === 0.0 && !this.collecting_) this.y += this.MOVE_SPEED
        this.handleBottomTouch_()
        // don't fade out donator items -- we need to collect those!
        if (!this.donatorItem) {
            this.handleFadeOut_()
        }
    }

    // -- public
    collect(position?: { x: number, y: number }) {
        if (this.getIsFood()) return
        this.collecting_ = true
        // if we don't pass a collect position, just have it go upward
        if (!position) position = { x: this.x, y: -this.height }
        this.collectingPosition_ = position

        // place on top of scene
        const localX = this.x
        const localY = this.y
        this.removeChild()
        this.app_.stage.addChild(this)
        this.x = localX
        this.y = localY
    }

    // -- private
    handleCollecting_(): boolean {
        if (!this.collecting_) return false

        const dirX = (this.collectingPosition_.x - this.x)
        const dirY = (this.collectingPosition_.y - this.y)

        this.x += dirX * this.MOVE_SPEED * 0.15
        this.y += dirY * this.MOVE_SPEED * 0.15

        // if we've left the top of the screen, complete
        if (this.y <= -this.height / 2) {
            this.requestCollect_(this)
            this.destroy()
            return true
        }

        // if we've reached the collecting position, complete
        const distX = Math.abs(this.x - this.collectingPosition_.x)
        const distY = Math.abs(this.y - this.collectingPosition_.y)

        if ((distX + distY) / 2.0 < 0.8) {
            this.requestCollect_(this)
            this.destroy()
        }

        return true
    }

    handleBottomTouch_() {
        // if we're fading, ignore
        if (this.currentFadeOutDuration_ > 0.0) return

        const bottomDist: number = (this.app_.view.height - this.height / 2) - this.BOTTOM_TOUCH_DISTANCE

        if (this.y >= bottomDist) {
            // make sure we don't overshoot the bottom dist
            this.y = bottomDist
            if (this.currentBottomTouchDuration_ === 0.0) this.currentBottomTouchDuration_ = this.BOTTOM_TOUCH_DURATION
        }

        if (this.currentBottomTouchDuration_ > 0.0) {
            this.currentBottomTouchDuration_--
            if (this.currentBottomTouchDuration_ <= 0.0) {
                this.currentFadeOutDuration_ = this.FADE_OUT_DURATION
                this.currentBottomTouchDuration_ = -1.0
            }
        }
    }

    handleFadeOut_() {
        if (this.currentFadeOutDuration_ > 0.0) {
            this.currentFadeOutDuration_--

            const alpha = this.currentFadeOutDuration_ / this.FADE_OUT_DURATION
            this.alpha = alpha

            if (this.currentFadeOutDuration_ <= 0.0) {
                this.destroy()
            }
        }
    }

    // -- getters
    getIsFood(): boolean {
        return (['foodFlake', 'foodPellet'] as ItemType[]).includes(this.type)
    }

    getRandomXPosition(): number {
        const offset: number = 20
        const halfW: number = this.width / 2

        const viewW: number = this.app_.view.width

        return offset + halfW + ((viewW - halfW * 2) * Math.random()) - offset
    }
}

export default Item