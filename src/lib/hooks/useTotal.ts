import type { Total } from '@gdq/types/tracker';
import { usePreloadedReplicant } from './usePreloadedReplicant';

export function useTotal() {
	return usePreloadedReplicant<Total | null>('total', null);
}
