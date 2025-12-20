import dayjs from 'dayjs';

export const CALENDAR_ICONS = {
    Empty: require('../assets/png/Empty.png'),
    Little: require('../assets/png/Little.png'),
    Many: require('../assets/png/Many.png'),
    Full: require('../assets/png/Full.png'),
    Burn: require('../assets/png/Burn.png'),
};

// 임시 데이터
export const TEMP_TODO_MAP = {
    '2025-12-10': { total: 4, completed: 2 },
    '2025-12-11': { total: 3, completed: 0 },
    '2025-12-12': { total: 0, completed: 0 },
    '2025-12-13': { total: 3, completed: 1 },
    '2025-12-14': { total: 4, completed: 2 },
    '2025-12-15': { total: 2, completed: 2 },
    '2025-12-16': { total: 3, completed: 0 },
    '2025-12-17': { total: 4, completed: 2 },
    '2025-12-19': { total: 3, completed: 0 },
};

export function getCalendarIconType(date, todo) {
    const today = dayjs();

    if (dayjs(date).isAfter(today, 'day')) return null; // 미래??

    if (!todo || todo.total === 0) return 'Empty'; // 빈그릇

    const { total, completed } = todo;
    const incomplete = total - completed;

    if (completed === total) return 'Full';
    if (completed === 0) return 'Burn';
    if (completed >= incomplete) return 'Many';
    return 'Little';
}
