import React, {useMemo, useState, useEffect, useCallback, useRef} from "react";
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

function normalizeYM(input) {
    if (!input) return null;
    const s = String(input).trim();
    const m = /(\d{4})-(\d{1,2})/.exec(s);
    if (!m) return null;

    const y = Number(m[1]);
    const mo = Number(m[2]);
    if (!y || mo < 1 || mo > 12) return null;

    return `${y}-${String(mo).padStart(2, "0")}`;
}

export default function ReportScreen() {

    // const TEMP_DATA = [
    //     { name: '운동', success: 100, fail: 10, total: 110 },
    //     { name: '공부', success: 40, fail: 20, total: 60 },
    //     { name: '독서', success: 20, fail: 5, total: 25 },
    //     { name: '휴식', success: 0, fail: 30, total: 30 },
    // ];

    const nowMonth = useMemo(() => dayjs().startOf("month"), []);
    const prevMonth = useMemo(() => dayjs().subtract(1, "month").startOf("month"), []);

    const [currentDate, setCurrentDate] = useState(nowMonth);
    const [reportData, setReportData] = useState(null);

    const [nickname, setNickname] = useState("");
    const [joinedMonth, setJoinedMonth] = useState("");

    const [isYMModalOpen, setIsYMModalOpen] = useState(false);
    const openYMModal = useCallback(() => setIsYMModalOpen(true), []);
    const closeYMModal = useCallback(() => setIsYMModalOpen(false), []);

    const joinedYM = useMemo(() => normalizeYM(joinedMonth), [joinedMonth]);

    const allowedMonths = useMemo(() => {
        const startYM = joinedYM ?? nowMonth.format("YYYY-MM");
        const start = dayjs(startYM + "-01").startOf("month");
        const end = nowMonth.startOf("month");

        const out = [];
        let cur = start;

        while (cur.isSame(end, "month") || cur.isBefore(end, "month")) {
            out.push(cur);
            cur = cur.add(1, "month");
        }

        return out.length ? out : [nowMonth];
    }, [joinedYM, nowMonth]);


    const allowedMonthKeys = useMemo(
        () => new Set(allowedMonths.map((d) => d.format("YYYY-MM"))),
        [allowedMonths]
    );

    useEffect(() => {
        const key = currentDate.format("YYYY-MM");
        if (!allowedMonthKeys.has(key)) {
            setCurrentDate(allowedMonths[allowedMonths.length - 1]);
        }
    }, [allowedMonthKeys, allowedMonths, currentDate]);

    const year = useMemo(() => currentDate.year(), [currentDate]);
    const month = useMemo(() => currentDate.month() + 1, [currentDate]);

    const handleChangeMonth = useCallback(
        (nextDate) => {
            const next = dayjs(nextDate).startOf("month");
            if (!allowedMonthKeys.has(next.format("YYYY-MM"))) return;
            setCurrentDate(next);
        },
        [allowedMonthKeys]
    );

    const handleConfirmYM = useCallback(
        (y, m) => {
            const next = dayjs().year(y).month(m - 1).startOf("month");
            if (!allowedMonthKeys.has(next.format("YYYY-MM"))) return;
            setCurrentDate(next);
            setIsYMModalOpen(false);
        },
        [allowedMonthKeys]
    );

    const availableYMs = useMemo(
        () => allowedMonths.map((d) => ({year: d.year(), month: d.month() + 1})),
        [allowedMonths]
    );

    const lastSuccessKeyRef = useRef("");
    const reqSeqRef = useRef(0);

    useFocusEffect(
        useCallback(() => {
            let alive = true;
            const mySeq = ++reqSeqRef.current;

            (async () => {
                const jmRaw = await AsyncStorage.getItem("joinedMonth");
                const joinedAtStr = normalizeYM(jmRaw) ?? (jmRaw ? String(jmRaw) : "");
                if (alive) setJoinedMonth(joinedAtStr);

                const nick = await SecureStore.getItemAsync("nickname");
                if (alive && nick) setNickname(nick);

                const fetchKey = `${year}-${String(month).padStart(2, "0")}`;
                // if (lastSuccessKeyRef.current === fetchKey) return;

                try {
                    const data = await getReport(year, month);
                    if (!alive || reqSeqRef.current !== mySeq) return;

                    setReportData(data);
                    lastSuccessKeyRef.current = fetchKey;
                } catch {
                    if (!alive || reqSeqRef.current !== mySeq) return;
                    setReportData(null);
                }
            })();

            return () => {
                alive = false;
            };
        }, [year, month])
    );

    const report = useMemo(() => {
        const payload =
            reportData?.data ??
            reportData?.result ??
            reportData?.report ??
            reportData;

        if (!payload) return {caseType: "C", categories: []};

        const caseType = mapAttendanceIconToCaseType(payload.attendanceIcon);

        const rawCategories =
            payload.categories ??
            payload.categoryList ??
            payload.categoryStats ??
            [];

        const categories = Array.isArray(rawCategories)
            ? rawCategories
                .filter(Boolean)
                .map((c) => {
                    const total = Number(c?.totalTodos ?? c?.total ?? 0);
                    const success = Number(c?.completedTodos ?? c?.completed ?? 0);
                    const fail =
                        c?.incompleteTodos != null
                            ? Number(c.incompleteTodos)
                            : c?.fail != null
                                ? Number(c.fail)
                                : Math.max(0, total - success);

                    return {
                        name: c?.categoryName ?? c?.name ?? "카테고리",
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
                contentContainerStyle={{paddingTop: 8, paddingBottom: 32}}
                showsVerticalScrollIndicator={false}
            >
                <ReportHeroCard caseType={report.caseType} nickname={nickname} />
                <ReportTotalSection total={totals.total} completed={totals.completed} failed={totals.failed} />
                <ReportCategoryCard data={report.categories} />
            </ScrollView>

            <YearMonthWheelModal
                visible={isYMModalOpen}
                initialYear={allowedMonths[allowedMonths.length - 1].year()}
                initialMonth={allowedMonths[allowedMonths.length - 1].month() + 1}
                onCancel={closeYMModal}
                onConfirm={handleConfirmYM}
                availableYMs={availableYMs}
            />
        </SafeAreaView>
    );
}
