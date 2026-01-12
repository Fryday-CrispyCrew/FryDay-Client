// src/features/todo/screens/Category/components/CategoryItem.jsx
import React from "react";
import {View, StyleSheet, TouchableOpacity} from "react-native";
import AppText from "../../../../shared/components/AppText";
import DragHandleIcon from "../../assets/svg/DragHandle.svg";
import colors from "../../../../shared/styles/colors";

export default function CategoryItem({item, onLongPressDrag, isActive}) {
  return (
    <View style={[styles.row, isActive && styles.rowActive]}>
      {/* Drag Handle */}
      <TouchableOpacity
        onLongPress={onLongPressDrag}
        activeOpacity={0.6}
        hitSlop={10}
        style={styles.dragHandle}
      >
        <DragHandleIcon width={14} height={14} />
      </TouchableOpacity>

      {/* Category Name */}
      <AppText variant="L500" style={styles.label}>
        {item.label}
      </AppText>

      {/* Color Dot */}
      <View style={[styles.colorDot, {backgroundColor: item.color}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    // height: 44,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent", // ✅ 카드 제거
    // borderWidth: 1,
  },
  rowActive: {
    opacity: 0.6, // ✅ 드래그 중 살짝 톤 다운(스샷 느낌)
  },
  dragHandle: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    // borderWidth: 1,
  },
  label: {
    flex: 1,
    color: colors.bk,
    lineHeight: 14 * 1.5,
    // fontSize: 14,
    // lineHeight: 12 * 1.5,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
