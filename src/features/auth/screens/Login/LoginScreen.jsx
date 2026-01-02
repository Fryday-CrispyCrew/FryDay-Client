import React, { useMemo } from "react";
import { SafeAreaView, View, Image, TouchableOpacity, useWindowDimensions } from "react-native";
import AppText from "../../../../shared/components/AppText";

export default function LoginScreen({ navigation }) {
    const { width, height } = useWindowDimensions();

    const iconSize = useMemo(() => Math.max(48, Math.min(56, width * 0.14)), [width]);

    return (
        <SafeAreaView className="flex-1 bg-or">
            <Image
                source={require("../../assets/png/login-bg.png")}
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    alignSelf: "center",
                }}
                resizeMode="contain"
            />


            <View className="flex-1 px-5">
                <View
                    className="flex-[6] items-center justify-center"
                    style={{
                        transform: [{ translateY: height * 0.07 }],
                    }}
                >
                    <Image
                        source={require("../../assets/png/login-logo.png")}
                        style={{
                            width: "100%",
                            maxWidth: 420,
                            aspectRatio: 410 / 350,
                        }}
                        resizeMode="contain"
                    />
                </View>


                <View className="flex-[4] justify-start" style={{ paddingTop: Math.max(8, height * 0.02) }}>
                    <View className="flex-row items-center justify-center mb-6 self-center" style={{ width: Math.min(240, width * 0.62) }}>
                        <View className="flex-1 h-[1px] bg-wt/25" />
                        <AppText variant="M500" className="text-wt/75 mx-4">
                            간편하게 시작하기
                        </AppText>
                        <View className="flex-1 h-[1px] bg-wt/25" />
                    </View>

                    <View className="flex-row justify-center" style={{ columnGap: Math.min(32, width * 0.07), marginBottom: 18 }}>
                        {[
                            { label: "카카오", img: require("../../assets/png/login-kakao.png") },
                            { label: "네이버", img: require("../../assets/png/login-naver.png") },
                            { label: "Apple", img: require("../../assets/png/login-apple.png") },
                        ].map((it) => (
                            <View key={it.label} className="items-center">
                                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate("Onboarding")}>
                                    <Image source={it.img} style={{ width: iconSize, height: iconSize }} resizeMode="contain" />
                                </TouchableOpacity>
                                <AppText variant="M500" className="text-wt mt-2">
                                    {it.label}
                                </AppText>
                            </View>
                        ))}
                    </View>

                    <AppText variant="S400" className="text-wt/75 text-center mt-4"
                             style={{ paddingHorizontal: 8 }} >
                        가입 시 프라이데이의{" "}
                        <AppText
                            variant="S400"
                            style={{
                                textDecorationLine: "underline",
                                textDecorationColor: "rgba(250,250,250,0.75)",
                            }}
                        >
                            이용 약관
                        </AppText>
                        과{" "}
                        <AppText
                            variant="S400"
                            style={{
                                textDecorationLine: "underline",
                                textDecorationColor: "rgba(250,250,250,0.75)",
                            }}
                        >
                            개인정보 이용
                        </AppText>
                        에 동의하게 돼요
                    </AppText>


                </View>
            </View>
        </SafeAreaView>
    );
}
