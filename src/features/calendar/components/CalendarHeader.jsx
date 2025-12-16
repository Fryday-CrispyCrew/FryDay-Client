import { View, TouchableOpacity } from 'react-native';
import AppText from '../../../shared/components/AppText';

import CalendarButton from '../assets/svg/CalendarButton.svg';
import CategoryIcon from '../../todo/assets/svg/Category.svg';
import TodayIcon from '../../todo/assets/svg/Today.svg';

export default function CalendarHeader({ date, onPressButton, onPressToday }) {
    return (
        <View className="w-full px-5 py-4 flex-row justify-between items-center">
            <View className="flex-col items-start">
                <AppText variant="S500" className="text-gr500">
                    {date.year()}년
                </AppText>
                <AppText variant="H3" className="mt-0.5 text-bk">
                    {date.month() + 1}월
                </AppText>
            </View>

            {/* 오른쪽: 버튼들 */}
            <View className="flex-row items-center gap-3">
                <TouchableOpacity
                    onPress={onPressButton}
                    activeOpacity={0.5}
                    className="w-8 h-8 items-center justify-center">
                    <CalendarButton width={32} height={32} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onPressToday}
                    activeOpacity={0.5}
                    className="w-8 h-8 items-center justify-center">
                    <TodayIcon width={24} height={24} />
                </TouchableOpacity>

                <TouchableOpacity className="w-8 h-8 items-center justify-center">
                    <CategoryIcon width={24} height={24} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
