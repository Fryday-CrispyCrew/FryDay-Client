// src/shared/components/wheels/YearMonthWheelModal.jsx
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import WheelColumn from "./WheelColumn";
import colors from "../../../../../shared/styles/colors";

const range = (from, to) =>
  Array.from({length: to - from + 1}, (_, i) => from + i);

export default function YearMonthWheelModal({
  visible,
  initialYear,
  initialMonth, // 1~12
  onCancel,
  onConfirm, // (year, month) => void

  yearFrom,
  yearTo,

  // ✅ 스샷 기준 기본값
  title = "연월 이동",
  moveText = "이동하기",
}) {
  const baseYear = new Date().getFullYear();

  const years = useMemo(() => {
    const from = yearFrom ?? baseYear - 50;
    const to = yearTo ?? baseYear + 50;
    return range(from, to);
  }, [baseYear, yearFrom, yearTo]);

  const months = useMemo(() => range(1, 12), []);

  const [yearIdx, setYearIdx] = useState(0);
  const [monthIdx, setMonthIdx] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setYearIdx(Math.max(0, years.indexOf(initialYear)));
    setMonthIdx(Math.max(0, months.indexOf(initialMonth)));
  }, [visible, initialYear, initialMonth, years, months]);

  const handleMove = useCallback(() => {
    const y = years[yearIdx] ?? initialYear;
    const m = months[monthIdx] ?? initialMonth;
    onConfirm?.(y, m);
  }, [years, months, yearIdx, monthIdx, initialYear, initialMonth, onConfirm]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* dim */}
      <Pressable style={styles.backdrop} onPress={onCancel} />

      {/* sheet */}
      <View style={styles.sheet}>
        {/* header: title + close */}
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onCancel}
            style={styles.closeBtn}
            hitSlop={10}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* wheels */}
        <View style={styles.wheelRow}>
          <WheelColumn
            data={years}
            selectedIndex={yearIdx}
            onChangeIndex={setYearIdx}
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
        {/* bottom CTA */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleMove}
            style={styles.moveBtn}
          >
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
  headerSide: {width: 34, height: 18}, // title center 정렬용 더미
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
