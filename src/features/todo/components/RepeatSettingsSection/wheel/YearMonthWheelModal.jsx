// src/shared/components/wheels/YearMonthWheelModal.jsx
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Modal, Pressable, View, Text, TouchableOpacity, StyleSheet} from "react-native";
import WheelColumn from "./WheelColumn";
import colors from "../../../../../shared/styles/colors";

const range = (from, to) => Array.from({length: to - from + 1}, (_, i) => from + i);

function toYM(input) {
  if (!input) return null;
  if (typeof input === "string") {
    const m = /^(\d{4})-(\d{1,2})$/.exec(input);
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    if (!y || mo < 1 || mo > 12) return null;
    return {y, m: mo};
  }
  if (typeof input === "object" && input.year && input.month) {
    const y = Number(input.year);
    const mo = Number(input.month);
    if (!y || mo < 1 || mo > 12) return null;
    return {y, m: mo};
  }
  return null;
}

export default function YearMonthWheelModal({
                                              visible,
                                              initialYear,
                                              initialMonth,
                                              onCancel,
                                              onConfirm,

                                              yearFrom,
                                              yearTo,

                                              availableYMs,

                                              title = "연월 이동",
                                              moveText = "이동하기",
                                            }) {
  const baseYear = new Date().getFullYear();

  const available = useMemo(() => {
    if (!Array.isArray(availableYMs) || availableYMs.length === 0) return null;

    const map = new Map();
    for (const v of availableYMs) {
      const ym = toYM(v);
      if (!ym) continue;
      if (!map.has(ym.y)) map.set(ym.y, new Set());
      map.get(ym.y).add(ym.m);
    }

    const years = Array.from(map.keys()).sort((a, b) => a - b);
    const monthsByYear = new Map();
    years.forEach((y) => {
      const months = Array.from(map.get(y)).sort((a, b) => a - b);
      monthsByYear.set(y, months);
    });

    return {years, monthsByYear};
  }, [availableYMs]);

  const years = useMemo(() => {
    if (Array.isArray(availableYMs)) return available?.years ?? [];
    const from = yearFrom ?? baseYear - 50;
    const to = yearTo ?? baseYear + 50;
    const a = Math.min(from, to);
    const b = Math.max(from, to);
    return range(a, b);
  }, [available, baseYear, yearFrom, yearTo]);

  const [yearIdx, setYearIdx] = useState(0);
  const [monthIdx, setMonthIdx] = useState(0);

  const selectedYear = years[yearIdx] ?? initialYear;

  const months = useMemo(() => {
    if (available) return available.monthsByYear.get(selectedYear) ?? [];
    return range(1, 12);
  }, [available, selectedYear]);

  useEffect(() => {
    if (!visible) return;

    const yi = years.indexOf(initialYear);
    const nextYearIdx = yi >= 0 ? yi : 0;

    const nextYear = years[nextYearIdx] ?? initialYear;
    const list = available ? available.monthsByYear.get(nextYear) ?? [] : months;

    const mi = list.indexOf(initialMonth);
    const nextMonthIdx = mi >= 0 ? mi : 0;

    setYearIdx(nextYearIdx);
    setMonthIdx(nextMonthIdx);
  }, [visible, initialYear, initialMonth, years, available]);

  useEffect(() => {
    if (!visible) return;
    if (!months || months.length === 0) {
      setMonthIdx(0);
      return;
    }
    if (monthIdx > months.length - 1) setMonthIdx(0);
  }, [visible, months, monthIdx]);

  const handleMove = useCallback(() => {
    const y = years[yearIdx] ?? initialYear;
    const m = months[monthIdx] ?? initialMonth;
    onConfirm?.(y, m);
  }, [years, months, yearIdx, monthIdx, initialYear, initialMonth, onConfirm]);

  return (
      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.backdrop} onPress={onCancel} />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerSide} />
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={onCancel} style={styles.closeBtn} hitSlop={10}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.wheelRow}>
            <WheelColumn
                data={years}
                selectedIndex={yearIdx}
                onChangeIndex={(idx) => {
                  const nextYear = years[idx];
                  const nextMonths = available
                    ? available.monthsByYear.get(nextYear) ?? []
                    : range(1, 12);

                  const currentMonth = months[monthIdx];
                  const nextMonthIdx = nextMonths.indexOf(currentMonth);

                  setYearIdx(idx);
                  setMonthIdx(nextMonthIdx >= 0 ? nextMonthIdx : 0);
                }}
                renderLabel={(y) => `${y}년`}
                containerStyle={styles.wheelColBox}
                textStyle={styles.wheelText}
                activeTextStyle={styles.wheelTextActive}
            />
            <WheelColumn
                data={months}
                selectedIndex={monthIdx}
                onChangeIndex={setMonthIdx}
                renderLabel={(m) => `${m}월`}
                containerStyle={styles.wheelColBox}
                textStyle={styles.wheelText}
                activeTextStyle={styles.wheelTextActive}
            />
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity activeOpacity={0.9} onPress={handleMove} style={styles.moveBtn}>
              <Text style={styles.moveBtnText}>{moveText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  sheet: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "25%",
    borderRadius: 20,
    backgroundColor: colors.wt,
    // paddingHorizontal: 18,
    // paddingTop: 14,
    // paddingBottom: 18,
  },

  header: {
    // height: 34,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.gr100,
    // borderWidth: 1,
    // marginBottom: 12,
  },
  headerSide: {width: 34, height: 18},
  title: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    lineHeight: 16 * 1.5,
    // fontWeight: "700",
    color: colors.bk,
  },
  closeBtn: {
    width: 34,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 18,
    lineHeight: 18,
    color: colors.bk,
  },

  wheelRow: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    // borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },

  // WheelColumn에 주입되는 박스 스타일(스샷처럼 밝은 회색 + 둥글게)
  wheelColBox: {
    backgroundColor: colors.gr,
    borderRadius: 16,
  },

  wheelText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: colors.gr300,
    // fontWeight: "500",
  },
  wheelTextActive: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 14,
    lineHeight: 14 * 1.5,
    color: colors.or,
    // fontWeight: "700",
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  moveBtn: {
    // marginTop: 16,
    // width: 225,
    height: 45,
    borderRadius: 18,
    backgroundColor: colors.or,
    alignItems: "center",
    justifyContent: "center",
  },
  moveBtnText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    // fontWeight: "800",
    color: colors.wt,
  },
});
