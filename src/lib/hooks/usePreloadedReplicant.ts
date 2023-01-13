import { useReplicant } from "use-nodecg";

export function usePreloadedReplicant<T>(name: string, initialValue?: T): [T, (newValue: T) => void] {
	const replicant = nodecg.Replicant(name);

	if (replicant.status === 'declared') {
		initialValue = replicant.value as T;
	}

	return useReplicant(name, initialValue as T);
}