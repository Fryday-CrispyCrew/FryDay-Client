// src/features/todo/screens/Category/CategEditScreen.jsx
import React, {useMemo, useState} from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

import CategoryHeader from "../../components/Category/CategoryHeader"; // ✅ 경로는 프로젝트 구조에 맞게 조정
import AppText from "../../../../shared/components/AppText";
import ChevronIcon from "../../../../shared/components/ChevronIcon";
import ClearIcon from "../../../../shared/assets/svg/Clear.svg"; // ✅ 경로는 네 파일 위치에 맞게 수정
import colors from "../../../../shared/styles/colors";

const MAX_NAME_LEN = 8;

// mock: 기본 컬러(스샷은 오렌지)
const DEFAULT_COLOR = "#FF5B22";

const COLOR_OPTIONS = [
  colors.or, // orange
  colors.br, // brown
  colors.lg, // green
  colors.vl, // purple
  colors.dp, // pink
  colors.cb, // blue
  colors.mb2, // beige/brown
  colors.mb, // mint
  colors.pk, // light pink
];

export default function CategEditScreen({navigation}) {
  // ✅ create mode UI
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [isColorOpen, setIsColorOpen] = useState(false); // 드롭다운 UI 확장용 (지금은 닫힘 상태만)

  const helperText = useMemo(
    () => `카테고리 이름은 ${MAX_NAME_LEN}자까지 입력할 수 있어요`,
    []
  );

  const isSubmitEnabled =
    (name?.trim?.() ?? "").length > 0 && selectedColor != null;

  const onChangeName = (text) => {
    // ✅ 최대 글자수 제한
    const next = text.slice(0, MAX_NAME_LEN);
    setName(next);
  };

  const onPressSubmit = () => {
    if (!isSubmitEnabled) return;
    if (selectedColor == null) return;
    // TODO: create API 연결
    // createCategory({ name: name.trim(), color: selectedColor })
    navigation?.goBack?.();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.headerWrap}>
          <CategoryHeader
            variant="create"
            onPressBack={() => navigation?.goBack?.()}
            // ✅ create 화면은 + 버튼 없음
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* 이름 */}
          <AppText variant="L600" style={styles.sectionTitle}>
            이름
          </AppText>

          <View style={styles.inputBox}>
            <TextInput
              value={name}
              onChangeText={onChangeName}
              placeholder="카테고리 이름을 입력해 주세요"
              placeholderTextColor={colors?.gr400 ?? "#BDBDBD"}
              style={styles.input}
              returnKeyType="done"
              maxLength={MAX_NAME_LEN}
            />

            {!!name?.length && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setName("")}
                hitSlop={10}
                style={styles.clearButton}
              >
                <ClearIcon
                  width={18}
                  height={18}
                  color={colors?.gr300 ?? "#C4C4C3"}
                />
              </TouchableOpacity>
            )}
          </View>

          <AppText variant="S400" style={styles.helperText}>
            {helperText}
          </AppText>

          {/* 컬러 */}
          <View style={{height: 26}} />

          <View style={styles.colorRowHeader}>
            <AppText variant="L600" style={styles.sectionTitle}>
              컬러
            </AppText>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsColorOpen((prev) => !prev)}
              style={styles.colorRight}
              hitSlop={10}
            >
              <View
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: selectedColor ?? "transparent", // ✅ 선택 전 placeholder
                  },
                ]}
              />

              <View style={{width: 8}} />
              <ChevronIcon
                direction={isColorOpen ? "up" : "down"}
                size={18}
                color={colors?.gr500 ?? "#8A8989"}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          {/* ✅ 여기 아래에 컬러 팔레트(드롭다운) 넣으면 됨
              create 화면 스샷은 닫힌 상태라 현재는 렌더 안 함 */}
          {isColorOpen && (
            <View style={styles.paletteWrap}>
              {COLOR_OPTIONS.map((c) => {
                const isSelected = c === selectedColor;

                return (
                  <TouchableOpacity
                    key={c}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedColor(c);
                    }}
                    style={styles.paletteItemHit}
                  >
                    <View style={[styles.paletteDot, {backgroundColor: c}]}>
                      {isSelected && (
                        <View style={styles.checkOverlay}>
                          <AppText variant="L600" style={styles.checkText}>
                            ✓
                          </AppText>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomArea}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPressSubmit}
            disabled={!isSubmitEnabled}
            style={[
              styles.submitBtn,
              !isSubmitEnabled && styles.submitBtnDisabled,
            ]}
          >
            <AppText
              variant="L600"
              style={[
                styles.submitText,
                !isSubmitEnabled && styles.submitTextDisabled,
              ]}
            >
              추가하기
            </AppText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  safe: {
    flex: 1,
    backgroundColor: colors.gr,
  },

  headerWrap: {
    paddingHorizontal: 20,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 6,
  },

  sectionTitle: {
    color: colors?.bk ?? "#141312",
  },

  inputBox: {
    marginTop: 12,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.wt,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 0,
    margin: 0,
    fontFamily: "Pretendard-Medium",
    fontSize: 14,
    lineHeight: 14 * 1.5,
    color: colors?.bk ?? "#111111",
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    color: colors?.gr500 ?? "#8A8989",
    fontSize: 18,
    lineHeight: 18,
  },

  helperText: {
    marginTop: 8,
    // fontSize: 11,
    color: colors?.gr500 ?? "#8A8989",
  },

  colorRowHeader: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  colorRight: {
    flexDirection: "row",
    alignItems: "center",
    height: 32,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 100,
    overflow: "hidden",
  },

  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  submitBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.bk,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    backgroundColor: colors.gr200, // 스샷처럼 연한 회색
  },
  submitText: {
    color: colors.wt,
  },
  submitTextDisabled: {
    color: colors.gr300,
  },
  paletteWrap: {
    marginTop: 12,
    paddingVertical: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 48,
    // borderWidth: 1,
  },

  paletteItemHit: {
    width: "30%", // 3열 정렬용 (space-between과 조합)
    alignItems: "center",
  },

  paletteDot: {
    width: 36,
    height: 36,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  checkOverlay: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  checkText: {
    color: colors.wt,
    fontSize: 18,
    lineHeight: 18,
  },
});
