import { TouchableOpacity, View } from "react-native";
import AppText from "../../../shared/components/AppText";
import { useNavigation } from "@react-navigation/native";
import colors from "../../../shared/styles/colors";
import ChevronIcon from "../../../shared/components/ChevronIcon";
import React from "react";

export default function MyPageMenu({
                                       menuTitle,
                                       to,
                                       onPress,
                                       rightText,
                                       hideArrow = false,
                                   }) {
    const navigation = useNavigation();

    const handlePress = () => {
        if (onPress) return onPress();
        if (to) navigation.navigate(to);
    };

    const disabled = !to && !onPress;

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.5}
            disabled={disabled}
        >
            <View className="h-12 py-3 flex-row justify-between items-center">
                <AppText variant="L500" className="text-gr700">
                    {menuTitle}
                </AppText>

                <View className="flex-row items-center">
                    {rightText ? (
                        <AppText variant="L500" className="text-gr700">
                            {rightText}
                        </AppText>
                    ) : null}

                    {!hideArrow && !rightText ? (
                        <ChevronIcon
                            direction="right"
                            size={18}
                            color={colors.gr500}
                            strokeWidth={2}
                        />

                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
}
