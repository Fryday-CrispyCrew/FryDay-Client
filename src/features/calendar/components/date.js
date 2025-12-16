import dayjs from 'dayjs';

export function getWeekDays(baseDate) {
    const start = baseDate.startOf('week'); // 일요일 기준
    return Array.from({ length: 7 }).map((_, i) =>
        start.add(i, 'day')
    );
}
export function getMonthMatrix(currentDate) {
    const start = currentDate.startOf('month').startOf('week');
    const end = currentDate.endOf('month').endOf('week');

    const weeks = [];
    let day = start;

    while (day.isBefore(end)) {
        const week = Array(7).fill(null).map(() => {
            const d = day;
            day = day.add(1, 'day');
            return d.month() === currentDate.month() ? d : null;
        });

        weeks.push(week);
    }

    return weeks;
}
