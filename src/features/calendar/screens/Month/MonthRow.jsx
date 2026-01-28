import { View, Image, useWindowDimensions, TouchableOpacity } from "react-native";
import dayjs from "dayjs";
import AppText from "../../../../shared/components/AppText";
import { getCalendarIconType, CALENDAR_ICONS } from "../../components/CalendarIcon";

export default function MonthRow({ days, isLast, bowlMap, selectedDate, onSelectDate }) {
    const { width } = useWindowDimensions();
    const todayStr = dayjs().format("YYYY-MM-DD");
    const selectedStr = selectedDate?.format?.("YYYY-MM-DD");

    return (
        <View style={{ width }}>
            <View className="flex-row px-5" style={{ height: 96 }}>
                {days.map((day, idx) => {
                    if (!day) return <View key={idx} className="flex-1" />;

                    const dStr = day.format("YYYY-MM-DD");
                    const isToday = dStr === todayStr;
                    const isSelected = dStr === selectedStr;

                    const bowlType = bowlMap?.[dStr];
                    const iconType = getCalendarIconType(dStr, bowlType);
                    const Icon = iconType ? CALENDAR_ICONS[iconType] : null;

                    return (
                        <View key={dStr} className="flex-1 items-center justify-center">
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => onSelectDate?.(day)}
                                hitSlop={6}
                                className="items-center"
                            >
                                <View className="w-10 h-10 mb-2 items-center justify-center">
                                    {Icon ? (
                                        <Image source={Icon} style={{ width: 32, height: 32 }} resizeMode="contain" />
                                    ) : null}
                                </View>

                                <View className="w-4 h-4 items-center justify-center relative">
                                    {isToday && <View className="absolute w-6 h-6 bg-or rounded-full" />}
                                    {isSelected && !isToday && (
                                        <View className="absolute w-6 h-6 rounded-full border border-or" />
                                    )}

                                    <AppText
                                        variant="S500"
                                        className={isToday ? "text-wt" : isSelected ? "text-or" : "text-bk"}
                                    >
                                        {day.date()}
                                    </AppText>
                                </View>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>

            {!isLast && <View className="h-px bg-gr100 mx-8" />}
        </View>
    );
}
