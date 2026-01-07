interface Window {
	addEventListener(
		type: 'pinballScore',
		listener: (event: CustomEvent<{ score: number }>) => any,
		options?: boolean | AddEventListenerOptions,
	);
}
