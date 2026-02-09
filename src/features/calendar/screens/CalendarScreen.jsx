import React, { useState, useEffect, useCallback } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CalendarHeader from "../components/CalendarHeader";
import WeekdayHeader from "../components/WeekdayHeader";
import MonthView from "./Month/MonthView";
import WeekSlider from "./Week/WeekSlider";
import Dotted from "../assets/svg/Dotted.svg";

import TodoBoardSection from "../../todo/components/TodoBoardSection";
import { getDailyResultsMap } from "../api/dailyResultsApi";
import YearMonthWheelModal from "../../todo/components/RepeatSettingsSection/wheel/YearMonthWheelModal";

function buildTodayState(mode) {
    const today = dayjs();
    return {
        mode,
        currentDate: mode === "week" ? today : today.startOf("month"),
        selectedDate: today,
    };
}

export default function CalendarScreen({ navigation }) {
    const [ready, setReady] = useState(false);
    const [state, setState] = useState(() => buildTodayState("month"));

    const { mode, currentDate, selectedDate } = state;

    const selectedDateStr = selectedDate.format("YYYY-MM-DD");
    const isViewingToday = selectedDate.isSame(dayjs(), "day");

    const [isYMModalOpen, setIsYMModalOpen] = useState(false);
    const openYMModal = useCallback(() => setIsYMModalOpen(true), []);
    const closeYMModal = useCallback(() => setIsYMModalOpen(false), []);

    const handleConfirmYM = useCallback((year, month) => {
        const next = dayjs().year(year).month(month - 1).startOf("month");
        setState((s) => ({ ...s, currentDate: next }));
        setIsYMModalOpen(false);
    }, []);

    const [bowlMap, setBowlMap] = useState({});

    useFocusEffect(
        useCallback(() => {
            setState((s) => buildTodayState(s.mode));
        }, [])
    );

    useEffect(() => {
        let alive = true;
        (async () => {
            const saved = await AsyncStorage.getItem("calendarMode");
            const initialMode = saved === "week" || saved === "month" ? saved : "month";
            if (!alive) return;
            setState(buildTodayState(initialMode));
            setReady(true);
        })();
        return () => {
            alive = false;
        };
    }, []);

    const toggleMode = useCallback(() => {
        setState((s) => {
            const nextMode = s.mode === "week" ? "month" : "week";
            AsyncStorage.setItem("calendarMode", nextMode);
            return buildTodayState(nextMode);
        });
    }, []);

    const handlePressToday = useCallback(() => {
        setState((s) => buildTodayState(s.mode));
    }, []);

    const handleSelectMonthDate = useCallback(
        (d) => {
            setState((s) => ({ ...s, selectedDate: d }));
            const dateStr = d.format("YYYY-MM-DD");

            requestAnimationFrame(() => {
                navigation.navigate("Main", {
                    screen: "Todo",
                    params: {
                        screen: "Home",
                        params: { initialDate: dateStr },
                    },
                });
            });
        },
        [navigation]
    );

    useFocusEffect(
        useCallback(() => {
            const startDate = currentDate.startOf("month").format("YYYY-MM-DD");
            const monthEnd = currentDate.endOf("month");
            const today = dayjs();
            const endDate = (monthEnd.isAfter(today, "day") ? today : monthEnd).format("YYYY-MM-DD");

            let alive = true;

            (async () => {
                try {
                    const map = await getDailyResultsMap(startDate, endDate);
                    if (alive) setBowlMap(map);
                } catch (e) {
                    console.log(
                        "[dailyResults] ERR",
                        e?.response?.status,
                        JSON.stringify(e?.response?.data, null, 2),
                        e?.message
                    );
                }
            })();

            return () => {
                alive = false;
            };
        }, [currentDate])
    );

    if (!ready) {
        return <SafeAreaView className="flex-1 bg-wt" edges={["top"]} />;
    }

    return (
        <SafeAreaView className="flex-1 bg-wt" edges={["top"]}>
            <CalendarHeader
                date={currentDate}
                mode={mode}
                onPressButton={toggleMode}
                onPressToday={handlePressToday}
                navigation={navigation}
                onPressYearMonth={openYMModal}
            />

            <WeekdayHeader />

            <View className="flex-1">
                {mode === "week" ? (
                    <>
                        <View className="shrink-0">
                            <WeekSlider
                                currentDate={currentDate}
                                selectedDate={selectedDate}
                                onSelectDate={(d) => setState((s) => ({ ...s, selectedDate: d }))}
                                onChangeDate={(d) => setState((s) => ({ ...s, currentDate: d }))}
                                bowlMap={bowlMap}
                            />
                        </View>

                        <View className="mt-3 mx-5 shrink-0">
                            <Dotted style={{ width: "100%" }} height={1} />
                        </View>

                        <View style={{ flex: 1, paddingHorizontal: 20 }}>
                            <TodoBoardSection navigation={navigation} date={selectedDateStr} isViewingToday={isViewingToday} />
                        </View>
                    </>
                ) : (
                    <MonthView
                        currentDate={currentDate}
                        onChangeDate={(d) => setState((s) => ({ ...s, currentDate: d }))}
                        bowlMap={bowlMap}
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectMonthDate}
                    />
                )}
            </View>

            <YearMonthWheelModal
                visible={isYMModalOpen}
                initialYear={currentDate.year()}
                initialMonth={currentDate.month() + 1}
                onCancel={closeYMModal}
                onConfirm={handleConfirmYM}
            />
        </SafeAreaView>
    );
}
