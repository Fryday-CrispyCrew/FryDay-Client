import React, {useMemo, useState, useEffect, useCallback} from "react";
import {ScrollView} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useFocusEffect} from "@react-navigation/native";
import dayjs from "dayjs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import ReportHeader from "../components/ReportHeader";
import ReportHeroCard from "../components/ReportHeroCard";
import ReportTotalSection from "../components/ReportTotalSection";
import ReportCategoryCard from "../components/ReportCategoryCard";

import {getReport} from "../api/reportApi";
import YearMonthWheelModal from "../../todo/components/RepeatSettingsSection/wheel/YearMonthWheelModal";

function mapAttendanceIconToCaseType(attendanceIcon) {
    if (attendanceIcon === "EXCELLENT") return "A";
    if (attendanceIcon === "GOOD") return "B";
    return "C";
}

export default function ReportScreen() {
    const nowMonth = useMemo(() => dayjs().startOf("month"), []);
    const prevMonth = useMemo(() => dayjs().subtract(1, "month").startOf("month"), []);

    const [currentDate, setCurrentDate] = useState(nowMonth);
    const [reportData, setReportData] = useState(null);

    const [nickname, setNickname] = useState("");
    const [joinedMonth, setJoinedMonth] = useState(null);

    const joinedMonthDate = useMemo(
        () => (joinedMonth ? dayjs(joinedMonth, "YYYY-MM").startOf("month") : null),
        [joinedMonth]
    );

    const allowedMonths = useMemo(() => {
        const base = [prevMonth, nowMonth];
        if (!joinedMonthDate) return base;

        const filtered = base.filter((d) => !d.isBefore(joinedMonthDate, "month"));
        return filtered.length ? filtered : [nowMonth];
    }, [joinedMonthDate, prevMonth, nowMonth]);

    const allowedMonthKeys = useMemo(
        () => new Set(allowedMonths.map((d) => d.format("YYYY-MM"))),
        [allowedMonths]
    );

    useEffect(() => {
        const key = dayjs(currentDate).format("YYYY-MM");
        if (!allowedMonthKeys.has(key)) setCurrentDate(allowedMonths[allowedMonths.length - 1]);
    }, [allowedMonthKeys, allowedMonths, currentDate]);

    const year = useMemo(() => dayjs(currentDate).year(), [currentDate]);
    const month = useMemo(() => dayjs(currentDate).month() + 1, [currentDate]);

    const refreshLocalUser = useCallback(async () => {
        const jm = await AsyncStorage.getItem("joinedMonth");
        if (jm) setJoinedMonth(jm);

        const nick = await SecureStore.getItemAsync("nickname");
        if (nick) setNickname(nick);
    }, []);

    const fetchReport = useCallback(async () => {
        const key = dayjs(currentDate).format("YYYY-MM");
        if (!allowedMonthKeys.has(key)) {
            setReportData(null);
            return;
        }

        try {
            const data = await getReport(year, month);
            setReportData(data);
        } catch {
            setReportData(null);
        }
    }, [allowedMonthKeys, currentDate, year, month]);

    useFocusEffect(
        useCallback(() => {
            let alive = true;

            (async () => {
                await refreshLocalUser();
                if (!alive) return;

                await fetchReport();
            })();

            return () => {
                alive = false;
            };
        }, [refreshLocalUser, fetchReport])
    );

    const handleChangeMonth = useCallback(
        (nextDate) => {
            const next = dayjs(nextDate).startOf("month");
            const key = next.format("YYYY-MM");
            if (!allowedMonthKeys.has(key)) return;
            setCurrentDate(next);
        },
        [allowedMonthKeys]
    );

    const report = useMemo(() => {
        const payload = reportData?.data ?? reportData;
        if (!payload) return {caseType: "C", categories: []};

        const caseType = mapAttendanceIconToCaseType(payload.attendanceIcon);

        const categories = Array.isArray(payload.categories)
            ? payload.categories
                .filter(Boolean)
                .map((c) => {
                    const total = Number(c?.totalTodos ?? 0);
                    const success = Number(c?.completedTodos ?? 0);
                    const fail =
                        c?.incompleteTodos != null ? Number(c.incompleteTodos) : Math.max(0, total - success);

                    return {
                        name: c?.categoryName ?? "카테고리",
                        total,
                        success,
                        fail,
                    };
                })
            : [];

        return {caseType, categories};
    }, [reportData]);

    const totals = useMemo(() => {
        return report.categories.reduce(
            (acc, cur) => {
                acc.total += cur.total;
                acc.completed += cur.success;
                acc.failed += cur.fail;
                return acc;
            },
            {total: 0, completed: 0, failed: 0}
        );
    }, [report.categories]);

    const [isYMModalOpen, setIsYMModalOpen] = useState(false);

    const openYMModal = useCallback(() => setIsYMModalOpen(true), []);
    const closeYMModal = useCallback(() => setIsYMModalOpen(false), []);

    const yearFrom = useMemo(() => {
        const min = allowedMonths[0];
        return min.year();
    }, [allowedMonths]);

    const yearTo = useMemo(() => {
        const max = allowedMonths[allowedMonths.length - 1];
        return max.year();
    }, [allowedMonths]);

    const handleConfirmYM = useCallback(
        (y, m) => {
            const next = dayjs().year(y).month(m - 1).startOf("month");
            const key = next.format("YYYY-MM");
            if (!allowedMonthKeys.has(key)) return;

            setCurrentDate(next);
            setIsYMModalOpen(false);
        },
        [allowedMonthKeys]
    );

    return (
        <SafeAreaView className="flex-1 bg-wt" edges={["top"]}>
            <ReportHeader
                currentDate={currentDate}
                onChangeMonth={handleChangeMonth}
                joinedAt={joinedMonth ?? ""}
                onPressYearMonth={openYMModal}
            />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{paddingBottom: 32}}
                showsVerticalScrollIndicator={false}
            >
                <ReportHeroCard caseType={report.caseType} nickname={nickname} />

                <ReportTotalSection
                    total={totals.total}
                    completed={totals.completed}
                    failed={totals.failed}
                />

                <ReportCategoryCard data={report.categories} />
            </ScrollView>

            <YearMonthWheelModal
                visible={isYMModalOpen}
                initialYear={currentDate.year()}
                initialMonth={currentDate.month() + 1}
                onCancel={closeYMModal}
                onConfirm={handleConfirmYM}
                yearFrom={yearFrom}
                yearTo={yearTo}
            />
        </SafeAreaView>
    );
}
