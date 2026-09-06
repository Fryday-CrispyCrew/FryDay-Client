import React from "react";
import { View, Image } from "react-native";
import AppText from "../../../shared/components/AppText";
import BurnImage from "../../calendar/assets/png/Burn.png";

export default function GroupHomeEmptyList() {
  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Image
        source={BurnImage}
        style={{ width: 80, height: 80 }}
        resizeMode="contain"
      />

      <AppText variant="XL500" className="text-bk">
        아직 참여 중인 그룹이 없어요
      </AppText>

      <AppText
        variant="L400"
        className="text-gr500"
        style={{ textAlign: "center" }}
      >
        그룹을 만들거나 참여해서{"\n"}친구들과 함께 하루를 바삭하게 튀겨보세요
      </AppText>
    </View>
  );
}
