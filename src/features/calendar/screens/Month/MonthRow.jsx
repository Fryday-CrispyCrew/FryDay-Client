import { View, Dimensions, Image } from 'react-native';
import dayjs from 'dayjs';
import AppText from '../../../../shared/components/AppText';
import {
    getCalendarIconType,
    CALENDAR_ICONS,
    TEMP_TODO_MAP,
} from '../../components/CalendarIcon';

const { width } = Dimensions.get('window');

export default function MonthRow({ days, isLast }) {
    return (
        <View style={{ width }}>
            <View className="flex-row px-5" style={{ height: 96 }}>
                {days.map((day, idx) => {
                    if (!day) {
                        return <View key={idx} className="flex-1" />;
                    }

                    const dStr = day.format('YYYY-MM-DD');
                    const todo = TEMP_TODO_MAP[dStr];
                    const iconType = getCalendarIconType(day, todo);
                    const Icon = iconType ? CALENDAR_ICONS[iconType] : null;

                    return (
                        <View key={idx} className="flex-1 items-center justify-center">
                            {day && (
                                <View className="items-center">
                                    {/* 아이콘 */}
                                    <View className="w-10 h-10 mb-2 items-center justify-center">
                                        {Icon && (
                                            <Image
                                                source={Icon}
                                                style={{ width: 32, height: 32 }}
                                                resizeMode="contain"
                                            />
                                        )}
                                    </View>

                                    {/* 날짜 */}
                                    <View className="w-4 h-4 items-center justify-center">
                                        <AppText variant="S500" className="text-bk">
                                            {day.date()}
                                        </AppText>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>

            {!isLast && <View className="h-px bg-gr100 mx-8" />}
        </View>
    );
}
