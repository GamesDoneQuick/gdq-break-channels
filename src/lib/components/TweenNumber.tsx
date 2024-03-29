import { FC, ReactNode } from 'react';

import { useIncrementNumber } from '../hooks/useIncrementNumber';

interface Props {
	prefix?: ReactNode;
	value?: number;
	fps?: number;
}

const TweenNumber: FC<Props> = (props) => {
	const number = useIncrementNumber(props.value ?? 0, props.fps);

	return (
		<>
			{props.prefix}
			{number.toLocaleString('en-US', { maximumFractionDigits: 0 })}
		</>
	);
};

export default TweenNumber;
