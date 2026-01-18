import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    TextInput,
    TouchableOpacity,
    View,
    Pressable,
    Keyboard,
    Modal,
    useWindowDimensions,
    Platform,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

import MyPageHeader from "../../components/MypageHeader";
import AppText from "../../../../shared/components/AppText";
import EditIcon from "../../assets/svg/Edit.svg";
import MyPageMenu from "../../components/MypageMenu";
import CheckIcon from "../../assets/svg/Check.svg";
import ErrorIcon from "../../assets/svg/Error.svg";
import CloseIcon from "../../assets/svg/Close.svg";

import { checkNickname } from "../../../auth/api/nickname";
import { updateMyNickname } from "../../api/profileApi";
import { deleteMyAccount } from "../../api/accountApi";

const KEYS_TO_CLEAR = [
    "accessToken",
    "refreshToken",
    "nickname",
    "joinedMonth",
    "onboardingStep",
    "hasLoggedIn",
];

async function clearLocalAuth() {
    await Promise.allSettled(KEYS_TO_CLEAR.map((k) => AsyncStorage.removeItem(k)));
    await Promise.allSettled([
        SecureStore.deleteItemAsync("accessToken"),
        SecureStore.deleteItemAsync("refreshToken"),
        SecureStore.deleteItemAsync("nickname"),
    ]);
}

