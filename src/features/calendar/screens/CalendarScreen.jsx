import React, {useState, useEffect, useCallback} from "react";
import {View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import dayjs from "dayjs";
import {useFocusEffect} from "@react-navigation/native";

import CalendarHeader from "../components/CalendarHeader";
import WeekdayHeader from "../components/WeekdayHeader";
import MonthView from "./Month/MonthView";
import WeekSlider from "./Week/WeekSlider";
import Dotted from "../assets/svg/Dotted.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

import TodoBoardSection from "../../todo/components/TodoBoardSection";
import {getDailyResultsMap} from "../api/dailyResultsApi";

export default function CalendarScreen({navigation}) {
  const [mode, setMode] = useState("month"); // 'week' | 'month'
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const selectedDateStr = selectedDate.format("YYYY-MM-DD");
  const isViewingToday = selectedDate.isSame(dayjs(), "day");

  const [bowlMap, setBowlMap] = useState({});

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

  useFocusEffect(
      useCallback(() => {
        const startDate = currentDate.startOf("month").format("YYYY-MM-DD");

        const monthEnd = currentDate.endOf("month");
        const today = dayjs();
        const endDate = (monthEnd.isAfter(today, "day") ? today : monthEnd).format(
            "YYYY-MM-DD"
        );

        let alive = true;

        (async () => {
          try {
            const map = await getDailyResultsMap(startDate, endDate);
            console.log("[dailyResults] response:", JSON.stringify(map, null, 2));
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

  return (
      <SafeAreaView className="flex-1 bg-wt" edges={["top"]}>
        <CalendarHeader
            date={currentDate}
            mode={mode}
            onPressButton={toggleMode}
            onPressToday={handlePressToday}
            navigation={navigation}
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
                <View className="mt-3 mx-5 shrink-0">
                  <Dotted style={{width: "100%"}} height={1} />
                </View>

                <View style={{flex: 1, paddingHorizontal: 20}}>
                  <TodoBoardSection
                      navigation={navigation}
                      date={selectedDateStr}
                      isViewingToday={isViewingToday}
                  />
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
