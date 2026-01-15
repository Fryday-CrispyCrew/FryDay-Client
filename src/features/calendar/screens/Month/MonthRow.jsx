import { View, Image, useWindowDimensions } from "react-native";
import AppText from "../../../../shared/components/AppText";
import { getCalendarIconType, CALENDAR_ICONS} from "../../components/CalendarIcon";

export default function MonthRow({ days, isLast, bowlMap }) {
    const { width } = useWindowDimensions();

    return (
        <View style={{ width }}>
            <View className="flex-row px-5" style={{ height: 96 }}>
                {days.map((day, idx) => {
                    if (!day) return <View key={idx} className="flex-1" />;

                    const dStr = day.format("YYYY-MM-DD");
                    const bowlType = bowlMap?.[dStr];
                    const iconType = getCalendarIconType(dStr, bowlType);
                    const Icon = iconType ? CALENDAR_ICONS[iconType] : null;

                    return (
                        <View key={idx} className="flex-1 items-center justify-center">
                            <View className="items-center">
                                <View className="w-10 h-10 mb-2 items-center justify-center">
                                    {Icon ? (
                                        <Image source={Icon} style={{ width: 32, height: 32 }} resizeMode="contain" />
                                    ) : null}
                                </View>

                                <View className="w-4 h-4 items-center justify-center">
                                    <AppText variant="S500" className="text-bk">
                                        {day.date()}
                                    </AppText>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>

            {!isLast && <View className="h-px bg-gr100 mx-8" />}
        </View>
    );
}
