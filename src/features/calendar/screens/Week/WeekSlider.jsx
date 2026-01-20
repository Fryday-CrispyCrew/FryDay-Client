import { FlatList, useWindowDimensions } from "react-native";
import { useRef, useEffect, useMemo } from "react";
import { getWeekDays } from "../../components/date";
import WeekRow from "./WeekRow";

export default function WeekSlider({ currentDate, selectedDate, onSelectDate, onChangeDate }) {
    const { width } = useWindowDimensions();
    const listRef = useRef(null);

    const weeks = useMemo(
        () => [
            getWeekDays(currentDate.subtract(1, "week")),
            getWeekDays(currentDate),
            getWeekDays(currentDate.add(1, "week")),
        ],
        [currentDate]
    );

    useEffect(() => {
        requestAnimationFrame(() => {
            listRef.current?.scrollToIndex({ index: 1, animated: false });
        });
    }, [weeks, width]);

    return (
        <FlatList
            ref={listRef}
            data={weeks}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `week-${i}`}
            getItemLayout={(_, i) => ({
                length: width,
                offset: width * i,
                index: i,
            })}
            onMomentumScrollEnd={(e) => {
                const page = Math.round(e.nativeEvent.contentOffset.x / width);
                if (page === 0) onChangeDate((d) => d.subtract(1, "week"));
                if (page === 2) onChangeDate((d) => d.add(1, "week"));
            }}
            renderItem={({ item }) => (
                <WeekRow
                    days={item}
                    selectedDate={selectedDate}
                    onSelectDate={onSelectDate}
                />
            )}
        />
    );
}
