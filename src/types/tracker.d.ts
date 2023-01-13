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
