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
                <AppText variant="M500" className="text-gr700">
                    {menuTitle}
                </AppText>

                <View className="flex-row items-center">
                    {rightText ? (
                        <AppText variant="M500" className="text-gr700">
                            {rightText}
                        </AppText>
                    ) : null}

                    {!hideArrow && !rightText ? (
                        <Arrow width={14} height={14} />
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
}
