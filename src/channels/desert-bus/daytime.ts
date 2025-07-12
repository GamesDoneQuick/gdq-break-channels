import { DateTime } from 'luxon';

const timezone = nodecg.Replicant<string>('timezone', {
	defaultValue: 'America/New_York',
});

/**
 * These times are based on Minneapolis, July 7th 2025.
 * Change times to reflect event location and time before event.
 */

const Times: [number, 'night' | 'dawn' | 'day' | 'dusk'][] = [
	[(21 * 60 + 1) * 60, 'night'], // 9:01pm
	[(21 * 60 + 37) * 60, 'dusk'], // 9:37pm
	[(4 * 60 + 57) * 60, 'day'], // 4:57am
	[(5 * 60 + 34) * 60, 'dawn'], // 5:34am
	[0, 'night'], // Midnight
];

/**
 * This time is based on the scheduled time for Day 7 recap.
 * i.e. The Checkpoint.
 * Change time to reflect event schedule before event.
 */
const OmegaShift = [2025, 7, 13, 17, 50, 0] as const;

export function dayTime() {
	const datetime = DateTime.local({ zone: timezone.value });
	const seconds = datetime.toSeconds() - datetime.startOf('day').toSeconds();

	for (const Time of Times) {
		if (seconds > Time[0]) return Time[1];
	}

	return Times[0][1];
}

export function shiftTime(): 'zeta' | 'dawn' | 'alpha' | 'night' | 'omega' {
	const omegaShiftStart = DateTime.local(...OmegaShift, { zone: timezone.value });
	const datetime = DateTime.local({ zone: timezone.value });

	if (datetime.toSeconds() > omegaShiftStart.toSeconds()) return 'omega';

	const hour = datetime.hour;

	if (hour >= 18) return 'night';
	if (hour >= 12) return 'alpha';
	if (hour >= 6) return 'dawn';
	return 'zeta';
}
