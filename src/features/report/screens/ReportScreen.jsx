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

function parseJoinedMonthToDate(input) {
    if (!input) return null;
    const s = String(input).trim();
    const m = /(\d{4})-(\d{1,2})/.exec(s);
    if (!m) return null;

    const y = Number(m[1]);
    const mo = Number(m[2]);
    if (!y || mo < 1 || mo > 12) return null;

    return dayjs().year(y).month(mo - 1).startOf("month");
}

export default function ReportScreen() {
    const nowMonth = useMemo(() => dayjs().startOf("month"), []);
    const prevMonth = useMemo(() => dayjs().subtract(1, "month").startOf("month"), []);

    const [currentDate, setCurrentDate] = useState(nowMonth);
    const [reportData, setReportData] = useState(null);

    const [nickname, setNickname] = useState("");
    const [joinedMonth, setJoinedMonth] = useState("");

    const [isYMModalOpen, setIsYMModalOpen] = useState(false);
    const openYMModal = useCallback(() => setIsYMModalOpen(true), []);
    const closeYMModal = useCallback(() => setIsYMModalOpen(false), []);

    const joinedMonthDate = useMemo(() => parseJoinedMonthToDate(joinedMonth), [joinedMonth]);

    // 정책: 회원가입월 ~ 이번달. 표시는 "이전달, 이번달" 중 가입월 이후만 허용
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

    const lastFetchKeyRef = useRef("");

    const refreshOnFocus = useCallback(async () => {
        const jmRaw = await AsyncStorage.getItem("joinedMonth");
        const jmDate = parseJoinedMonthToDate(jmRaw);

        const joinedAtStr = jmDate ? jmDate.format("YYYY-MM") : (jmRaw ? String(jmRaw) : "");
        setJoinedMonth(joinedAtStr);

        const nick = await SecureStore.getItemAsync("nickname");
        if (nick) setNickname(nick);

        const base = [prevMonth, nowMonth];
        const allowed = jmDate
            ? (base.filter((d) => !d.isBefore(jmDate, "month")).length
                ? base.filter((d) => !d.isBefore(jmDate, "month"))
                : [nowMonth])
            : base;

        const allowedKeys = new Set(allowed.map((d) => d.format("YYYY-MM")));

        let target = currentDate;
        if (!allowedKeys.has(target.format("YYYY-MM"))) target = allowed[allowed.length - 1];

        // const fetchKey = `${target.format("YYYY-MM")}`;
        // if (lastFetchKeyRef.current === fetchKey) return;
        // lastFetchKeyRef.current = fetchKey;

        setCurrentDate(target);

        try {
            const data = await getReport(target.year(), target.month() + 1);
            setReportData(data);
        } catch {
            setReportData(null);
        }
    }, [currentDate, nowMonth, prevMonth]);

    const lastSuccessKeyRef = useRef("");
    const reqSeqRef = useRef(0);

    useFocusEffect(
        useCallback(() => {
            let alive = true;
            const mySeq = ++reqSeqRef.current;

            (async () => {
                // 1) user meta 갱신
                const jmRaw = await AsyncStorage.getItem("joinedMonth");
                const jmDate = parseJoinedMonthToDate(jmRaw);
                const joinedAtStr = jmDate ? jmDate.format("YYYY-MM") : (jmRaw ? String(jmRaw) : "");
                if (alive) setJoinedMonth(joinedAtStr);

                const nick = await SecureStore.getItemAsync("nickname");
                if (alive && nick) setNickname(nick);

                const fetchKey = `${year}-${String(month).padStart(2, "0")}`;

                if (lastSuccessKeyRef.current === fetchKey) return;

                try {
                    console.log("[report] fetch start", {mySeq, fetchKey, year, month});

                    const data = await getReport(year, month);

                    if (!alive || reqSeqRef.current !== mySeq) return;

                    setReportData(data);

                    lastSuccessKeyRef.current = fetchKey;

                    const payload = data?.data ?? data?.result ?? data?.report ?? data;
                    const rawCategories =
                        payload?.categories ?? payload?.categoryList ?? payload?.categoryStats ?? [];
                    console.log("[report] fetch ok", {mySeq, fetchKey, categoriesLen: rawCategories?.length});
                } catch (e) {
                    if (!alive || reqSeqRef.current !== mySeq) return;

                    console.log(
                        "[report] fetch err",
                        {mySeq, fetchKey},
                        e?.response?.status,
                        JSON.stringify(e?.response?.data ?? null),
                        e?.message
                    );

                    setReportData(null);
                }
            })();

            return () => {
                alive = false;
            };
        }, [year, month])
    );


    // ✅ 기존 useEffect 방식 유지 (삭제 X)
    // useEffect(() => {
    //   const key = currentDate.format("YYYY-MM");
    //   if (!allowedMonthKeys.has(key)) return;
    //
    //   const fetchKey = `${key}`;
    //   if (lastFetchKeyRef.current === fetchKey) return;
    //   lastFetchKeyRef.current = fetchKey;
    //
    //   (async () => {
    //     try {
    //       const data = await getReport(year, month);
    //       setReportData(data);
    //     } catch {
    //       setReportData(null);
    //     }
    //   })();
    // }, [currentDate, allowedMonthKeys, year, month]);

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

            <ScrollView className="flex-1" contentContainerStyle={{paddingBottom: 32}} showsVerticalScrollIndicator={false}>
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
