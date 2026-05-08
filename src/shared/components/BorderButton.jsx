import { TouchableOpacity, View } from "react-native";
import AppText from "./AppText";
import colors from "../styles/colors";

export default function BorderButton({
                                       text,
                                       icon,
                                       iconPosition = "right",
                                       borderColor = colors.or,
                                       textColor = colors.or,
                                       backgroundColor = "transparent",
                                       textVariant = "M600",
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
        backgroundColor,
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignSelf: "flex-start",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {icon && iconPosition === "left" && (
          <View style={{ marginRight: 4 }}>{icon}</View>
        )}

        <AppText variant={textVariant} style={{ color: textColor }}>
          {text}
        </AppText>

        {icon && iconPosition === "right" && (
          <View style={{ marginLeft: 4 }}>{icon}</View>
        )}
      </View>
    </TouchableOpacity>
  );
}