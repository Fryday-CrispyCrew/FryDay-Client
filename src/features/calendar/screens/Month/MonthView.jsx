import { View, FlatList, useWindowDimensions } from "react-native";
import { useMemo, useRef, useLayoutEffect, useCallback } from "react";
import MonthRow from "./MonthRow";
import { getMonthMatrix } from "../../components/date";

export default function MonthView({
                                      currentDate,
                                      onChangeDate,
                                      bowlMap,
                                      selectedDate,
                                      onSelectDate,
                                      onSwipeStart,
                                      onMonthChanged,
                                  }) {
    const { width } = useWindowDimensions();
    const listRef = useRef(null);
    const isSnappingRef = useRef(false);
    const lastHandledPageRef = useRef(1);

    const months = useMemo(
        () => [
            currentDate.subtract(1, "month"),
            currentDate,
            currentDate.add(1, "month"),
        ],
        [currentDate]
    );

    const snapToCenter = useCallback(() => {
        const ref = listRef.current;
        if (!ref || !width) return;

        isSnappingRef.current = true;
        lastHandledPageRef.current = 1;

        ref.scrollToOffset({ offset: width, animated: false });

        requestAnimationFrame(() => {
            isSnappingRef.current = false;
        });
    }, [width]);

    useLayoutEffect(() => {
        snapToCenter();
    }, [snapToCenter, months]);

    return (
        <FlatList
            ref={listRef}
            data={months}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `month-${i}`}
            getItemLayout={(_, i) => ({
                length: width,
                offset: width * i,
                index: i,
            })}
            onMomentumScrollBegin={() => {
                onSwipeStart?.();
            }}
            onMomentumScrollEnd={(e) => {
                if (isSnappingRef.current) return;

                const page = Math.round(e.nativeEvent.contentOffset.x / width);

                if (page === lastHandledPageRef.current) return;
                lastHandledPageRef.current = page;

                if (page === 0) {
                    onChangeDate(currentDate.subtract(1, "month"));
                    onMonthChanged?.(currentDate.subtract(1, "month"));
                    return;
                }
                if (page === 2) {
                    onChangeDate(currentDate.add(1, "month"));
                    onMonthChanged?.(currentDate.add(1, "month"));
                }
            }}
            renderItem={({ item }) => {
                const weeks = getMonthMatrix(item);
                return (
                    <View style={{ width }}>
                        {weeks.map((days, idx) => (
                            <MonthRow
                                key={idx}
                                days={days}
                                isLast={idx === weeks.length - 1}
                                bowlMap={bowlMap}
                                selectedDate={selectedDate}
                                onSelectDate={onSelectDate}
                            />
                        ))}
                    </View>
                );
            }}
        />
    );
}
