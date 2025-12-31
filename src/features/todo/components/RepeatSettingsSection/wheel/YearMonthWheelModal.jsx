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

const range = (from, to) =>
  Array.from({length: to - from + 1}, (_, i) => from + i);

export default function YearMonthWheelModal({
  visible,
  initialYear,
  initialMonth, // 1~12
  onCancel,
  onConfirm, // (year, month) => void

  // 옵션: 연도 범위 커스터마이즈
  yearFrom,
  yearTo,
  title = "년 · 월 선택",
  confirmText = "확인",
  cancelText = "취소",
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

  const handleConfirm = useCallback(() => {
    const y = years[yearIdx] ?? initialYear;
    const m = months[monthIdx] ?? initialMonth;
    onConfirm?.(y, m);
  }, [years, months, yearIdx, monthIdx, initialYear, initialMonth, onConfirm]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.backdrop} onPress={onCancel} />

      <View style={styles.sheet}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.row}>
          <WheelColumn
            data={years}
            selectedIndex={yearIdx}
            onChangeIndex={setYearIdx}
            renderLabel={(y) => `${y}년`}
          />
          <WheelColumn
            data={months}
            selectedIndex={monthIdx}
            onChangeIndex={setMonthIdx}
            renderLabel={(m) => `${m}월`}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onCancel}
            style={[styles.btn, styles.btnGhost]}
          >
            <Text style={[styles.btnText, styles.btnTextGhost]}>
              {cancelText}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleConfirm}
            style={[styles.btn, styles.btnPrimary]}
          >
            <Text style={[styles.btnText, styles.btnTextPrimary]}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    left: 20,
    right: 20,
    top: "25%",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 12,
  },
  row: {flexDirection: "row", gap: 10},
  actions: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  btn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: {backgroundColor: "#F1F1F1"},
  btnPrimary: {backgroundColor: "#FF5722"},
  btnText: {fontSize: 13},
  btnTextGhost: {color: "#5D5E60", fontWeight: "600"},
  btnTextPrimary: {color: "#fff", fontWeight: "700"},
});
