import React, { useCallback, useState } from "react";
import { View, Modal, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppText from "../../../../shared/components/AppText";
import { STEP_KEY, ONBOARDING_STEP } from "../../../../shared/constants/onboardingStep";

export default function AgreementModal({ navigation }) {
    const [visible, setVisible] = useState(false);

    const syncStep = useCallback(async () => {
        const step = await AsyncStorage.getItem(STEP_KEY);

        if (step === "NEEDS_AGREEMENT") {
            setVisible(true);
            return;
        }

        if (step === "NEEDS_ONBOARDING") {
            navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
        }
    }, [navigation]);

    useFocusEffect(
        useCallback(() => {
            syncStep();
        }, [syncStep])
    );

    const goOnboarding = async () => {
        setVisible(false);
        await AsyncStorage.setItem(STEP_KEY, ONBOARDING_STEP.NEEDS_ONBOARDING);
        navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
    };

    return (
        <View className="flex-1">
            <Modal transparent visible={visible} animationType="fade">
                <View className="flex-1 items-center justify-center bg-bk/40 px-5">
                    <View className="w-full bg-wt rounded-3xl overflow-hidden" style={{ maxWidth: 420 }}>
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
                    </View>
                </View>
            </Modal>
        </View>
    );
}
