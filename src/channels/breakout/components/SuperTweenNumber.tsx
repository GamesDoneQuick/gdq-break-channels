import { useIncrementNumber } from '@gdq/lib/hooks/useIncrementNumber';
import { FC } from 'react';

interface Props {
	readonly value?: number;
	readonly letterColors: string[];
}

const SuperTweenNumber: FC<Props> = (props) => {
	const number = useIncrementNumber(props.value ?? 0);

	return (
		<>
			{['$', ...number.toLocaleString('en-US', { maximumFractionDigits: 0 })].map((letter, i) => (
				<span key={i} style={{ color: props.letterColors[i % props.letterColors.length] }}>
					{letter}
				</span>
			))}
		</>
	);
};

export default SuperTweenNumber;
