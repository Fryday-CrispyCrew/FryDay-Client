import React, { useMemo, useRef, useState } from "react";
import {
  InteractionManager,
  Keyboard,
  Platform,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, usePreventRemove } from "@react-navigation/native";
import LottieView from "lottie-react-native";

import AppText from "../../../shared/components/AppText";
import PageHeader from "../../../shared/components/PageHeader";
import SpeechBubble from "../components/SpeechBubble";
import ClearIcon from "../../../shared/assets/svg/Clear.svg";
import { useModalStore } from "../../../shared/stores/modal/modalStore";
import colors from "../../../shared/styles/colors";
import characterLottie from "../assets/lottie/character.json";

// 입력 정책
const GROUP_CODE_LENGTH = 6;

export default function GroupJoinScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const openModal = useModalStore((s) => s.open);

  const [draft, setDraft] = useState("");
  const [codeError, setCodeError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // usePreventRemove 는 첫 인자를 useEffect deps 로 씀 → state 로 관리해야 재등록됨
  const [skipQuitConfirm, setSkipQuitConfirm] = useState(false);

  const isValidForButton = draft.length === GROUP_CODE_LENGTH;
  const isError = !!codeError;

  const errorMessage = useMemo(() => {
    if (codeError === "notFound") return "존재하지 않는 그룹코드예요";
    if (codeError === "already") return "이미 참여한 그룹이에요";
    if (codeError === "full") return "그룹 멤버가 최대 인원을 도달했어요";
    if (codeError === "network") return "잠시 후 다시 시도해주세요";
    return "";
  }, [codeError]);

  const onChangeCode = (text) => {
    // 알파벳/숫자만, 자동 대문자 변환
    const filtered = (text ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const limited = filtered.slice(0, GROUP_CODE_LENGTH);
    setDraft(limited);
    if (codeError) setCodeError(null);
  };

  const onClear = () => {
    setDraft("");
    if (codeError) setCodeError(null);
  };

  const onSubmit = async () => {
    if (isSubmitting) return;
    if (!isValidForButton) return;

    try {
      setIsSubmitting(true);
      // 새 플로우: 그룹 코드 확인 → 공개 카테고리 선택 → 해당 그룹 디테일로
      // joinGroup API 는 CategorySelect 의 저장 시점에 { code, publicCategoryIds } 로 호출.
      // preventRemove 훅이 state 재등록될 때까지 다음 tick 에서 navigate.
      setSkipQuitConfirm(true);
      setTimeout(() => {
        navigation.replace("GroupCategorySelect", {
          mode: "join",
          groupCode: draft,
        });
      }, 0);
    } catch (e) {
      // 에러 코드에 따라 setCodeError("notFound" | "full" | "already" | "network")
      setCodeError("network");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 뒤로가기 확인 모달
  // 키보드 dismiss 후 애니메이션 끝날 때까지 대기 → 모달 오픈 (로티 찌부 방지)
  const openQuitConfirm = (proceedBack) => {
    Keyboard.dismiss();
    InteractionManager.runAfterInteractions(() => {
      openModal({
        title: "확인",
        description: "아직 그룹에 가입하지 못했어요!\n그룹 가입을 그만둘까요?",
        showClose: true,
        closeOnBackdrop: true,
        buttons: [
          {
            label: "아니요, 가입을 계속할래요",
            variant: "primary",
          },
          {
            label: "가입을 그만둘래요",
            variant: "outline",
            onPress: () => proceedBack(),
          },
        ],
      });
    });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // native-stack 호환 back 인터셉트 (usePreventRemove)
  usePreventRemove(!skipQuitConfirm, ({ data }) => {
    openQuitConfirm(() => {
      setSkipQuitConfirm(true);
      navigation.dispatch(data.action);
    });
  });

  const containerWidth = Math.min(width - 40, 520);
  const errorWidth = Math.min(Math.max(180, containerWidth * 0.55), 280);
  const LOTTIE_SIZE = 160;

  return (
    <SafeAreaView className="flex-1 bg-wt" edges={["top"]}>
      <PageHeader
        title="그룹 참여하기"
        showBackButton
        onBackPress={handleBackPress}
      />

      <View className="flex-1 px-5" style={{ paddingTop: 4 }}>
        {/* 말풍선 + 캐릭터 */}
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
                그룹 코드
              </AppText>
              <AppText
                variant="M500"
                className="text-gr900"
                style={{ lineHeight: 18 }}
              >
                를 입력해 주세요.
              </AppText>
            </View>
          </SpeechBubble>

          <View
            style={{
              width: LOTTIE_SIZE,
              height: LOTTIE_SIZE,
              marginTop: -20,
              overflow: "hidden",
            }}
          >
            <LottieView
              source={characterLottie}
              autoPlay
              loop
              resizeMode="contain"
              cacheComposition
              renderMode="HARDWARE"
              style={{ width: LOTTIE_SIZE, height: LOTTIE_SIZE }}
            />
          </View>
        </View>

        {/* 입력 섹션: 라벨 + 인풋. flex column + gap 8 */}
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <AppText variant="M500" className="text-gr500">
              그룹 코드는...
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
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TextInput
              value={draft}
              onChangeText={onChangeCode}
              placeholder={`그룹 코드 ${GROUP_CODE_LENGTH}자를 입력해 주세요`}
              placeholderTextColor={colors.gr500}
              maxLength={GROUP_CODE_LENGTH}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
              style={{
                flex: 1,
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

            {!!draft?.length && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClear}
                hitSlop={8}
                style={{ marginLeft: 8, padding: 2 }}
              >
                <ClearIcon width={16} height={16} color={colors.gr300} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 다음으로 버튼 */}
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
            backgroundColor:
              isValidForButton && !isSubmitting ? colors.or : colors.gr200,
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
