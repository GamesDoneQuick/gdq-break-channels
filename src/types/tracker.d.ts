export interface FormattedDonation {
	amount: string;
	rawAmount: number;
	newTotal: string;
	rawNewTotal: number;
}

export interface Total {
	raw: number;
	formatted: string;
}

export interface TwitchSubscription {
	user_name: string;
	display_name: string;
	channel_name: string;
	user_id: string;
	channel_id: string;
	time: string;
	sub_plan: string;
	sub_plan_name: string;
	months: number;
	context: string;
	sub_message: {
		message: string;
		emotes: any[];
	};
}
