import { useEffect, useRef } from 'react';

export function useListenForFn<T>(messageName: string, handler: (message: T) => void) {
	const funcRef = useRef((_: T) => {});

	useEffect(() => {
		funcRef.current = handler;
	});

	useEffect(() => {
		const callback = (message: T) => {
			return funcRef.current(message);
		};

		nodecg.listenFor(messageName, callback);
		return () => {
			nodecg.unlisten(messageName, callback);
		};
	}, []);
}
