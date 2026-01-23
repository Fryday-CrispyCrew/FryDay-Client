import React, { useCallback } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppText from "../../../../shared/components/AppText";
import { STEP_KEY, ONBOARDING_STEP } from "../../../../shared/constants/onboardingStep";

export default function AgreementModal({ navigation }) {
    const goOnboarding = useCallback(async () => {
        await AsyncStorage.setItem(STEP_KEY, ONBOARDING_STEP.COMPLETED);
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    }, [navigation]);

    const close = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    return (
        <View style={{ flex: 1 }}>
            <Pressable
                onPress={close}
                style={{ flex: 1 }}
                className="bg-bk/40 px-5 items-center justify-center"
            >
                <Pressable
                    onPress={() => {}}
                    className="w-full bg-wt rounded-3xl overflow-hidden"
                    style={{ maxWidth: 420 }}
                >
                    <View className="px-6 pt-7 pb-6">
                        <AppText variant="H3" className="text-bk text-center">
                            마케팅 정보 수신 동의
                        </AppText>

                        <View className="h-px bg-gr100 mt-4" />

                        <AppText variant="M500" className="text-gr500 text-center mt-6">
                            프라이데이의 마케팅 알림을 받으시겠어요?
                        </AppText>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={goOnboarding}
                            className="bg-bk rounded-2xl py-4 items-center mt-6"
                        >
                            <AppText variant="L600" className="text-wt">
                                네, 받을래요
                            </AppText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={goOnboarding}
                            className="border border-bk rounded-2xl py-4 items-center mt-3"
                        >
                            <AppText variant="L600" className="text-bk">
                                아니요, 안 받을래요
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </View>
    );
}
