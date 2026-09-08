import React, { useMemo, useState } from "react";
import {
  Platform,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";

import AppText from "../../../shared/components/AppText";
import PageHeader from "../../../shared/components/PageHeader";
import SpeechBubble from "../components/SpeechBubble";
import colors from "../../../shared/styles/colors";
import characterLottie from "../assets/lottie/character.json";

// 입력 정책 (나중에 조정 편하게 변수로)
const GROUP_NAME_MIN = 1;
const GROUP_NAME_MAX = 10;

export default function GroupCreateScreen() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  const [draft, setDraft] = useState("");
  const [nameError, setNameError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmed = (draft ?? "").trim();

  const isValidForButton =
    trimmed.length >= GROUP_NAME_MIN && trimmed.length <= GROUP_NAME_MAX;
  const isError = !!nameError;

  const errorMessage = useMemo(() => {
    if (nameError === "tooLong") return `그룹명은 ${GROUP_NAME_MAX}자 이하로 입력해주세요`;
    if (nameError === "duplicate") return "이미 사용 중인 그룹명이에요";
    if (nameError === "network") return "잠시 후 다시 시도해주세요";
    return "";
  }, [nameError]);

  const onChangeName = (text) => {
    const raw = text ?? "";
    // 앞뒤 공백은 유지 (조합 편의), 실제 검증은 trim 기준
    const limited = raw.slice(0, GROUP_NAME_MAX + 1); // +1 로 초과 감지
    setDraft(limited);

    if (nameError) setNameError(null);
    if ([...limited].length > GROUP_NAME_MAX) {
      setNameError("tooLong");
    }
  };

  const onSubmit = async () => {
    if (isSubmitting) return;
    if (!isValidForButton) return;

    try {
      setIsSubmitting(true);
      // TODO: 다음 단계 화면으로 이동 (예: 인원 설정 / 생성 API)
      // navigation.navigate("GroupCreateNext", { name: trimmed });
    } catch (e) {
      setNameError("network");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerWidth = Math.min(width - 40, 520);
  const errorWidth = Math.min(Math.max(180, containerWidth * 0.55), 280);
  const topPad = Math.max(18, height * 0.03);

  // 캐릭터 + 그림자가 함께 들어있는 로티. 캔버스 160x160 로 크롭됨.
  const LOTTIE_SIZE = 160;

  return (
    <SafeAreaView className="flex-1 bg-wt">
      <PageHeader title="그룹 만들기" showBackButton />

      <View className="flex-1 px-5" style={{ paddingTop: 4 }}>
        {/* 말풍선 + 캐릭터 + 그림자 */}
        <View style={{ alignItems: "center" }}>
          <SpeechBubble>
            <AppText
              variant="M500"
              className="text-gr900"
              style={{ textAlign: "center", lineHeight: 18 }}
            >
              이제 다 왔어요!
            </AppText>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 2,
              }}
            >
              <AppText
                variant="M600"
                style={{ color: colors.or, lineHeight: 18 }}
              >
                그룹의 이름
              </AppText>
              <AppText
                variant="M500"
                className="text-gr900"
                style={{ lineHeight: 18 }}
              >
                을 알려주세요.
              </AppText>
            </View>
          </SpeechBubble>

          {/* 캐릭터 + 그림자 로티 - 말풍선 아래 붙게 (내부 캔버스 여백 상쇄) */}
          <LottieView
            source={characterLottie}
            autoPlay
            loop
            resizeMode="contain"
            style={{ width: LOTTIE_SIZE, height: LOTTIE_SIZE, marginTop: -20 }}
          />
        </View>

        {/* 입력 섹션: 라벨 + 인풋. flex column + gap 8 (Spacing/Sm) - 로티 덩어리와 16px 간격 */}
        <View
          style={{
            width: containerWidth,
            alignSelf: "center",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 8,
            marginTop: 16,
          }}
        >
          {/* 라벨 + 에러 */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
            <AppText variant="M500" className="text-gr500">
              그룹 이름은...
            </AppText>

            <View style={{ width: errorWidth, alignItems: "flex-end" }}>
              {isError ? (
                <AppText
                  variant="M500"
                  className="text-red-500"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={{ textAlign: "right" }}
                >
                  {errorMessage}
                </AppText>
              ) : null}
            </View>
          </View>

          {/* 입력창 - 버튼과 동일 height 48 */}
          <View
            style={{
              width: "100%",
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
              value={draft}
              onChangeText={onChangeName}
              placeholder={`그룹 이름을 ${GROUP_NAME_MAX}자 이내로 입력해 주세요`}
              placeholderTextColor={colors.gr500}
              maxLength={GROUP_NAME_MAX + 1}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
              style={{
                fontFamily: "Pretendard-Medium", // L500
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
        </View>

        {/* 다음으로 버튼 (오렌지) - 인풋과 20px 간격, 335x48, padding 12/0, radius 16 */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSubmit}
          disabled={!isValidForButton || isSubmitting}
          style={{
            width: containerWidth,
            alignSelf: "center",
            marginTop: 20,
            height: 48,
            paddingVertical: 12,
            paddingHorizontal: 0,
            borderRadius: 16,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            backgroundColor: isValidForButton && !isSubmitting ? colors.or : colors.gr200,
          }}
        >
          <AppText
            variant="L600"
            className={
              isValidForButton && !isSubmitting ? "text-wt" : "text-gr300"
            }
          >
            다음으로
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
