import { View, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import AppText from '../../../shared/components/AppText';
import ArrowLeft from '../assets/svg/ArrowLeft.svg';
import ArrowRight from '../assets/svg/ArrowRight.svg';

export default function ReportHeader({ currentDate, onChangeMonth }) {
    const date = dayjs(currentDate);

    const yearText = date.format('YYYY년');
    const monthText = date.format('M월 리포트');

    const todayMonth = dayjs().startOf('month');

    const handlePrev = () => {
        onChangeMonth(date.subtract(1, 'month').startOf('month'));
    };

    const handleNext = () => {
        const nextMonth = date.add(1, 'month').startOf('month');

        if (nextMonth.isAfter(todayMonth)) return;

        onChangeMonth(nextMonth);
    };

    return (
        <View className="px-5 py-4 flex-row justify-between items-center">
            <View>
                <AppText variant="S500" className="text-gr500">
                    {yearText}
                </AppText>
                <AppText variant="H3" className="mt-1 text-bk">
                    {monthText}
                </AppText>
            </View>

            <View className="flex-row items-center gap-3">
                <TouchableOpacity onPress={handlePrev} activeOpacity={0.5}>
                    <View className="w-8 h-8 rounded-full items-center justify-center">
                        <ArrowLeft width={18} height={18} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleNext} activeOpacity={0.5}>
                    <View className="w-8 h-8 rounded-full items-center justify-center">
                        <ArrowRight width={18} height={18} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}
