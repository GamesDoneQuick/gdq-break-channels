import '@/lib/nodecg-shim';
import '@/assets/fonts.css';

import ReactDOM from 'react-dom';
import { Total, Event } from '@/types/tracker';
import { App } from './app';

const totalRep = nodecg.Replicant<Total>('total', {
	defaultValue: {
		raw: 0,
		formatted: '$0',
	},
});

const breakChannel = nodecg.Replicant<number>('break-channel', {
	defaultValue: 0,
});

const currentEventRep = nodecg.Replicant<Event>('currentEvent', {
	defaultValue: {
		id: 43,
		name: 'Summer Games Done Quick 2023',
		shortname: 'SGDQ2023',
		locked: false,
		allowDonations: false,
		beneficiary: 'Doctors Without Borders',
		beneficiaryShort: 'MSF',
		hashtag: '#SGDQ2023',
	},
});

NodeCG.waitForReplicants(breakChannel, totalRep, currentEventRep).then(() => {
	ReactDOM.render(<App />, document.getElementById('root'));
});
