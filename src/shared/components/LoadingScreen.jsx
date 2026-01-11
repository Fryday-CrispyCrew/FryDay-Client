import { View, Image } from "react-native";

export default function LoadingScreen() {
    return (
        <View className="absolute inset-0 z-50 bg-wt justify-center items-center">
            <Image
                source={require("../assets/png/loading-icon.png")}
                className="w-[180px] h-[180px]"
                resizeMode="contain"
            />
        </View>
    );
}
