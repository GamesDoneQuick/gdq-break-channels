import gsap from 'gsap'
import { useEffect, useState } from 'react';

export const useIncrementNumber = (newValue: number) => {
	const [number, setNumber] = useState(newValue);

	useEffect(() => {
		const target = {
			value: number,
		};

		const tween = gsap.to(target, {
			value: newValue,
			duration: 0.5,
			ease: 'none',
			onUpdate() {
				setNumber(target.value);
			},
		});

		return () => {
			tween.kill();
		};
	}, [newValue]);

	return number;
};
