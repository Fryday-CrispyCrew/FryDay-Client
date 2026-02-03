import { TouchableOpacity, View } from "react-native";
import AppText from "../../../shared/components/AppText";
import Arrow from "../assets/svg/MenuArrow.svg";
import { useNavigation } from "@react-navigation/native";

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
                        <View className="w-4 h-4">
                            <Arrow width="100%" height="100%" />
                        </View>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
}
