import { useEffect, useState } from 'react';

const previewQuery = new URLSearchParams(window.location.search);
const preview = previewQuery.has('layout') || previewQuery.has('preview');

let lastActive = !preview;
let active = !preview;

/**
 * This hook is used to determine if the current component exists in a window that is active (i.e. is visible in the
 * program output of OBS). This is useful to prevent stats tracking or visual states being committed to replicants, in
 * the event that a channel is not actually on screen.
 * 
 * As OBS does not currently expose information about the active status of a browser source when it first launches, we
 * rely on other signals in order to guess the initial state, and then use events to correct as they're fired off.
 */
export function useActive() {
	const [isActive, setActive] = useState(active);

	useEffect(() => {
		const update = (event: CustomEvent<ActiveInfo | VisibleInfo>) => {
			let newActive = false;
			if ((event.detail as ActiveInfo).active !== undefined) {
				newActive = (event.detail as ActiveInfo).active!;
			} else {
				newActive = (event.detail as VisibleInfo).visible ? lastActive : false;
			}

			setActive(newActive);
		};

		(window.top ?? window).addEventListener('obsSourceActiveChanged', update);
		(window.top ?? window).addEventListener('obsSourceVisibleChanged', update);

		return () => {
			(window.top ?? window).removeEventListener('obsSourceActiveChanged', update);
			(window.top ?? window).removeEventListener('obsSourceVisibleChanged', update);
		};
	}, []);

	return isActive;
}

function update(event: CustomEvent<ActiveInfo | VisibleInfo>) {
	let newActive = false;
	if ((event.detail as ActiveInfo).active !== undefined) {
		newActive = (event.detail as ActiveInfo).active!;
		lastActive = newActive;
	} else {
		newActive = (event.detail as VisibleInfo).visible ? lastActive : false;
	}

	active = newActive;
}

(window.top ?? window).addEventListener('obsSourceActiveChanged', update);
(window.top ?? window).addEventListener('obsSourceVisibleChanged', update);
