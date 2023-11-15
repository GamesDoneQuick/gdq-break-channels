import Box2DFactory from 'box2d-wasm';
import Box2DWASM from 'box2d-wasm/dist/es/Box2D.simd.wasm?url';
import { useEffect, useMemo, useState } from 'react';

let Box2D: (typeof globalThis.Box2D & EmscriptenModule) | undefined = undefined;

const promise = Box2DFactory({
	locateFile: () => Box2DWASM,
}).then((box2d) => {
	Box2D = box2d;
	return box2d;
});

export type WorldWithDestroy = Box2D.b2World & { destroyed: boolean };

export function useBox2D() {
	const [box2d, setBox2d] = useState<typeof Box2D>(Box2D);

	const leakMitigator = useMemo(() => {
		if (!box2d) return undefined;
		return new box2d.LeakMitigator();
	}, [box2d]);

	const world = useMemo(() => {
		if (!box2d) return undefined;

		const gravity = new box2d.b2Vec2(0, 10);
		const world = new box2d.b2World(gravity) as WorldWithDestroy;
		world.destroyed = false;
		box2d.destroy(gravity);
		return world;
	}, [box2d]);

	useEffect(() => {
		if (box2d) return;

		promise.then((val) => {
			setBox2d(val);
		});
	}, []);

	useEffect(() => {
		if (!box2d || !world || !leakMitigator) return;

		return () => {
			for (
				let body = leakMitigator.recordLeak(world.GetBodyList());
				box2d.getPointer(body) !== box2d.getPointer(box2d.NULL);
				body = leakMitigator.recordLeak(body.GetNext())
			) {
				world.DestroyBody(body);
			}

			for (
				let joint = leakMitigator.recordLeak(world.GetJointList());
				box2d.getPointer(joint) !== box2d.getPointer(box2d.NULL);
				joint = leakMitigator.recordLeak(joint.GetNext())
			) {
				world.DestroyJoint(joint);
			}

			box2d.destroy(world);
			leakMitigator.freeLeaked();
			world.destroyed = true;
		};
	}, [box2d, world, leakMitigator]);

	return [box2d, world, leakMitigator?.recordLeak] as const;
}
