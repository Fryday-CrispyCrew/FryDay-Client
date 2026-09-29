import React, { useMemo, useState } from "react";
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
import { useModalStore } from "../../../shared/stores/modal/modalStore";
import { getGroupNameError, isValidGroupName, sanitizeGroupName } from "../lib/groupName";
import colors from "../../../shared/styles/colors";
import characterLottie from "../assets/lottie/character.json";

// 입력 정책 (나중에 조정 편하게 변수로)
const GROUP_NAME_MAX = 10;

export default function GroupCreateScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const openModal = useModalStore((s) => s.open);

  const [draft, setDraft] = useState("");
  const [nameError, setNameError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // submit 성공으로 navigate 하는 경우엔 beforeRemove 모달 인터셉트 스킵
  // (state 로 관리해야 usePreventRemove 가 재등록되어 실제로 스킵됨)
  const [skipQuitConfirm, setSkipQuitConfirm] = useState(false);

  // 뒤로가기 시 확인 모달 (아직 그룹 제작 미완료 상태)
  // 키보드 dismiss 후 애니메이션 끝날 때까지 대기 → 모달 오픈
  // (키보드 hide + 모달 open 이 겹치면 로티 리레이아웃 찌부됨)
  const openQuitConfirm = (proceedBack) => {
    Keyboard.dismiss();
    InteractionManager.runAfterInteractions(() => {
      openModal({
        title: "확인",
        description: "아직 그룹을 제작하지 못했어요!\n그룹 제작을 그만둘까요?",
        showClose: true,
        closeOnBackdrop: true,
        buttons: [
          {
            label: "아니요, 제작을 계속할래요",
            variant: "primary",
          },
          {
            label: "제작을 그만둘래요",
            variant: "outline",
            onPress: () => proceedBack(),
          },
        ],
      });
    });
  };

  // 헤더 back 버튼 → navigation.goBack() → usePreventRemove 가 모달로 인터셉트
  const handleBackPress = () => {
    navigation.goBack();
  };

  // native-stack 호환 back 인터셉트 (Android 하드웨어 back + 헤더 back)
  // submit 성공 시 skipQuitConfirm 을 true 로 세팅해서 훅 재등록 → 스킵
  usePreventRemove(!skipQuitConfirm, ({ data }) => {
    openQuitConfirm(() => {
      setSkipQuitConfirm(true);
      navigation.dispatch(data.action);
    });
  });

  const trimmed = (draft ?? "").trim();

  const isValidForButton = isValidGroupName(draft);
  const isError = !!nameError;

  const errorMessage = useMemo(() => {
    if (nameError === "tooLong") return `그룹명은 ${GROUP_NAME_MAX}자 이하로 입력해주세요`;
    if (nameError === "whitespace") return "그룹 이름에는 공백을 입력할 수 없어요";
    if (nameError === "invalid") return "그룹 이름에는 이모지를 사용할 수 없어요";
    if (nameError === "network") return "잠시 후 다시 시도해주세요";
    return "";
  }, [nameError]);

  const onChangeName = (text) => {
    const filtered = sanitizeGroupName(text ?? "");
    setDraft(filtered);
    setNameError(getGroupNameError(filtered));
  };

  const onSubmit = async () => {
    if (isSubmitting) return;
    if (!isValidForButton) return;

    try {
      setIsSubmitting(true);
      // 새 플로우: 그룹 이름 저장 → 공개 카테고리 선택 → 완료 페이지
      // 생성 후 선택한 공개 카테고리를 별도 API로 저장한다.
      // preventRemove 훅이 state 재등록될 때까지 다음 tick 에서 navigate.
      setSkipQuitConfirm(true);
      setTimeout(() => {
        navigation.replace("GroupCategorySelect", {
          mode: "create",
          groupName: trimmed,
        });
      }, 0);
    } catch (e) {
      setNameError("network");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerWidth = Math.min(width - 40, 520);

  // 캐릭터 + 그림자가 함께 들어있는 로티. 캔버스 160x160 로 크롭됨.
  const LOTTIE_SIZE = 160;

  return (
    <SafeAreaView className="flex-1 bg-wt">
      <PageHeader
        title="그룹 만들기"
        showBackButton
        onBackPress={handleBackPress}
      />

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
          {/* 라벨 */}
          <AppText variant="M500" className="text-gr500">
            그룹 이름은...
          </AppText>

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
              maxLength={11}
              placeholder={`그룹 이름을 ${GROUP_NAME_MAX}자 이내로 입력해 주세요`}
              placeholderTextColor={colors.gr500}
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

          {/* 에러 슬롯 - 항상 렌더해서 공간 예약 (에러 안뜰 땐 투명) */}
          <AppText
            variant="S400"
            className={isError ? "text-red-500" : ""}
            style={!isError ? { opacity: 0 } : undefined}
          >
            {errorMessage || " "}
          </AppText>
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
