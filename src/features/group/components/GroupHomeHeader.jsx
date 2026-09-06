import { View } from "react-native";
import AppText from "../../../shared/components/AppText";
import React from "react";

export default function GroupHomeHeader({ title }) {
  return (
    <View className="h-20 px-5 py-4 flex-row items-center">
      <AppText variant="H3" className="text-bk ml-2">
        {title}
      </AppText>
    </View>
  )
}
