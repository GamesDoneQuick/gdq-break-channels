import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';

const TotalEl = styled.div`
	font-family: gdqpixel;
	font-size: 32px;
	color: white;
	position: absolute;
	left: 50%;
	top: calc(100% - 28px);
	transform: translate(-50%, -50%);
`;

export function Total({ displayTotal }: { displayTotal: number }) {
	return (
		<TotalEl>
			$<TweenNumber value={displayTotal} />
		</TotalEl>
	);
}
