import React from "react";
import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AppText from "./AppText";
import ChevronIcon from "./ChevronIcon";
import colors from "../styles/colors";

/**
 * 공용 페이지 헤더.
 * - showBackButton: 뒤로가기 chevron 노출 (기본 false, 탭 진입점)
 * - title: 헤더 타이틀 (H3)
 * - onBackPress: 커스텀 back 핸들러 (미지정 시 navigation.goBack())
 */
export default function PageHeader({
  title,
  showBackButton = false,
  onBackPress,
}) {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) onBackPress();
    else navigation.goBack();
  };

  return (
    <View className="px-5 py-4 flex-row items-center">
      {showBackButton ? (
        <TouchableOpacity
          onPress={handleBack}
          className="flex-row items-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronIcon
            direction="left"
            size={18}
            color={colors.bk}
            strokeWidth={2}
          />
          <AppText variant="H3" className="text-bk ml-2">
            {title}
          </AppText>
        </TouchableOpacity>
      ) : (
        <AppText variant="H3" className="text-bk">
          {title}
        </AppText>
      )}
    </View>
  );
}
