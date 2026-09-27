import React, { useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import AppText from "../../../shared/components/AppText";
import PageHeader from "../../../shared/components/PageHeader";
import { getGroupNameError, isValidGroupName } from "../lib/groupName";
import { groupApi } from "../api/groupApi";
import { useGroupMutation } from "../queries/groupQueries";
import colors from "../../../shared/styles/colors";

// 정책
const GROUP_NAME_MAX = 10;
/**
 * 그룹장 전용 - 그룹 이름 편집.
 *
 * 스펙:
 * - 라벨 "그룹 이름" M500 GR500
 * - 인풋: bg WT / border GR100 (default) → 에러면 orange
 *   글꼴 XL500 BK, Check/Error 아이콘 인라인
 * - 버튼: 키보드 위에 붙어서 함께 올라옴 (KeyboardAvoidingView)
 * - 공백 제외 10자 초과 및 이모지 입력 시 에러
 * - 공백만 입력 케이스 에러 (S500)
 */
export default function GroupNameEditScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();

  const updateName = useGroupMutation(groupApi.updateName);
  const initialName = route?.params?.currentName ?? "";

  const [draft, setDraft] = useState(initialName);
  const [nameError, setNameError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);
  const submittingRef = useRef(false);

  const trimmed = (draft ?? "").trim();
  const isChanged = draft !== "" && draft !== initialName;

  const isNeutral = !isChanged;
  const isError = !!nameError;
  const isValid = !isNeutral && isValidGroupName(draft);

  const errorMessage = useMemo(() => {
    if (nameError === "tooLong")
      return `그룹 이름은 공백 제외 ${GROUP_NAME_MAX}자까지 입력 가능해요`;
    if (nameError === "invalid")
      return "그룹 이름에는 이모지를 사용할 수 없어요";
    if (nameError === "whitespace") return "그룹 이름에는 공백만을 입력할 수 없어요";
    if (nameError === "network") return "잠시 후 다시 시도해주세요";
    return "";
  }, [nameError]);

  const onChangeName = (text) => {
    setDraft(text ?? "");
    setNameError(getGroupNameError(text ?? ""));
  };

  const onSubmit = async () => {
    if (submittingRef.current) return;
    if (!isValid) return;

    const v = trimmed;

    submittingRef.current = true;
    try {
      setIsSubmitting(true);
      await updateName.mutateAsync({ groupId: route.params.groupId, name: v });
      Keyboard.dismiss();
      navigation.goBack();
    } catch (e) {
      setNameError("network");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const containerWidth = Math.min(width - 40, 520);

  return (
    <SafeAreaView className="bg-gr flex-1" edges={["top", "bottom"]}>
      <PageHeader title="그룹 관리" showBackButton />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View className="flex-1 justify-between">
          {/* 상단 섹션: 라벨 / 인풋 / 에러 (column, gap 8) */}
          <View
            style={{
              paddingHorizontal: 20,
              marginTop: 8,
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            {/* 라벨 */}
            <AppText variant="M500" className="text-gr500">
              그룹 이름
            </AppText>

            {/* 입력창 - GroupCreate 와 동일 스타일 (height 48, radius 16, border GR100/orange) */}
            <View
              style={{
                width: containerWidth,
                height: 48,
                backgroundColor: colors.wt,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 0,
                borderWidth: 1,
                borderColor: isError ? "#F97316" : "#E5E7EB",
                justifyContent: "center",
              }}
            >
              <TextInput
                ref={inputRef}
                value={draft}
                onChangeText={onChangeName}
                placeholder={`그룹 이름을 ${GROUP_NAME_MAX}자 이내로 입력해 주세요`}
                placeholderTextColor={colors.gr500}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={onSubmit}
                style={{
                  fontFamily: "Pretendard-Medium",
                  fontSize: 14,
                  color: colors.bk,
                  paddingVertical: 0,
                  paddingHorizontal: 0,
                  ...(Platform.OS === "android"
                    ? { includeFontPadding: false }
                    : null),
                }}
              />
            </View>

            {/* 에러 슬롯 - 항상 렌더해서 공간 예약 (에러 안뜰 땐 투명) */}
            <AppText
              variant="S400"
              className={isError ? "text-red-500" : ""}
              style={!isError ? { opacity: 0 } : undefined}
            >
              {errorMessage || " "}
            </AppText>
          </View>

          {/* 하단: 수정하기 버튼 (키보드 위 or 화면 하단 safe area 위) */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 8, paddingTop: 8 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onSubmit}
              disabled={!isValid || isSubmitting}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isValid && !isSubmitting ? colors.or : colors.gr200,
              }}
            >
              <AppText
                variant="L600"
                className={isValid && !isSubmitting ? "text-wt" : "text-gr300"}
              >
                수정하기
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
