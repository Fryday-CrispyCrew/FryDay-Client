import dayjs from 'dayjs';

export const CALENDAR_ICONS = {
    EMPTY: require('../assets/png/Empty.png'),
    LESS: require('../assets/png/Little.png'),
    MORE: require('../assets/png/Many.png'),
    FULL: require('../assets/png/Full.png'),
    BURNT: require('../assets/png/Burn.png'),
};

/**
 * @param {string} date YYYY-MM-DD
 * @param {string | undefined} bowlType
 * @returns {keyof CALENDAR_ICONS | null}
 */
export function getCalendarIconType(date, bowlType) {
    const today = dayjs();
    if (dayjs(date).isAfter(today, "day")) return null;

    const key = (bowlType ?? "").trim().toUpperCase();
    if (!key || !(key in CALENDAR_ICONS)) return "EMPTY";
    return key;
}

