import * as PIXI from 'pixi.js'

class Wave extends PIXI.Container {
    private wave1_: PIXI.Sprite
    private wave2_: PIXI.Sprite

    constructor(sprite: PIXI.Sprite) {
        super()

        this.wave1_ = new PIXI.Sprite(sprite.texture)
        this.wave2_ = new PIXI.Sprite(sprite.texture)

        this.wave1_.anchor.set(0.0, 0.5)
        this.wave2_.anchor.set(0.0, 0.5)

        this.addChild(this.wave1_)
        this.addChild(this.wave2_)

        let colorMatrix = new PIXI.filters.ColorMatrixFilter();
        this.filters = [colorMatrix];
        colorMatrix.contrast(0.165, true);
        colorMatrix.blendMode = PIXI.BLEND_MODES.ADD
        this.alpha = 0.4
    }

    // -- public
    update() {
        const ws = Math.sin(Date.now() / 1000) * 30.0
        this.wave1_.x = ws - 150.0
        this.wave1_.y = 35.0
        this.wave1_.scale.y = 1 + Math.sin(Date.now() / 750.0) * 0.25

        const ws2 = Math.sin(31345.0 + Date.now() / 1000) * 30.0
        this.wave2_.x = -ws2 - 135.0
        this.wave2_.y = 40.0
        this.wave2_.scale.y = 1 + Math.sin(Date.now() / 750.0) * 0.15
    }
}

export default Wave