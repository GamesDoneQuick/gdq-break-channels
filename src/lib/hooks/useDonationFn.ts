import { FormattedDonation } from '@gdq/types/tracker';
import { useListenForFn } from './useListenForFn';

export function useDonationFn(cb: (donation: FormattedDonation) => void) {
	return useListenForFn('donation', cb);
}
