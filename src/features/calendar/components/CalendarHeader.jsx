import { View, TouchableOpacity } from 'react-native';
import AppText from '../../../shared/components/AppText';

import MonthButton from '../assets/svg/Month.svg';
import WeeklyButton from '../assets/svg/Weekly.svg';
import CategoryIcon from '../../todo/assets/svg/Category.svg';
import TodayIcon from '../../todo/assets/svg/Today.svg';

export default function CalendarHeader({
                                           date,
                                           mode,
                                           onPressButton,
                                           onPressToday,
                                       }) {
    return (
        <View className="w-full px-5 py-4 flex-row justify-between items-center">
            <View>
                <AppText variant="M500" className="text-gr500">
                    {date.year()}년
                </AppText>
                <AppText variant="H3" className="mt-1 text-bk">
                    {date.month() + 1}월
                </AppText>
            </View>

            <View className="flex-row items-center gap-3">
                <TouchableOpacity
                    onPress={onPressButton}
                    className="w-8 h-8 items-center justify-center"
                >
                    {mode === 'week' ? (
                        <MonthButton width={32} height={32} />   // Month 버튼
                    ) : (
                        <WeeklyButton width={24} height={24} />    // Weekly 버튼
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onPressToday}
                    className="w-8 h-8 items-center justify-center"
                >
                    <TodayIcon width={24} height={24} />
                </TouchableOpacity>

                <TouchableOpacity className="w-8 h-8 items-center justify-center">
                    <CategoryIcon width={24} height={24} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

