import { FlatList, useWindowDimensions } from "react-native";
import { useRef, useMemo, useLayoutEffect, useCallback } from "react";
import { getWeekDays } from "../../components/date";
import WeekRow from "./WeekRow";

export default function WeekSlider({
                                       currentDate,
                                       selectedDate,
                                       onSelectDate,
                                       onChangeDate,
                                       bowlMap,
                                   }) {
    const { width } = useWindowDimensions();
    const listRef = useRef(null);
    const isSnappingRef = useRef(false);

    const weeks = useMemo(
        () => [
            getWeekDays(currentDate.subtract(1, "week")),
            getWeekDays(currentDate),
            getWeekDays(currentDate.add(1, "week")),
        ],
        [currentDate]
    );

    const snapToCenter = useCallback(() => {
        if (!listRef.current) return;
        isSnappingRef.current = true;
        listRef.current.scrollToOffset({ offset: width, animated: false });
        requestAnimationFrame(() => {
            isSnappingRef.current = false;
        });
    }, [width]);

    useLayoutEffect(() => {
        snapToCenter();
    }, [snapToCenter, weeks]);

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
                if (isSnappingRef.current) return;

                const page = Math.round(e.nativeEvent.contentOffset.x / width);

                if (page === 0) {
                    onChangeDate(currentDate.subtract(1, "week"));
                }
                if (page === 2) {
                    onChangeDate(currentDate.add(1, "week"));
                }
            }}
            renderItem={({ item }) => (
                <WeekRow
                    days={item}
                    selectedDate={selectedDate}
                    onSelectDate={onSelectDate}
                    bowlMap={bowlMap}
                />
            )}
        />
    );
}