export default function EditProfile({ navigation, route }) {
    const { width, height } = useWindowDimensions();

    const [nickName, setNickName] = useState("");
    const [draftNickName, setDraftNickName] = useState("");
    const [email] = useState(" "); // 임시

    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null);
    const [modalType, setModalType] = useState(null);

    const [nicknameError, setNicknameError] = useState(null);
    const NICKNAME_MAX = 10;

    const safeNick = (typeof nickName === "string" ? nickName : "").trim();
    const safeDraft = typeof draftNickName === "string" ? draftNickName : "";


    const trimmed = safeDraft.trim();
    const isChanged = trimmed && trimmed !== safeNick;

    const isNeutral = !isChanged || trimmed.length < 2;
    const isError = !isNeutral && !!nicknameError;
    const isValid = !isNeutral && !nicknameError;

    const errorMessage = useMemo(() => {
        if (nicknameError === "duplicate") return "이미 사용중인 닉네임이에요";
        if (nicknameError === "tooLong" || nicknameError === "invalid")
            return "닉네임은 한/영문/숫자 10자까지 입력 가능해요";
        if (nicknameError === "network")
            return "잠시 후 다시 시도해주세요.";
        return "";
    }, [nicknameError]);

    const ALLOWED_NICKNAME_REGEX = /^[\uAC00-\uD7A3\u3131-\u318E\u1100-\u11FFa-zA-Z0-9]*$/;

    const sanitizeNickname = (text) =>
        (text ?? "").replace(/[^\uAC00-\uD7A3\u3131-\u318E\u1100-\u11FFa-zA-Z0-9]/g, "");


    const validateNicknameLocal = (raw) => {
        const v = (raw ?? "").trim();
        if (!v || v === safeNick || v.length < 2) return null;
        if (v.length > NICKNAME_MAX) return "tooLong";
        return null;
    };


    const containerWidth = Math.min(width - 40, 520);
    const errorWidth = Math.min(Math.max(180, containerWidth * 0.55), 280);
    const contentPaddingBottom = Math.max(24, Math.min(48, height * 0.04));

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                const [savedAsync, savedSecure] = await Promise.all([
                    AsyncStorage.getItem("nickname"),
                    SecureStore.getItemAsync("nickname"),
                ]);

                const saved = (savedAsync ?? savedSecure ?? "").trim();

                if (!alive) return;

                if (saved) {
                    setNickName(saved);
                    setDraftNickName(saved);
                }
            } catch (e) {
                console.log("[LOAD] error", e);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);



    const startEdit = () => {
        setDraftNickName(safeNick);
        setNicknameError(null);
        setIsEditing(true);

        requestAnimationFrame(() => {
            inputRef.current?.focus?.();
        });
    };


    const onChangeNickname = async (text) => {
        const raw = typeof text === "string" ? text : "";
        const next = sanitizeNickname(raw);

        setDraftNickName(next);
        if (raw !== next) setNicknameError("invalid");
        else if (nicknameError === "invalid") setNicknameError(null);

        const localErr = validateNicknameLocal(next);
        if (localErr) {
            setNicknameError(localErr);
            return;
        }

        const v = next.trim();
        if (!v || v === safeNick || v.length < 2) {
            setNicknameError(null);
            return;
        }

        try {
            const res = await checkNickname(v, { skipErrorToast: true });
            setNicknameError(res?.available === false ? "duplicate" : null);
        } catch {
            setNicknameError("network");
        }
    };

    const finishEdit = async () => {
        const sanitized = sanitizeNickname(draftNickName);
        const v = sanitized.trim();

        setDraftNickName(sanitized);

        if (!v || v === safeNick || v.length < 2) {
            setDraftNickName(safeNick);
            setNicknameError(null);
            setIsEditing(false);
            Keyboard.dismiss();
            return;
        }

        const localErr = validateNicknameLocal(v);
        if (localErr) {
            setNicknameError(localErr);
            setDraftNickName(safeNick);
            setIsEditing(false);
            Keyboard.dismiss();
            return;
        }

        try {
            const res = await checkNickname(v, { skipErrorToast: true });
            if (res?.available === false) {
                setNicknameError("duplicate");
                return;
            }
        } catch {
            setNicknameError("network");
            return;
        }

        try {
            await updateMyNickname(v, { skipErrorToast: true });
            await Promise.allSettled([
                SecureStore.setItemAsync("nickname", v),
                AsyncStorage.setItem("nickname", v),
            ]);

            setNickName(v);
            setDraftNickName(v);
            setNicknameError(null);
            setIsEditing(false);
            Keyboard.dismiss();
        } catch (e) {
            const status = e?.response?.status;
            if (status === 409) return setNicknameError("duplicate");
            setNicknameError("network");
        }
    };


    const onConfirmLogout = async () => {
        setModalType(null);
        await clearLocalAuth();

        const rootNav =
            navigation?.getParent?.()?.getParent?.() ?? navigation?.getParent?.();

        rootNav?.reset({
            index: 0,
            routes: [{ name: "Auth", params: { screen: "Login" } }],
        });
    };

    const onConfirmDelete = async () => {
        try {
            await deleteMyAccount();
        } catch {}

        setModalType(null);
        await clearLocalAuth();

        const rootNav = navigation?.getParent?.("root") ?? navigation?.getParent?.();
        const target = [{ name: "Auth", params: { screen: "Login" } }];

        if (rootNav?.reset) {
            rootNav.reset({ index: 0, routes: target });
            return;
        }
        navigation?.reset?.({ index: 0, routes: target });
    };

    return (
        <SafeAreaView className="bg-gr flex-1" edges={["top", "bottom"]}>
            <MyPageHeader showBackButton title="계정 설정" />

            <Pressable
                className="flex-1"
                onPress={() => {
                    if (isEditing) finishEdit();
                    else Keyboard.dismiss();
                }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
                >
                    <View className="gap-8">
                        <View className="px-5 gap-2">
                            <View className="flex-row justify-between items-start">
                                <AppText variant="M500" className="text-gr500">
                                    사용자 정보
                                </AppText>

                                <View style={{ width: errorWidth, alignItems: "flex-end" }}>
                                    {isEditing && isError ? (
                                        <AppText
                                            variant="S400"
                                            className="text-red-500"
                                            numberOfLines={2}
                                            ellipsizeMode="tail"
                                            style={{ textAlign: "right" }}
                                        >
                                            {errorMessage}
                                        </AppText>
                                    ) : null}
                                </View>
                            </View>

                            <View
                                className="bg-wt rounded-xl px-5 py-4 self-center"
                                style={{
                                    width: containerWidth,
                                    borderWidth: 1,
                                    borderColor: isEditing && isError ? "#F97316" : "transparent",
                                }}
                            >
                                {isEditing ? (
                                    <View className="flex-row justify-between items-center mb-3">
                                        <TextInput
                                            ref={inputRef}
                                            value={safeDraft}
                                            onChangeText={onChangeNickname}
                                            maxLength={12}
                                            autoFocus
                                            onBlur={finishEdit}
                                            returnKeyType="done"
                                            onSubmitEditing={finishEdit}
                                            className="text-[16px] text-bk flex-1"
                                            style={{
                                                minHeight: 22,
                                                paddingVertical: 0,
                                                paddingHorizontal: 0,
                                                textAlignVertical: "center",
                                                fontWeight: "500",
                                                ...(Platform.OS === "android"
                                                    ? { includeFontPadding: false }
                                                    : null),
                                            }}
                                        />

                                        {isError ? (
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                hitSlop={10}
                                                onPress={() => {
                                                    setDraftNickName(safeNick);
                                                    setNicknameError(null);
                                                    inputRef.current?.focus?.();
                                                }}
                                            >
                                                <ErrorIcon width={18} height={18} />
                                            </TouchableOpacity>
                                        ) : null}

                                        {isValid ? (
                                            <TouchableOpacity
                                                activeOpacity={0.5}
                                                onPress={finishEdit}
                                                style={{ marginLeft: 10 }}
                                            >
                                                <CheckIcon width={18} height={18} />
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>
                                ) : (
                                    <View className="flex-row justify-between items-center mb-3">
                                        <View className="flex-1 pr-2">
                                            <AppText
                                                variant="XL500"
                                                className="text-bk"
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                {nickName} 님
                                            </AppText>
                                        </View>

                                        <TouchableOpacity activeOpacity={0.5} onPress={startEdit}>
                                            <EditIcon width={20} height={20} />
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <View className="h-[1px] bg-gr100" />

                                <View className="gap-1 mt-3">
                                    <View className="flex-row gap-1 flex-wrap">
                                        <AppText variant="M400" className="text-bk50">
                                            가입 메일
                                        </AppText>
                                        <AppText
                                            variant="M400"
                                            className="text-bk75"
                                            style={{ flexShrink: 1 }}
                                        >
                                            {email}
                                        </AppText>
                                    </View>

                                    {/*<View className="flex-row gap-1">*/}
                                    {/*    <AppText variant="M400" className="text-bk50">*/}
                                    {/*        생년월일*/}
                                    {/*    </AppText>*/}
                                    {/*    <AppText variant="M400" className="text-bk75">*/}
                                    {/*        {formattedBirth}*/}
                                    {/*    </AppText>*/}
                                    {/*</View>*/}
                                </View>
                            </View>
                        </View>

                        <View className="px-5">
                            <View className="bg-wt rounded-xl px-5">
                                <MyPageMenu menuTitle="로그아웃" onPress={() => setModalType("logout")} />
                                <View className="h-[1px] bg-gr100" />
                                <MyPageMenu menuTitle="계정 삭제" onPress={() => setModalType("delete")} />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Pressable>

            <Modal
                transparent
                visible={modalType !== null}
                animationType="fade"
                onRequestClose={() => setModalType(null)}
            >
                <Pressable
                    className="flex-1 items-center justify-center bg-bk/50 px-5"
                    onPress={() => setModalType(null)}
                >
                    <Pressable
                        onPress={() => {}}
                        className="w-full bg-wt rounded-3xl overflow-hidden"
                        style={{ maxWidth: 420 }}
                    >
                        <View className="px-6 pt-7 pb-6">
                            <View className="flex-row items-center justify-between">
                                <View style={{ width: 20, height: 20 }} />
                                <AppText variant="H3" className="text-bk text-center">
                                    확인
                                </AppText>
                                <TouchableOpacity
                                    hitSlop={10}
                                    activeOpacity={0.7}
                                    onPress={() => setModalType(null)}
                                >
                                    <CloseIcon width={20} height={20} />
                                </TouchableOpacity>
                            </View>

                            <View className="h-px bg-gr100 mt-4" />

                            <AppText variant="L500" className="text-gr700 text-center mt-6">
                                {modalType === "logout"
                                    ? "FryDay에서 로그아웃하시겠어요?"
                                    : modalType === "delete"
                                        ? "모든 데이터가 삭제되며 복구할 수 없어요\n정말 계정을 삭제하시겠어요?"
                                        : ""}
                            </AppText>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (modalType === "logout") return onConfirmLogout();
                                    if (modalType === "delete") return onConfirmDelete();
                                }}
                                className="bg-bk rounded-2xl px-20 py-4 self-center mt-6"
                                style={{ maxWidth: Math.min(320, containerWidth) }}
                            >
                                <AppText variant="L500" className="text-wt">
                                    {modalType === "logout"
                                        ? "네, 로그아웃 할래요"
                                        : modalType === "delete"
                                            ? "네, 삭제할래요"
                                            : ""}
                                </AppText>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
