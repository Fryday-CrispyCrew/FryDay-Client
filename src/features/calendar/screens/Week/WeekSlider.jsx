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
    const lockRef = useRef(false);

    const weeks = useMemo(() => {
        const prev = currentDate.clone().subtract(1, "week");
        const cur = currentDate.clone();
        const next = currentDate.clone().add(1, "week");
        return [getWeekDays(prev), getWeekDays(cur), getWeekDays(next)];
    }, [currentDate]);

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

    const handleMomentumEnd = useCallback(
        (e) => {
            if (isSnappingRef.current) return;
            if (lockRef.current) return;

            const x = e.nativeEvent.contentOffset.x;
            const page = Math.round(x / width);

            if (page === 1) return;

            lockRef.current = true;

            const nextDate =
                page === 0
                    ? currentDate.clone().subtract(1, "week")
                    : currentDate.clone().add(1, "week");

            onChangeDate(nextDate);

            requestAnimationFrame(() => {
                lockRef.current = false;
            });
        },
        [currentDate, onChangeDate, width]
    );

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
            onMomentumScrollEnd={handleMomentumEnd}
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
