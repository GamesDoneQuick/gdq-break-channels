import { usePreloadedReplicant } from '@gdq/lib/hooks/usePreloadedReplicant';
import { FormattedDonation, Total, TwitchSubscription } from '@gdq/types/tracker';
import { Button, MenuItem, Select } from '@mui/material';
import { channels } from '..';
import { BreakChannels } from './preview';
import styled from '@emotion/styled';
import tw, { css } from 'twin.macro';
import { Global } from '@emotion/react';

import { loadPinball } from '@gdq/channels/pinball/import';
loadPinball(new URL('../channels/pinball/bin/SpaceCadetPinball.data', import.meta.url));

const totalRep = nodecg.Replicant<Total>('total', {
	defaultValue: {
		raw: 0,
		formatted: '$0',
	},
});

export function App() {
	const [breakChannel, setBreakChannel] = usePreloadedReplicant<number>('break-channel', 0);
	const [timeZone, setTimeZone] = usePreloadedReplicant<string>('timezone', 'America/New_York');

	return (
		<>
			<Global
				styles={css`
					body {
						${tw`leading-none text-white`}
					}
				`}
			/>
			<BreakChannels />
			<Row>
				<Select value={breakChannel} onChange={(e) => setBreakChannel(e.target.value as number)}>
					{channels.map((channel, idx) => (
						<MenuItem key={idx} value={idx}>
							{channel.name}
						</MenuItem>
					))}
				</Select>
				<Button
					onClick={() => {
						const amount = Math.floor(Math.random() * 20000) / 100 + 5;
						const newTotal = Math.floor((totalRep.value!.raw + amount) * 100) / 100;

						nodecg.sendMessage('donation', {
							amount: formatCurrency(amount, 2),
							rawAmount: amount,
							newTotal: formatCurrency(newTotal),
							rawNewTotal: newTotal,
						} as FormattedDonation);

						totalRep.value = {
							raw: newTotal,
							formatted: formatCurrency(newTotal),
						};
					}}
					variant="contained">
					Test Donation
				</Button>
				<Button
					onClick={() => {
						const subplan = ['1000', '2000', '3000', 'Prime'][Math.floor(Math.random() * 4)];

						nodecg.sendMessage('subscription', {
							user_name: 'test',
							display_name: 'Test',
							channel_name: 'gamesdonequick',
							user_id: '1234',
							channel_id: '22510310',
							time: '2023-03-15T07:38:33+0000',
							sub_plan: subplan,
							sub_plan_name: 'Channel Subscription (gamesdonequick)',
							months: 0,
							context: 'sub',
							sub_message: {
								message: '',
								emotes: null,
							},
						} as TwitchSubscription);
					}}
					variant="contained">
					Test Subscription
				</Button>
				<Button
					variant="contained"
					onClick={() => setBreakChannel((breakChannel + channels.length - 1) % channels.length)}>
					Previous
				</Button>
				<Button variant="contained" onClick={() => setBreakChannel((breakChannel! + 1) % channels.length)}>
					Next
				</Button>
			</Row>
			<Row>
				<Select value={timeZone} onChange={(e) => setTimeZone(e.target.value)}>
					{timeZones.map((zone, idx) => (
						<MenuItem key={idx} value={zone}>
							{zone}
						</MenuItem>
					))}
				</Select>
			</Row>
		</>
	);
}

function formatCurrency(amount: number, fractionDigits?: number) {
	return amount.toLocaleString('en-US', {
		maximumFractionDigits: fractionDigits,
		minimumFractionDigits: fractionDigits,
		style: 'currency',
		currency: 'USD',
	});
}

const timeZones = [
	'America/Adak',
	'America/Anchorage',
	'America/Boise',
	'America/Chicago',
	'America/Denver',
	'America/Detroit',
	'America/Indiana/Knox',
	'America/Indiana/Marengo',
	'America/Indiana/Petersburg',
	'America/Indiana/Tell_City',
	'America/Indiana/Vevay',
	'America/Indiana/Vincennes',
	'America/Indiana/Winamac',
	'America/Indianapolis',
	'America/Juneau',
	'America/Kentucky/Monticello',
	'America/Los_Angeles',
	'America/Louisville',
	'America/Menominee',
	'America/Metlakatla',
	'America/New_York',
	'America/Nome',
	'America/North_Dakota/Beulah',
	'America/North_Dakota/Center',
	'America/North_Dakota/New_Salem',
	'America/Phoenix',
	'America/Sitka',
	'America/Yakutat',
	'Pacific/Honolulu',
	'Australia/Melbourne',
	'Europe/London',
] as const;

const Row = styled.div`
	display: flex;
	gap: 10px;
`;
