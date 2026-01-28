import React, {useMemo, useState, useEffect, useCallback} from "react";
import {ScrollView} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
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

const ZERO_REPORT = {attendanceIcon: "POOR", categories: []};

export default function ReportScreen() {
    const [currentDate, setCurrentDate] = useState(dayjs().startOf("month"));
    const [reportData, setReportData] = useState(null);

    const [nickname, setNickname] = useState("");
    const [joinedMonth, setJoinedMonth] = useState(null);

    const lastMonth = useMemo(() => dayjs().subtract(1, "month").startOf("month"), []);

    useEffect(() => {
        let alive = true;

        (async () => {
            const jm = await AsyncStorage.getItem("joinedMonth");
            if (alive && jm) setJoinedMonth(jm);

            const nick = await SecureStore.getItemAsync("nickname");
            if (alive && nick) setNickname(nick);
        })();

        return () => {
            alive = false;
        };
    }, []);

    const joinedMonthDate = useMemo(
        () => (joinedMonth ? dayjs(joinedMonth, "YYYY-MM").startOf("month") : null),
        [joinedMonth]
    );

    const maxMonth = useMemo(() => {
        const lastMonth = dayjs().subtract(1, "month").startOf("month");
        if (!joinedMonthDate) return lastMonth;

        // 가입월이 지난달보다 "더 최근"이면(=이번달 가입) 가입월까지 허용
        return joinedMonthDate.isAfter(lastMonth, "month") ? joinedMonthDate : lastMonth;
    }, [joinedMonthDate]);



    useEffect(() => {
        if (!joinedMonthDate) return;
        if (currentDate.isAfter(maxMonth, "month")) setCurrentDate(maxMonth);
        if (currentDate.isBefore(joinedMonthDate, "month")) setCurrentDate(joinedMonthDate);
    }, [joinedMonthDate, maxMonth]);

    const year = useMemo(() => dayjs(currentDate).year(), [currentDate]);
    const month = useMemo(() => dayjs(currentDate).month() + 1, [currentDate]);
    const viewingYM = useMemo(() => dayjs(currentDate).format("YYYY-MM"), [currentDate]);

    const isJoinedMonthView = useMemo(() => {
        if (!joinedMonthDate) return false;
        return dayjs(currentDate).isSame(joinedMonthDate, "month");
    }, [currentDate, joinedMonthDate]);

    const handleChangeMonth = useCallback(
        (nextDate) => {
            const next = dayjs(nextDate).startOf("month");
            if (joinedMonthDate && next.isBefore(joinedMonthDate, "month")) return;
            if (next.isAfter(maxMonth, "month")) return;
            setCurrentDate(next);
        },
        [joinedMonthDate, maxMonth]
    );

    useEffect(() => {
        let alive = true;

        (async () => {
            if (!joinedMonthDate) return;

            if (isJoinedMonthView) {
                if (!alive) return;
                setReportData(ZERO_REPORT);
                return;
            }

            if (dayjs(currentDate).isAfter(maxMonth, "month")) {
                if (!alive) return;
                setReportData(null);
                return;
            }

            try {
                const data = await getReport(year, month);
                if (!alive) return;
                setReportData(data);
            } catch {
                if (!alive) return;
                setReportData(null);
            }
        })();

        return () => {
            alive = false;
        };
    }, [joinedMonthDate, isJoinedMonthView, currentDate, maxMonth, year, month]);

    const report = useMemo(() => {
        const payload = reportData?.data ?? reportData;
        if (!payload) return {caseType: "C", categories: []};

        const caseType = mapAttendanceIconToCaseType(payload.attendanceIcon);

        const categories = Array.isArray(payload.categories)
            ? payload.categories
                .filter(Boolean)
                .map((c) => {
                    const total = Number(c?.["totalTodos"] ?? 0);
                    const success = Number(c?.["completedTodos"] ?? 0);
                    const fail =
                        c?.["incompleteTodos"] != null
                            ? Number(c?.["incompleteTodos"])
                            : Math.max(0, total - success);

                    return {
                        name: c?.["categoryName"] ?? "카테고리",
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

    const yearFrom = joinedMonthDate ? joinedMonthDate.year() : currentDate.year();
    const yearTo = maxMonth.year();

    const handleConfirmYM = useCallback(
        (year, month) => {
            const next = dayjs().year(year).month(month - 1).startOf("month");

            if (joinedMonthDate && next.isBefore(joinedMonthDate, "month")) return;
            if (next.isAfter(maxMonth, "month")) return;

            setCurrentDate(next);
            setIsYMModalOpen(false);
        },
        [joinedMonthDate, maxMonth]
    );

    const isSelectableMonth = useCallback(
        (y, m) => {
            const target = dayjs().year(y).month(m - 1).startOf("month");
            if (joinedMonthDate && target.isBefore(joinedMonthDate, "month")) return false;
            if (target.isAfter(maxMonth, "month")) return false;
            return true;
        },
        [joinedMonthDate, maxMonth]
    );

    const isMoveDisabled = useCallback(
        (y, m) => !isSelectableMonth(y, m),
        [isSelectableMonth]
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
                yearFrom={joinedMonthDate ? joinedMonthDate.year() : currentDate.year()}
                yearTo={maxMonth.year()}
            />
        </SafeAreaView>
    );
}
