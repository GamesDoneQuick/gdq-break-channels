import foregroundImage from './assets/foreground.png';
import backgroundImage from './assets/background.png';
import { move } from './animations';

interface ScrollingAnimationProps {
	duration: number;
	isPaused?: boolean;
	type: 'foreground' | 'background';
}

export function ScrollingAnimation({ duration, isPaused = false, type }: ScrollingAnimationProps) {
	const zIndex = type === 'foreground' ? 3 : 0;

	return (
		<div
			css={{
				position: 'absolute',
				height: '100%',
				width: '100%',
				bottom: '0%',
				overflow: 'hidden',
				zIndex,
				'&::before, &::after': {
					content: '""',
					position: 'absolute',
					height: '100%',
					width: '100%',
					backgroundImage: `url(${type === 'foreground' ? foregroundImage : backgroundImage})`,
					imageRendering: 'pixelated',
					animation: `${move} ${duration}ms infinite linear`,
					animationPlayState: isPaused ? 'paused' : 'running',
				},
				'&::before': {
					right: '100%',
				},
			}}></div>
	);
}
