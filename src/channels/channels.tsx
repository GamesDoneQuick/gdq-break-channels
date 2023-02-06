export interface ChannelProps {
	lock: () => void;
	unlock: () => void;
}

export function registerChannel(
	name: string,
	channelNumber: number,
	el: (props: ChannelProps) => JSX.Element,
	credit?: Credit,
) {
	const channel = {
		name,
		number: channelNumber,
		el,
		credit,
	};

	const existing = channels.find((channel) => channel.name === name);

	if (existing) {
		Object.assign(existing, channel);
		return;
	}

	channels.push(channel);
}

export const channels: Channel[] = [];

export interface Channel {
	number: number;
	name: string;
	el: (props: ChannelProps) => JSX.Element;
	credit?: Credit;
}

export interface Credit {
	position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
	site?: 'GitHub' | 'Twitter' | 'Twitch' | 'YouTube' | 'Facebook' | 'Mastodon';
	handle: string;
}
