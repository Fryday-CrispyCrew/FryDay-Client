import React, { useState, useEffect, useCallback } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";

import CalendarHeader from "../components/CalendarHeader";
import WeekdayHeader from "../components/WeekdayHeader";
import MonthView from "./Month/MonthView";
import WeekSlider from "./Week/WeekSlider";
import AppText from "../../../shared/components/AppText";
import Dotted from "../assets/svg/Dotted.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getDailyResults } from "../api/dailyResultsApi";

export default function CalendarScreen() {
    const [mode, setMode] = useState("month"); // 'week' | 'month'
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [selectedDate, setSelectedDate] = useState(dayjs());

    const [bowlMap, setBowlMap] = useState([]);

    const handlePressToday = useCallback(() => {
        const today = dayjs();
        if (mode === "week") {
            setCurrentDate(today);
            setSelectedDate(today);
        } else {
            setCurrentDate(today.startOf("month"));
        }
    }, [mode]);

    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem("calendarMode");
            if (saved === "week" || saved === "month") setMode(saved);
        })();
    }, []);

    const toggleMode = useCallback(() => {
        setMode((m) => {
            const next = m === "week" ? "month" : "week";
            AsyncStorage.setItem("calendarMode", next);
            return next;
        });
    }, []);

    useEffect(() => {
        const startDate = currentDate.startOf("month").format("YYYY-MM-DD");
        const endDate = currentDate.endOf("month").format("YYYY-MM-DD");

        (async () => {
            try {
                const map = await getDailyResults(startDate, endDate);
                setBowlMap(map);
            } catch (e) {
            }
        })();
    }, [currentDate]);

    return (
        <SafeAreaView className="flex-1 bg-wt" edges={["top", "bottom"]}>
            <CalendarHeader
                date={currentDate}
                mode={mode}
                onPressButton={toggleMode}
                onPressToday={handlePressToday}
            />

            <WeekdayHeader />

            <View className="flex-1">
                {mode === "week" ? (
                    <>
                        <View className="shrink-0">
                            <WeekSlider
                                currentDate={currentDate}
                                selectedDate={selectedDate}
                                onSelectDate={setSelectedDate}
                                onChangeDate={setCurrentDate}
                                bowlMap={bowlMap}
                            />
                        </View>
                        {/* 구분선 */}
                        <View className="mt-3 mx-5 shrink-0">
                            <Dotted style={{ width: "100%" }} height={1} />
                        </View>

                        {/* 임시 */}
                        <View className="mt-[18px] items-center shrink-0">
                            <AppText variant="M500" className="text-bk">
                                {selectedDate.format('M월 D일')}
                            </AppText>
                        </View>
                    </>
                ) : (
                    <MonthView
                        currentDate={currentDate}
                        onChangeDate={setCurrentDate}
                        bowlMap={bowlMap}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
