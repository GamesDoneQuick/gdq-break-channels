import { DateTime } from 'luxon';

const timezone = nodecg.Replicant<string>('timezone', {
	defaultValue: 'America/New_York',
});

/**
 * These times are based on Minneapolis, Jan 6th 2026.
 * Change times to reflect event location and time before event.
 */

const Times: [number, 'night' | 'dawn' | 'day' | 'dusk'][] = [
	[(17 * 60 + 9) * 60, 'night'], // 5:09pm
	[(17 * 60 + 40) * 60, 'dusk'], // 5:40pm
	[(7 * 60 + 12) * 60, 'day'], // 7:12am
	[(7 * 60 + 43) * 60, 'dawn'], // 7:43am
	[0, 'night'], // Midnight
];

/**
 * This time is based on the scheduled time for Day 7 recap.
 * i.e. The Checkpoint.
 * Change time to reflect event schedule before event.
 */
const OmegaShift = [2026, 1, 10, 14, 40, 0] as const;

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
