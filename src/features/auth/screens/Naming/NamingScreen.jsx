import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    View,
    Image,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import AppText from "../../../../shared/components/AppText";
import {SafeAreaView} from "react-native-safe-area-context";

import Balloon from "../../assets/svg/naming-balloon.svg";
import NamingArrow from "../../assets/svg/naming-arrow.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {STEP_KEY, ONBOARDING_STEP} from "../../../../shared/constants/onboardingStep";
import {deleteTokens} from "../../../../shared/lib/storage/tokenStorage";

import {useCheckNicknameQuery} from "../../queries/nickname/useCheckNicknameQuery";
import {useCreateMyNicknameMutation} from "../../queries/nickname/useCreateMyNicknameMutation";

const HAS_KOREAN_JAMO = /[\u3131-\u318E\u1100-\u11FF\uA960-\uA97F\uD7B0-\uD7FF]/;
const FINAL_ALLOWED_REGEX = /^[가-힣a-zA-Z0-9]+$/;

export default function NamingScreen({navigation}) {
    const {width, height} = useWindowDimensions();

    const [name, setName] = useState("");
    const trimmed = name.trim();

    const NICKNAME_MAX = 10;
    const isTooLong = trimmed.length > NICKNAME_MAX;
    const isLengthValid = trimmed.length >= 2 && trimmed.length <= NICKNAME_MAX;

    // null | "duplicate" | "invalid" | "tooLong" | "network"
    const [nicknameError, setNicknameError] = useState(null);

    const onChangeName = (text) => {
        setName(typeof text === "string" ? text : "");
        if (nicknameError) setNicknameError(null);
    };

    const [debouncedNickname, setDebouncedNickname] = useState("");
    const debounceRef = useRef(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!trimmed || !isLengthValid) {
            setDebouncedNickname("");
            return;
        }

        debounceRef.current = setTimeout(() => {
            setDebouncedNickname(trimmed);
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [trimmed, isLengthValid]);

    const checkQuery = useCheckNicknameQuery(debouncedNickname, {
        enabled: !!debouncedNickname && isLengthValid,
    });

    const checking = !!checkQuery?.isFetching;
    const isCheckError = !!checkQuery?.isError;

    const available = debouncedNickname ? (checkQuery?.data?.available ?? null) : null;

    const isDuplicate = available === false;

    const isValidForButton = isLengthValid && available === true;

    const balloonText = (() => {
        if (!trimmed) return "이제 다 왔어요!\n마지막으로 당신의 이름을 알려주세요.";

        if (nicknameError === "duplicate") return "아앗...\n이미 존재하는 닉네임이에요!";
        if (nicknameError === "tooLong" || nicknameError === "invalid")
            return "아차차...\n닉네임은 한/영문/숫자 10자까지 가능해요!";
        if (nicknameError === "network") return "닉네임을 확인할 수 없어요.\n잠시 후 다시 시도해주세요.";
        if (isTooLong) return "아차차...\n닉네임은 10자까지 입력 가능해요!";
        if (isDuplicate) return "아앗...\n이미 존재하는 닉네임이에요!";

        if (isLengthValid && debouncedNickname && isCheckError && !checking)
            return "닉네임을 확인할 수 없어요.\n잠시 후 다시 시도해주세요.";

        if (available === true) return "좋아요!\n가입하기 버튼을 눌러주세요.";
        return "닉네임을 2~10자로 입력해주세요.";
    })();

    const {mutateAsync: createMyNickname, isPending: isSubmitting} =
        useCreateMyNicknameMutation();

    const validateBeforeSave = (v) => {
        if (HAS_KOREAN_JAMO.test(v)) return "invalid";
        if (!v || v.length < 2) return "invalid";
        if (v.length > NICKNAME_MAX) return "tooLong";
        if (!FINAL_ALLOWED_REGEX.test(v)) return "invalid";
        return null;
    };

    const onSubmit = async () => {
        if (isSubmitting) return;

        const v = (trimmed ?? "").trim();

        const localErr = validateBeforeSave(v);
        if (localErr) {
            setNicknameError(localErr);
            return;
        }

        try {
            const res = await checkQuery?.refetch?.();
            // refetch 결과 형태에 안전하게 대응
            const avail =
                res?.data?.available ??
                res?.data?.data?.available ??
                null;

            if (avail === false) {
                setNicknameError("duplicate");
                return;
            }
            if (avail === null) {
                setNicknameError("network");
                return;
            }
        } catch {
            setNicknameError("network");
            return;
        }

        try {
            await createMyNickname({nickname: v});

            await Promise.allSettled([
                SecureStore.setItemAsync("nickname", v),
                AsyncStorage.setItem("nickname", v),
            ]);

            const rootNav = navigation.getParent("root") ?? navigation.getParent();
            await AsyncStorage.setItem(STEP_KEY, ONBOARDING_STEP.NEEDS_ONBOARDING);
            rootNav?.reset({index: 0, routes: [{name: "Onboarding"}]});
        } catch (e) {
            if (e?.status === 409 && e?.code === "DUPLICATE_NICKNAME") {
                setNicknameError("duplicate");
                return;
            }
            if (e?.status === 400 && e?.code === "INVALID_NICKNAME_LENGTH") {
                setNicknameError("invalid");
                return;
            }
            setNicknameError("network");
        }
    };

    const [line1, line2] = balloonText.split("\n");

    const balloonW = Math.min(width - 40, 360);
    const balloonH = balloonW * (78 / 320);
    const iconSize = Math.min(120, Math.max(96, width * 0.28));

    const isNewUser = true;

    const goBackToAuth = useCallback(async () => {
        if (isNewUser) await deleteTokens();

        const rootNav = navigation.getParent("root") ?? navigation.getParent();
        rootNav?.reset({index: 0, routes: [{name: "Auth"}]});
    }, [navigation]);

    const balloonEmphasis =
        nicknameError === "duplicate" ||
        nicknameError === "invalid" ||
        nicknameError === "tooLong" ||
        isTooLong ||
        isDuplicate
            ? "error"
            : "default";

    return (
        <SafeAreaView className="flex-1 bg-wt">
            <View className="px-5 pt-4">
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={goBackToAuth}
                    className="flex-row items-center gap-2 self-start"
                >
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

                <View style={{ marginTop: Math.max(20, height * 0.04) }}>
                    <AppText variant="M500" className="text-gr500 mb-2">
                        내 이름은...
                    </AppText>

                    <TextInput
                        value={name}
                        onChangeText={onChangeName}
                        placeholder="닉네임을 10자 이내로 입력해 주세요"
                        placeholderTextColor="#BDBDBD"
                        maxLength={12}
                        className="bg-wt border border-gr200 rounded-2xl px-4 py-4 text-bk text-[14px]"
                    />

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={onSubmit}
                        disabled={!isValidForButton || isSubmitting}
                        className={`mt-5 rounded-2xl py-4 items-center ${
                            isValidForButton && !isSubmitting ? "bg-bk" : "bg-gr200"
                        }`}
                    >
                        <AppText
                            variant="L600"
                            className={`${isValidForButton && !isSubmitting ? "text-wt" : "text-gr300"}`}
                        >
                            가입하기
                        </AppText>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
