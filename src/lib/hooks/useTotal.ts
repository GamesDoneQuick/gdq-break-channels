import type { Total } from '@/types/tracker';
import { usePreloadedReplicant } from './usePreloadedReplicant';

export function useTotal() {
	return usePreloadedReplicant<Total | null>('total', null);
}
