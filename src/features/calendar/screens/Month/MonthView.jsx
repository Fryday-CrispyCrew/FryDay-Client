import { View, FlatList, useWindowDimensions } from "react-native";
import { useMemo, useRef, useEffect } from "react";
import MonthRow from "./MonthRow";
import { getMonthMatrix } from "../../components/date";

export default function MonthView({ currentDate, onChangeDate }) {
    const { width } = useWindowDimensions();
    const listRef = useRef(null);

    const months = useMemo(
        () => [
            currentDate.subtract(1, "month"),
            currentDate,
            currentDate.add(1, "month"),
        ],
        [currentDate]
    );

    const lastHandledPageRef = useRef(1);

    useEffect(() => {
        requestAnimationFrame(() => {
            lastHandledPageRef.current = 1;
            listRef.current?.scrollToIndex({ index: 1, animated: false });
        });
    }, [months, width]);

    return (
        <FlatList
            ref={listRef}
            data={months}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => `month-${i}`}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(e) => {
                const page = Math.round(e.nativeEvent.contentOffset.x / width);

                if (page === lastHandledPageRef.current) return;
                lastHandledPageRef.current = page;

                if (page === 0) onChangeDate((d) => d.subtract(1, "month"));
                if (page === 2) onChangeDate((d) => d.add(1, "month"));
            }}
            renderItem={({ item }) => {
                const weeks = getMonthMatrix(item);
                return (
                    <View style={{ width }}>
                        {weeks.map((days, idx) => (
                            <MonthRow key={idx} days={days} isLast={idx === weeks.length - 1} />
                        ))}
                    </View>
                );
            }}
        />
    );
}
