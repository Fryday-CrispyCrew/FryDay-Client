import { View, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import AppText from '../../../shared/components/AppText';
import ArrowLeft from '../assets/svg/ArrowLeft.svg';
import ArrowRight from '../assets/svg/ArrowRight.svg';

export default function ReportHeader({ currentDate, onChangeMonth, joinedAt }) {
    const date = dayjs(currentDate).startOf('month');

    const yearText = date.format('YYYY년');
    const monthText = date.format('M월 리포트');

    // joinedAt = "YYYY-MM" (예: "2026-01")
    const joinedMonth = joinedAt ? dayjs(joinedAt, 'YYYY-MM').startOf('month') : null;

    // 기본: 지난달까지만 허용
    const lastMonth = dayjs().subtract(1, 'month').startOf('month');

    // ✅ 가입월이 지난달보다 미래(=이번달 가입)면 가입월을 max로 허용
    const maxMonth = joinedMonth && joinedMonth.isAfter(lastMonth, 'month')
        ? joinedMonth
        : lastMonth;

    const isPrevHidden = joinedMonth ? date.isSame(joinedMonth, 'month') : true;
    const isNextHidden = date.isSame(maxMonth, 'month');

    const handlePrev = () => {
        if (isPrevHidden) return;
        const prev = date.subtract(1, 'month');
        if (joinedMonth && prev.isBefore(joinedMonth, 'month')) return;
        onChangeMonth(prev);
    };

    const handleNext = () => {
        if (isNextHidden) return;
        const next = date.add(1, 'month');
        if (next.isAfter(maxMonth, 'month')) return;
        onChangeMonth(next);
    };

    return (
        <View className="px-5 py-4 flex-row justify-between items-center">
            <View>
                <AppText variant="M500" className="text-gr500">
                    {yearText}
                </AppText>
                <AppText variant="H3" className="mt-1 text-bk">
                    {monthText}
                </AppText>
            </View>

            <View className="flex-row items-center gap-3">
                <TouchableOpacity onPress={handlePrev} activeOpacity={0.5}>
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${isPrevHidden ? 'opacity-30' : ''}`}>
                        {!isPrevHidden ? <ArrowLeft width={18} height={18} /> : null}
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleNext} activeOpacity={0.5}>
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${isNextHidden ? 'opacity-30' : ''}`}>
                        {!isNextHidden ? <ArrowRight width={18} height={18} /> : null}
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}
