import * as PIXI from 'pixi.js';

export class ScrollingBackground {
	private readonly width: number;
	moveSpeed: number;

	private readonly components: ScrollingBackgroundComponent[];
	private readonly rows: ScrollingBackgroundRow[];
	private readonly container: PIXI.Container;

	getWidth(): number {
		return this.width;
	}

	getContainer(): PIXI.Container {
		return this.container;
	}

	constructor(width: number, moveSpeed: number) {
		this.width = width;
		this.moveSpeed = moveSpeed;

		this.components = [];
		this.rows = [];
		this.container = new PIXI.Container();
	}

	addComponent(sprite: ScrollingBackgroundComponent) {
		this.components.push(sprite);
		this.container.addChild(sprite.getContainer());
	}

	addComponents(...components: ScrollingBackgroundComponent[]) {
		components.forEach((component) => this.addComponent(component));
	}

	addRow(row: ScrollingBackgroundRow) {
		this.rows.push(row);
		this.container.addChild(row.getContainer());
	}

	addRows(...rows: ScrollingBackgroundRow[]) {
		rows.forEach((row) => this.addRow(row));
	}

	tick(): void {
		this.rows.forEach((row) => row.tick(this.moveSpeed));
		this.components.forEach((component) => component.tick(this.moveSpeed));
	}

	destroy(): void {
		if (!this.container.destroyed) {
			this.rows.forEach((row) => row.destroy());
			this.components.forEach((component) => component.destroy());
			this.container.destroy();
		}
	}
}

export class ScrollingBackgroundRow {
	private readonly parent: ScrollingBackground;
	private moveSpeedFactor: number;
	private gap: [number, number];
	private tileSize: number;
	private randomOrder: boolean;

	private widthWithTileSize: number;
	private readonly container: PIXI.Container;
	private readonly components: ScrollingBackgroundRowComponent[];
	private readonly queue: number[];
	/**
	 * How far past the right border of the background the current gap extends.
	 * The move speed is subtracted from this property every tick - so if gapLeft <= 0, the randomly rolled gap width
	 * has passed, and the next component can start moving.
	 */
	private restGap: number = 0;

	getContainer(): PIXI.Container {
		return this.container;
	}

	/**
	 * @param gap The gap between two components, the first value being the minimum and the second value being the
	 * maximum (both sides inclusive). The gap will then be rounded down to the nearest multiple of tileSize. If a third
	 * value is defined, it is used as the initial gap - when distributing components on channel load, no objects will
	 * be placed within this distance from the left border.
	 */
	constructor(
		parent: ScrollingBackground,
		y: number,
		moveSpeedFactor: number,
		gap: [number, number] | [number, number, number],
		tileSize: number,
		randomOrder: boolean,
		initialComponents: ScrollingBackgroundRowComponent[] = [],
	) {
		this.parent = parent;
		this.moveSpeedFactor = moveSpeedFactor;
		this.gap = [gap[0], gap[1]];
		this.tileSize = tileSize;
		this.widthWithTileSize = Math.ceil(parent.getWidth() / this.tileSize) * this.tileSize;
		this.randomOrder = randomOrder;

		this.container = new PIXI.Container();
		this.container.y = y;
		this.components = [...initialComponents];
		this.queue = this.components.map((component, i) => {
			this.container.addChild(component.getContainer());
			component.getContainer().x = this.widthWithTileSize;
			return i;
		});

		if (this.components.length > 0) {
			// If initial components are defined, immediately distribute them
			let nextX: number = gap[2] ? gap[2] - gap[0] + this.randomGap() : -this.randomGap();
			while (this.queue.length > 0 && nextX < this.widthWithTileSize) {
				const component = this.spawnNextComponent(nextX);
				nextX = this.getOffsetAfterSpawn(component);
				// In case gap is bigger than the component width, immediately despawn it, but keep nextX adjustment
				this.despawnIfOffScreen(component);
			}
			this.restGap = nextX - this.widthWithTileSize;
		}
	}

	addComponent(component: ScrollingBackgroundRowComponent) {
		this.queue.push(this.components.length);
		this.components.push(component);
		this.container.addChild(component.getContainer());
		component.getContainer().x = this.widthWithTileSize;
	}

	addComponents(...components: ScrollingBackgroundRowComponent[]) {
		components.forEach((component) => this.addComponent(component));
	}

