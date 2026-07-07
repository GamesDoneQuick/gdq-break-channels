import * as PIXI from 'pixi.js'
import { SUBSCRIBER_NAMETAG_DURATION } from '../config'

class Nametag extends PIXI.Text {
    private target_: PIXI.AnimatedSprite
    private currentDuration_: number

    constructor(text: string, target: PIXI.AnimatedSprite) {
        super(text)

        this.target_ = target

        this.style = {
            fontFamily: 'gdqPixel',
            fontSize: 10,
            align: 'center',
            fill: '0xffffff',
            stroke: '0x000000',
            strokeThickness: 3
        }

        this.anchor.set(0.5, 0.0)
        this.currentDuration_ = SUBSCRIBER_NAMETAG_DURATION
    }

    // -- public
    update() {
        if (!this.target_ || this.target_.destroyed) return
        this.x = (this.target_.x + this.target_.width / 2) - this.width
        this.y = (this.target_.y + this.target_.height / 2) - this.height / 2

        this.currentDuration_--
        if (this.currentDuration_ <= 0.0) {
            this.destroy()
        }
    }
}

export default Nametag