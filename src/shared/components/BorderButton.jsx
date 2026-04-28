import React from "react";
import { TouchableOpacity, View } from "react-native";
import AppText from "./AppText";
import colors from "../styles/colors";

export default function BorderButton({
                                       text,
                                       icon,
                                       borderColor = colors.or,
                                       textColor = colors.or,
                                       onPress,
                                     }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        borderRadius: 24,
        borderWidth: 1,
        borderColor,
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignSelf: "flex-start",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <AppText
          variant="M600"
          style={{
            color: textColor,
          }}
        >
          {text}
        </AppText>

        {icon && <View style={{ marginLeft: 4 }}>{icon}</View>}
      </View>
    </TouchableOpacity>
  );
}