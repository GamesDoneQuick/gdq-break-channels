import '@/lib/nodecg-shim';
import '@/assets/fonts.css';

import ReactDOM from 'react-dom';
import { Total } from '@/types/tracker';
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

NodeCG.waitForReplicants(breakChannel, totalRep).then(() => {
	ReactDOM.render(<App />, document.getElementById('root'));
});
