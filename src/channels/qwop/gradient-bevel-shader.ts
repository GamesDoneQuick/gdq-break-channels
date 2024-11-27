import {
	CLEAR_MODES,
	Filter,
	FilterSystem,
	ISpriteMaskTarget,
	Matrix,
	RenderTexture,
	Texture,
	TextureMatrix,
} from 'pixi.js';
import vertex from './assets/shaders/gradientbevel_vert.glsl?raw';
import fragment from './assets/shaders/assets_gradientbevel.glsl?raw';

export class GradientBevelShader extends Filter {
	public normal: ISpriteMaskTarget;
	public normalMatrix: Matrix;
	public gradient: Texture;

	constructor(normal: ISpriteMaskTarget, gradient: Texture) {
		normal.renderable = false;

		const normalMatrix = new Matrix();

		super(vertex, fragment, {
			normalSampler: normal._texture,
			normalMatrix: normalMatrix,
			gradientSampler: gradient,
			lightVec: { x: 1, y: 0 },
		});

		this.normal = normal;
		this.gradient = gradient;
		this.normalMatrix = normalMatrix;
	}

	public apply(
		filterManager: FilterSystem,
		input: RenderTexture,
		output: RenderTexture,
		clearMode: CLEAR_MODES,
	): void {
		const tex = this.normal._texture;

		if (!tex.valid) {
			return;
		}
		if (!tex.uvMatrix) {
			tex.uvMatrix = new TextureMatrix(tex, 0.0);
		}

		tex.uvMatrix.update();

		this.uniforms.normalMatrix = filterManager
			.calculateSpriteMatrix(this.normalMatrix, this.normal)
			.prepend(tex.uvMatrix.mapCoord);

		this.uniforms.normalClamp = tex.uvMatrix.uClampFrame;

		filterManager.applyFilter(this, input, output, clearMode);
	}

	get lightVec(): { x: number; y: number } {
		return this.uniforms.lightVec;
	}

	set lightVec(vec: { x: number; y: number }) {
		this.uniforms.lightVec = vec;
	}
}
