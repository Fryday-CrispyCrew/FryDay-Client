import React, { useMemo } from "react";
import {
  Share,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import LottieView from "lottie-react-native";

import AppText from "../../../shared/components/AppText";
import PageHeader from "../../../shared/components/PageHeader";
import SpeechBubble from "../components/SpeechBubble";
import { toast } from "../../../shared/components/toast/CenterToast";
import colors from "../../../shared/styles/colors";
import characterLottie from "../assets/lottie/character.json";

export default function GroupCreateCompleteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { width } = useWindowDimensions();

  const maxInviteCount = Math.max(0, (route.params?.maxMemberCount ?? 10) - 1);
  const groupCode = route?.params?.groupCode ?? "";

  const containerWidth = Math.min(width - 40, 520);
  const LOTTIE_SIZE = 160;

  const inviteText = useMemo(
    () => `우리 같이 할 일 같이 튀겨볼래?\n그룹 코드 : ${groupCode}`,
    [groupCode],
  );

  const handleCopyCode = async () => {
    if (!groupCode) return;
    try {
      // lazy require: 네이티브 모듈 아직 링크 안 됐을 때 앱 부팅 크래시 방지
      // eslint-disable-next-line global-require
      const Clipboard = require("expo-clipboard");
      await Clipboard.setStringAsync(inviteText);
      toast.show("초대 문구를 복사했어요", { position: "center" });
    } catch {
      toast.show("복사에 실패했어요. 다시 시도해주세요", { position: "center" });
    }
  };

  const handleShare = async () => {
    if (!groupCode) return;
    try {
      await Share.share({ message: inviteText });
    } catch {
      // 유저가 공유 다이얼로그 취소한 경우도 여기로 옴 - 무시
    }
  };

  const handleGoBackToList = () => {
    // GroupHome 으로 팝. Stack 상위에 있으면 popToTop, 아니면 goBack 반복
    navigation.popToTop?.();
  };

  return (
    <SafeAreaView className="flex-1 bg-wt" edges={["top", "bottom"]}>
      <PageHeader
        title="그룹 만들기"
        showBackButton
        onBackPress={handleGoBackToList}
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
              그룹이 생성됐어요!
            </AppText>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 2,
                flexWrap: "wrap",
              }}
            >
              <AppText
                variant="M500"
                className="text-gr900"
                style={{ lineHeight: 18 }}
              >
                초대 코드를 통해{" "}
              </AppText>
              <AppText
                variant="M600"
                style={{ color: colors.or, lineHeight: 18 }}
              >
                최대 {maxInviteCount}명의 친구를 초대
              </AppText>
              <AppText
                variant="M500"
                className="text-gr900"
                style={{ lineHeight: 18 }}
              >
                해 보세요.
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

        {/* 코드 섹션: 라벨 + 코드+복사 row. flex column + gap 8 */}
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
          <AppText variant="M500" className="text-gr500">
            그룹 코드는...
          </AppText>

          {/* 코드 표시 + 복사 버튼 */}
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: colors.gr,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.gr100,
            }}
          >
            <AppText variant="H1" style={{ color: colors.or }}>
              {groupCode}
            </AppText>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopyCode}
              style={{
                width: 100,
                height: 45,
                paddingVertical: 12,
                paddingHorizontal: 0,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.or,
                backgroundColor: colors.wt,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <AppText variant="L600" style={{ color: colors.or }}>
                복사하기
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* 공유하기 버튼 - 코드 섹션과 20px 간격, 이전 화면 버튼과 동일 사이즈 */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleShare}
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
            backgroundColor: colors.or,
          }}
        >
          <AppText variant="L600" className="text-wt">
            공유하기
          </AppText>
        </TouchableOpacity>

        {/* 그룹 목록으로 돌아가기 링크 - 버튼과 8px 간격 */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={handleGoBackToList}
          style={{
            alignSelf: "center",
            marginTop: 8,
            paddingVertical: 12,
            paddingHorizontal: 24,
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <AppText
            variant="M500"
            className="text-gr500"
            style={{ textDecorationLine: "underline" }}
          >
            그룹 목록으로 돌아가기
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
