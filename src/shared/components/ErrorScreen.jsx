import {View, Image, Pressable} from "react-native";

export default function ErrorScreen() {
    return (
        <View className="absolute inset-0 z-50 bg-wt justify-center items-center">
            <Pressable className="flex-1 items-center justify-center" onPress={onRetry}>
                <Image
                    source={require("../assets/png/error-icon.png")}
                    className="w-[180px] h-[180px]"
                    resizeMode="contain"
                />
            </Pressable>
        </View>
    );
}
