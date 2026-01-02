import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Image, TextInput, TouchableOpacity, useWindowDimensions } from "react-native";
import * as SecureStore from "expo-secure-store";
import AppText from "../../../../shared/components/AppText";

import Balloon from "../../assets/svg/naming-balloon.svg";
import NamingArrow from "../../assets/svg/naming-arrow.svg";

export default function NamingScreen({ navigation }) {
    const { width, height } = useWindowDimensions();

    const [name, setName] = useState("");
    const trimmed = name.trim();

    const duplicatedNames = useMemo(() => ["김닉네임", "admin", "test"], []);
    const isDuplicate = useMemo(() => duplicatedNames.includes(trimmed), [duplicatedNames, trimmed]);

    const isTooLong = trimmed.length > 10;
    const isLengthValid = trimmed.length >= 2 && trimmed.length <= 10;
    const isValid = isLengthValid && !isDuplicate;

    const balloonEmphasis = isTooLong || isDuplicate ? "error" : "default";

    const balloonText = useMemo(() => {
        if (!trimmed) return "이제 다 왔어요!\n마지막으로 당신의 이름을 알려주세요.";
        if (isTooLong) return "아차차...\n닉네임은 10자까지 입력 가능해요!";
        if (isDuplicate) return "아앗...\n이미 존재하는 닉네임이에요!";
        return "좋아요!\n가입하기 버튼을 눌러주세요.";
    }, [trimmed, isTooLong, isDuplicate]);

    const onSubmit = async () => {
        if (!isValid) return;
        await SecureStore.setItemAsync("nickname", trimmed);
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    };

    const [line1, line2] = balloonText.split("\n");

    const balloonW = Math.min(width - 40, 360);
    const balloonH = balloonW * (78 / 320);

    const iconSize = Math.min(120, Math.max(96, width * 0.28));

    return (
        <SafeAreaView className="flex-1 bg-wt">
            <View className="px-5 pt-4">
                <TouchableOpacity activeOpacity={0.5} className="flex-row items-center gap-2 self-start">
                    <NamingArrow />
                    <AppText variant="H3" className="text-bk">
                        가입하기
                    </AppText>
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-5">
                <View className="items-center" style={{ paddingTop: Math.max(16, height * 0.03) }}>
                    <View className="relative items-center justify-center">
                        <Balloon width={balloonW} height={balloonH} />
                        <View className="absolute px-4" style={{ paddingBottom: Math.max(6, balloonH * 0.12) }}>
                            {balloonEmphasis === "error" ? (
                                <>
                                    <AppText variant="M500" className="text-gr900 text-center">
                                        {line1}
                                    </AppText>
                                    <AppText variant="M600" className="text-or text-center mt-0.5">
                                        {line2}
                                    </AppText>
                                </>
                            ) : (
                                <>
                                    <AppText variant="M500" className="text-gr900 text-center">
                                        {line1}
                                    </AppText>
                                    {line2 ? (
                                        <AppText variant="M500" className="text-gr900 text-center mt-0.5">
                                            {line2}
                                        </AppText>
                                    ) : null}
                                </>
                            )}
                        </View>
                    </View>

                    <Image
                        source={require("../../assets/png/naming-icon.png")}
                        style={{ width: iconSize, height: iconSize, marginTop: Math.max(16, height * 0.02) }}
                        resizeMode="contain"
                    />
                </View>

                {/* 입력 영역 */}
                <View style={{ marginTop: Math.max(20, height * 0.04) }}>
                    <AppText variant="M500" className="text-gr500 mb-2">
                        내 이름은...
                    </AppText>

                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="닉네임을 10자 이내로 입력해 주세요"
                        placeholderTextColor="#BDBDBD"
                        maxLength={12}
                        className="bg-wt border border-gr200 rounded-2xl px-4 py-4 text-bk text-[14px]"
                    />

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onSubmit}
                        disabled={!isValid}
                        className={`mt-5 rounded-2xl py-4 items-center ${isValid ? "bg-bk" : "bg-gr200"}`}
                    >
                        <AppText variant="L600" className={`${isValid ? "text-wt" : "text-gr300"}`}>
                            가입하기
                        </AppText>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
