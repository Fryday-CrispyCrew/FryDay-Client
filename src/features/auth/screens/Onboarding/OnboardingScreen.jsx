import React, { useMemo, useState } from "react";
import {View, Image, TouchableOpacity, Pressable, useWindowDimensions } from "react-native";
import * as SecureStore from "expo-secure-store";
import AppText from "../../../../shared/components/AppText";
import SkipIcon from "../../assets/svg/skip-arrow.svg";
import {completeOnboarding} from "../../api/onboarding";
import { SafeAreaView } from "react-native-safe-area-context";
import {ONBOARDING_STEP, STEP_KEY} from "../../../../shared/constants/onboardingStep";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PAGES = [
    { id: "1", title: "할 일을 미루면 발등에 불이 떨어지죠.", desc: "FryDay에서는 그 불을 튀김기의 열기로 바꿉니다.", image: require("../../assets/png/onboarding-1.png") },
    { id: "2", title: "투두 튀김을 추가하고", desc: "24시간 안에 바삭하게 완료하세요.", image: require("../../assets/png/onboarding-2.png") },
    { id: "3", title: "각 투두 튀김마다", desc: "메모, 반복, 알림을 설정할 수 있어요.", image: require("../../assets/png/onboarding-3.png") },
    { id: "4", title: "원하는 모드로", desc: "투두 튀김들을 확인해 보세요.", image: require("../../assets/png/onboarding-4.png") },
    { id: "5", title: "한 달 동안의", desc: "투두 튀김 성취도를 확인하세요.", image: require("../../assets/png/onboarding-5.png") },
];

export default function OnboardingScreen({ navigation }) {
    const { width, height } = useWindowDimensions();

    const [idx, setIdx] = useState(0);
    const page = PAGES[idx];
    const isLast = idx === PAGES.length - 1;

    const bottomPadding = useMemo(() => Math.max(20, height * 0.035), [height]);
    const overlayHeight = useMemo(() => Math.max(96, height * 0.14), [height]);

    const onDone = async () => {
        try {
            await completeOnboarding();
        } catch (e) {
            console.log("[completeOnboarding] ERR", e?.status, e?.code, e?.message);
        }

        await Promise.allSettled([
            SecureStore.setItemAsync("hasOnboarded", "true"),
            AsyncStorage.setItem("hasOnboarded", "true"),
            AsyncStorage.setItem(STEP_KEY, ONBOARDING_STEP.NEEDS_MARKETING),
        ]);

        const rootNav = navigation.getParent("root") ?? navigation.getParent();
        rootNav?.reset({ index: 0, routes: [{ name: "Marketing" }] });
    };


    const onNext = () => {
        if (isLast) return;
        setIdx((prev) => Math.min(prev + 1, PAGES.length - 1));
    };

    return (
        <SafeAreaView className="flex-1 bg-wt">
            <View className="px-5 pt-4 items-end">
                    <TouchableOpacity
                        onPress={onDone}
                        activeOpacity={0.5}
                        disabled={isLast}
                        className="flex-row items-center gap-1"
                        style={{ opacity: isLast ? 0 : 1 }}
                    >
                        <AppText variant="H3" className="text-bk">
                            Skip
                        </AppText>
                        <SkipIcon />
                    </TouchableOpacity>
                </View>

            <Pressable className="flex-1" onPress={onNext}>
                {/* dots */}
                <View
                    className="flex-row justify-center items-center gap-2"
                    style={{ marginTop: Math.max(12, height * 0.015) }}
                >
                    {PAGES.map((_, i) => (
                        <View
                            key={i}
                            className={`${i === idx ? "w-2 h-2 bg-or" : "w-2 h-2 bg-gr200"} rounded-full`}
                        />
                    ))}
                </View>

                {/* text */}
                <View style={{ paddingTop: Math.max(18, height * 0.03), paddingHorizontal: Math.min(32, width * 0.08) }}>
                    <AppText variant="L500" className="text-gr900 text-center mb-2">
                        {page.title}
                    </AppText>
                    <AppText variant="L500" className="text-gr900 text-center">
                        {page.desc}
                    </AppText>
                </View>

                <View className="flex-1 justify-end items-center" style={{ paddingHorizontal: Math.min(32, width * 0.08), paddingBottom: 0 }}>
                    <Image source={page.image} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                </View>
            </Pressable>

            {isLast ? (
                <View
                    className="absolute left-0 right-0 bg-wt px-6"
                    style={{ bottom: 0, height: overlayHeight, justifyContent: "center", paddingBottom: bottomPadding }}
                >
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={onDone}
                        className="bg-bk rounded-2xl py-4 items-center self-center w-full"
                        style={{ maxWidth: 420 }}
                    >
                        <AppText variant="L600" className="text-wt">
                            시작하기
                        </AppText>
                    </TouchableOpacity>
                </View>
            ) : null}
        </SafeAreaView>
    );
}