	/**
	 *	Override this method to stop the row from entering new components in certain conditions.
	 */
	canEnter(): boolean {
		return true;
	}

	tick(moveSpeed: number): void {
		const multipliedMoveSpeed = moveSpeed * this.moveSpeedFactor;

		this.components.forEach((component) => {
			if (component.isOnScreen()) {
				component.tick(multipliedMoveSpeed);
				this.despawnIfOffScreen(component);
			}
		});

		this.restGap -= multipliedMoveSpeed;
		while (this.restGap <= -this.tileSize) {
			// keep restGap in ]-this.tileSize,0] so spawned components can correctly align to the tile grid
			this.restGap += this.tileSize;
		}

		if (this.restGap <= 0 && this.queue.length > 0 && this.canEnter()) {
			const component = this.spawnNextComponent(
				this.widthWithTileSize + (this.restGap === 0 ? 0 : this.tileSize + this.restGap),
			);
			this.restGap = this.getOffsetAfterSpawn(component) - this.widthWithTileSize;
		}
	}

	destroy(): void {
		this.components.forEach((component) => component.destroy());
		this.container.destroy();
	}

	private spawnNextComponent(x: number): ScrollingBackgroundRowComponent {
		if (this.queue.length === 0) {
			throw new Error('Queue is empty');
		}

		let idx = 0;
		if (this.randomOrder) {
			idx = Math.floor(Math.random() * this.queue.length);
		}
		const component = this.components[this.queue.splice(idx, 1)[0]];

		component.getContainer().x = x;
		component.enter();
		return component;
	}

	private getOffsetAfterSpawn(component: ScrollingBackgroundRowComponent): number {
		return (
			component.getContainer().x + Math.ceil(component.width() / this.tileSize) * this.tileSize + this.randomGap()
		);
	}

	private randomGap(): number {
		return (
			Math.ceil((Math.floor(Math.random() * (this.gap[1] + 1 - this.gap[0])) + this.gap[0]) / this.tileSize) *
			this.tileSize
		);
	}

	private despawnIfOffScreen(component: ScrollingBackgroundRowComponent) {
		if (component.getContainer().x + component.width() <= 0) {
			component.getContainer().x = this.parent.getWidth();
			component.leave();
			this.queue.push(this.components.indexOf(component));
		}
	}
}

export abstract class ScrollingBackgroundComponent {
	protected container: PIXI.Container;

	getContainer(): PIXI.Container {
		return this.container;
	}

	/**
	 * The PIXI object for this component must be passed to the constructor. It can be any object that extends
	 * PIXI.Container - so a single sprite/graphic/text/..., or a container containing multiple children.
	 * Note about position: Do not place objects at x < 0, as x=0 will be used as the left border of your component.
	 * Also, since placement is relative, y=0 is the y-position of the ScrollingBackgroundRow. You can center or offset
	 * the object around that anchor position by either setting the initial y-position or the pivot.
	 */
	constructor(container: PIXI.Container) {
		this.container = container;
	}

	tick(moveSpeed: number): void {}

	/**
	 * Called when the channel is unloaded. Make sure to destroy all loaded textures and sprites.
	 */
	destroy(): void {
		this.container.destroy();
	}
}

export abstract class ScrollingBackgroundRowComponent extends ScrollingBackgroundComponent {
	private onScreen: boolean;

	isOnScreen(): boolean {
		return this.onScreen;
	}

	constructor(container: PIXI.Container) {
		super(container);
		this.onScreen = false;
	}

	/**
	 * Called when the component is about to enter the screen. Can be used to restart animations.
	 */
	enter(): void {
		this.onScreen = true;
	}

	/**
	 * Returns the current width of the component. It is only called while the component is on the screen.
	 * It is called every tick, so please don't do calculations in this method if possible - calculate the width in
	 * enter() instead, store it, and just return that variable in this method.
	 */
	width(): number {
		return this.container.width;
	}

	/**
	 * Do one movement step. It is only called while the component is on the screen.
	 * Override this method if you want to add something more than just horizontal movement.
	 */
	tick(moveSpeed: number): void {
		this.container.x -= moveSpeed;
	}

	/**
	 * Called when the component has completely left the screen. Can be used to stop animations.
	 */
	leave(): void {
		this.onScreen = false;
	}
}

export type ScrollingBackgroundFactory = () => [ScrollingBackground, Promise<void>];
