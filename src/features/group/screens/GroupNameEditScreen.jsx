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
import CheckIcon from "../../../features/mypage/assets/svg/Check.svg";
import ErrorIcon from "../../../features/mypage/assets/svg/Error.svg";
import colors from "../../../shared/styles/colors";

// 정책
const GROUP_NAME_MAX = 10;
const INPUT_MAX = 11; // 한글 조합 잘림 방지 - 실제 검증은 GROUP_NAME_MAX 기준
const HAS_KOREAN_JAMO =
  /[ㄱ-ㆎᄀ-ᇿꥠ-꥿ힰ-퟿]/;
const FINAL_ALLOWED_REGEX = /^[가-힣a-zA-Z0-9]+$/;

/**
 * 그룹장 전용 - 그룹 이름 편집.
 *
 * 스펙:
 * - 라벨 "그룹 이름" M500 GR500
 * - 인풋: bg WT / border GR100 (default) → 에러면 orange
 *   글꼴 XL500 BK, Check/Error 아이콘 인라인
 * - 버튼: 키보드 위에 붙어서 함께 올라옴 (KeyboardAvoidingView)
 * - maxLength 11 (한글 조합 잘림 방지) + 10자 초과 시 에러
 * - 공백만 입력 케이스 에러 (S500)
 */
export default function GroupNameEditScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();

  const initialName = route?.params?.currentName ?? "";

  const [draft, setDraft] = useState(initialName);
  const [nameError, setNameError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const trimmed = (draft ?? "").trim();
  const isChanged = draft !== "" && draft !== initialName;
  const isLengthValid = trimmed.length >= 1 && trimmed.length <= GROUP_NAME_MAX;
  const isWhitespaceOnly = draft.length > 0 && trimmed.length === 0;

  const isNeutral = !isChanged;
  const isError = !!nameError;
  const isValid = !isNeutral && isLengthValid && !isWhitespaceOnly && !nameError;

  const errorMessage = useMemo(() => {
    if (nameError === "tooLong")
      return `그룹 이름은 한/영문/숫자 ${GROUP_NAME_MAX}자까지 입력 가능해요`;
    if (nameError === "invalid")
      return `그룹 이름은 한/영문/숫자 ${GROUP_NAME_MAX}자까지 입력 가능해요`;
    if (nameError === "whitespace") return "그룹 이름에는 공백만을 입력할 수 없어요";
    if (nameError === "duplicate") return "이미 사용 중인 그룹명이에요";
    if (nameError === "network") return "잠시 후 다시 시도해주세요";
    return "";
  }, [nameError]);

  // 공백만 에러는 별도 스타일 (S500), 나머지는 M500
  const isWhitespaceError = nameError === "whitespace";

  const onChangeName = (text) => {
    const raw = text ?? "";
    // 한글 완성형 + 자모 + 영문 + 숫자 + 공백 허용
    const filtered = raw.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\sㆍᆢ]/g, "");
    const limited = filtered.slice(0, INPUT_MAX);
    setDraft(limited);

    // 실시간 에러 판정
    const t = limited.trim();
    if (limited.length > GROUP_NAME_MAX) {
      setNameError("tooLong");
    } else if (limited.length > 0 && t.length === 0) {
      setNameError("whitespace");
    } else if (nameError && nameError !== "duplicate" && nameError !== "network") {
      setNameError(null);
    }
  };

  const onClearError = () => {
    setDraft(initialName);
    setNameError(null);
    inputRef.current?.focus?.();
  };

  const onSubmit = async () => {
    if (isSubmitting) return;
    if (!isValid) return;

    const v = trimmed;
    if (v.length > GROUP_NAME_MAX) return setNameError("tooLong");
    if (HAS_KOREAN_JAMO.test(v)) return setNameError("invalid");
    if (!FINAL_ALLOWED_REGEX.test(v)) return setNameError("invalid");

    try {
      setIsSubmitting(true);
      // TODO: 서버 API - updateGroupName
      // await updateGroupName({ groupId, name: v });
      Keyboard.dismiss();
      navigation.goBack();
    } catch (e) {
      setNameError("network");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerWidth = Math.min(width - 40, 520);
  const errorWidth = Math.min(Math.max(180, containerWidth * 0.55), 280);

  return (
    <SafeAreaView className="bg-gr flex-1" edges={["top", "bottom"]}>
      <PageHeader title="그룹 관리" showBackButton />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View className="flex-1 justify-between">
          {/* 상단: 라벨 + 인풋 */}
          <View className="px-5 mt-2 gap-2">
            {/* 라벨 + 에러 */}
            <View className="flex-row justify-between items-start">
              <AppText variant="M500" className="text-gr500">
                그룹 이름
              </AppText>
              <View style={{ width: errorWidth, alignItems: "flex-end" }}>
                {isError ? (
                  <AppText
                    variant="S500"
                    className="text-red-500"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{ textAlign: "right" }}
                  >
                    {errorMessage}
                  </AppText>
                ) : null}
              </View>
            </View>

            {/* 입력 카드 - bg WT / border GR100 (default) or orange (error), radius 16 */}
            <View
              className="bg-wt px-5 py-4 self-center"
              style={{
                width: containerWidth,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isError ? "#F97316" : colors.gr100,
              }}
            >
              <View className="flex-row justify-between items-center">
                <TextInput
                  ref={inputRef}
                  value={draft}
                  onChangeText={onChangeName}
                  placeholder={`그룹 이름을 ${GROUP_NAME_MAX}자 이내로 입력해 주세요`}
                  placeholderTextColor={colors.gr500}
                  maxLength={INPUT_MAX}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                  className="flex-1 font-pretendard-medium text-body-xl text-bk"
                  style={{
                    paddingVertical: 0,
                    paddingHorizontal: 0,
                    textAlignVertical: "center",
                    ...(Platform.OS === "android"
                      ? { includeFontPadding: false }
                      : null),
                  }}
                />

                {isError ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    hitSlop={10}
                    onPress={onClearError}
                  >
                    <ErrorIcon width={24} height={24} />
                  </TouchableOpacity>
                ) : null}

                {isValid ? (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={onSubmit}
                    style={{ marginLeft: 10 }}
                  >
                    <CheckIcon width={24} height={24} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
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
