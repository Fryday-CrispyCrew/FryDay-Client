import dayjs from 'dayjs';

export const CALENDAR_ICONS = {
    EMPTY: require('../assets/png/Empty.png'),
    LITTLE: require('../assets/png/Little.png'),
    MANY: require('../assets/png/Many.png'),
    FULL: require('../assets/png/Full.png'),
    BURNT: require('../assets/png/Burn.png'),
};

/**
 * @param {string} date YYYY-MM-DD
 * @param {string | undefined} bowlType  // 서버 값: EMPTY | LITTLE | MANY | FULL | BURNT
 * @returns {keyof CALENDAR_ICONS | null}
 */
export function getCalendarIconType(date, bowlType) {
    const today = dayjs();

    if (dayjs(date).isAfter(today, 'day')) return null;
    if (!bowlType) return 'EMPTY';

    return bowlType;
}
