import type { FormattedDonation, Total } from '@gdq/types/tracker';
import { ChannelProps, registerChannel } from '../channels';

import { useEffect, useState, useReducer } from 'react';
import { useListenFor, useReplicant } from 'use-nodecg';
import styled from '@emotion/styled';
import TweenNumber from '@gdq/lib/components/TweenNumber';


import img_background from './assets/background.png'
import img_idle from './assets/idle.png';
import img_run from './assets/run.gif'
import { useGetSetState, useSetState } from 'react-use';

registerChannel('The Incredible Machine', 86, TheIncredibleMachine, {
	position: 'bottomLeft',
	handle: 'Big_PHat',
});



function TheIncredibleMachine(props: ChannelProps) {
	const [total] = useReplicant<Total | null>('total', null);
	const [machineRunning, setMachineRunning] = useState(false);

	useListenFor('donation', (donation: FormattedDonation) => {
		if (!machineRunning)
		{
			setMachineRunning(true);
			setTimeout(() => setMachineRunning(false), 5000);
		}
	});

	return (
		<Container>
			<TotalEl>
				$<TweenNumber value={total?.raw} />
			</TotalEl>
			{machineRunning && 
				<Machine src={img_run}/>
			}
			{!machineRunning &&
				<Machine src={img_idle}/>
			}
		</Container>
	);
}

const Container = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	background-image: url('${img_background}');
`;

const Machine = styled.img`
	top:0;
	left:0;
`;

const TotalEl = styled.div`
	font-family: DotumChe;
	font-size: 56px;
	color: yellow;

	position: absolute;

	right: 17%;
	bottom: 6%;
`;
