import PinballWasm from './bin/SpaceCadetPinball.wasm?url';
//@ts-expect-error
import SpaceCadetPinball from './bin/SpaceCadetPinball.mjs';
import type { MainModule } from './bin/SpaceCadetPinball.d.ts';

export const offscreen = new OffscreenCanvas(600, 416) as OffscreenCanvas & {
	style: Record<string, any>;
};
offscreen.style = {};

let resolve: (data: MainModule) => void;
let reject: (reason?: any) => void;

const Module = new Promise<MainModule>((res, rej) => {
	resolve = res;
	reject = rej;
});

export function loadPinball(dataUrl: URL) {
	fetch(dataUrl, { method: 'HEAD' }).then((res) => {
		if (!res.ok) {
			reject();
			return;
		}

		SpaceCadetPinball({
			canvas: offscreen,
			locateFile: (file: string) => {
				if (file === 'SpaceCadetPinball.data') return dataUrl;
				else return PinballWasm;
			},
		})
			.then(resolve)
			.catch(reject);
	});
}

Module.then((game) => {
	game.pause(true);
});

Module.catch(() => {
	console.error('Could not run/load Pinball (maybe data file is missing?)');
});

export default Module;
