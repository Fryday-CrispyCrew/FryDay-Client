import React, {useMemo} from "react";
import {View, StyleSheet, TouchableOpacity} from "react-native";
import AppText from "../../../../shared/components/AppText";
import ChevronIcon from "../../../../shared/components/ChevronIcon";
import PlusIcon from "../../assets/svg/Plus.svg";
import colors from "../../../../shared/styles/colors";

export default function CategoryHeader({
  variant = "list", // "list" | "create" | "edit"
  title, // ✅ 필요하면 직접 override 가능
  onPressBack,
  onPressPlus, // ✅ list에서만 사용
}) {
  const resolvedTitle = useMemo(() => {
    if (title) return title;
    if (variant === "create") return "카테고리 추가";
    if (variant === "edit") return "카테고리 편집";
    return "카테고리"; // list
  }, [title, variant]);

  const showPlus = variant === "list" && typeof onPressPlus === "function";

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPressBack}
          style={styles.headerLeft}
          hitSlop={10}
        >
          <ChevronIcon
            direction="left"
            size={18}
            color={colors.bk}
            strokeWidth={2}
          />
        </TouchableOpacity>

        <AppText variant="H3" style={styles.headerTitle}>
          {resolvedTitle}
        </AppText>
      </View>

      {/* ✅ list일 때만 + 버튼 노출 */}
      <View style={styles.rightSection}>
        {showPlus ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPressPlus}
            hitSlop={10}
            style={styles.plusBtn}
          >
            <PlusIcon width={18} height={18} color={colors.gr900} />
          </TouchableOpacity>
        ) : (
          // ✅ 우측 레이아웃 흔들림 방지용 자리 유지
          <View style={styles.rightPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLeft: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {},
  rightSection: {
    width: 32,
    height: 32,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  plusBtn: {
    width: 32,
    height: 32,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  rightPlaceholder: {
    width: 32,
    height: 32,
  },
});
