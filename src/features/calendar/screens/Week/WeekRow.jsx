import { View, TouchableOpacity, Dimensions } from 'react-native';
import dayjs from 'dayjs';
import AppText from '../../../../shared/components/AppText';
import { getCalendarIconType } from '../../components/CalendarIcon';
import { CALENDAR_ICONS } from '../../components/CalendarIcon';
import { TEMP_TODO_MAP } from '../../components/CalendarIcon';
import { Image } from 'react-native';


const { width } = Dimensions.get('window');

export default function WeekRow({ days, selectedDate, onSelectDate }) {
    const todayStr = dayjs().format('YYYY-MM-DD');

    return (
        <View style={{ width }}>
            <View className="flex-row px-5" style={{ height: 120 }}>
                {days.map(d => {
                    const dStr = d.format('YYYY-MM-DD');
                    const isToday = dStr === todayStr;
                    const isSelected = dStr === selectedDate.format('YYYY-MM-DD');

                    const todo = TEMP_TODO_MAP[dStr];
                    const iconType = getCalendarIconType(d, todo);
                    const Icon = iconType ? CALENDAR_ICONS[iconType] : null;

                    return (
                        <View key={dStr} className="flex-1 items-center justify-center">
                            {/* 아이콘 + 날짜 */}
                            <View className="items-center">
                                {/* 아이콘 */}
                                <View className="w-10 h-10 mb-5 items-center justify-center">
                                    {Icon && (
                                        <Image
                                            source={Icon}
                                            style={{ width: 36, height: 36 }}
                                            resizeMode="contain"
                                        />
                                    )}
                                </View>

                                {/* 날짜 */}
                                <TouchableOpacity activeOpacity={0.7} onPress={() => onSelectDate(d)}>
                                    <View className="w-4 h-4 items-center justify-center relative">
                                        {isToday && (
                                            <View className="absolute w-6 h-6 bg-or rounded-full" />
                                        )}
                                        {isSelected && !isToday && (
                                            <View className="absolute w-6 h-6 rounded-full border border-or" />
                                        )}

                                        <AppText
                                            variant="S500"
                                            className={[
                                                isToday && 'text-wt',
                                                isSelected && !isToday && 'text-or',
                                                !isToday && !isSelected && 'text-bk',
                                            ].join(' ')}
                                        >
                                            {d.date()}
                                        </AppText>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>

    );
}
