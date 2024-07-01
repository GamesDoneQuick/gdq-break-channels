import { DateTime } from 'luxon';

const timezone = nodecg.Replicant<string>('timezone', {
	defaultValue: 'America/New_York',
});

/**
 * These times are based on Pittsburgh, January 14th 2024.
 * Change times to reflect event location and time before event.
 */

const Times: [number, 'night' | 'dawn' | 'day' | 'dusk'][] = [
	[(17 * 60 + 46) * 60, 'night'], // 5:46pm
	[(17 * 60 + 16) * 60, 'dusk'], // 5:16pm
	[(7 * 60 + 41) * 60, 'day'], // 7:41am
	[(7 * 60 + 11) * 60, 'dawn'], // 7:11am
	[0, 'night'], // Midnight
];

/**
 * This time is based on the scheduled time for Day 7 recap.
 * i.e. The Checkpoint.
 * Change time to reflect event schedule before event.
 */
const OmegaShift = [2024, 7, 6, 4, 26, 0] as const;

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
