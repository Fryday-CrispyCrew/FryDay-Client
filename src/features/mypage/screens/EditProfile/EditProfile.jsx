import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    TextInput,
    TouchableOpacity,
    View,
    Pressable,
    Keyboard,
    useWindowDimensions,
    Platform,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AppText from "../../../../shared/components/AppText";
import MyPageHeader from "../../components/MypageHeader";
import MyPageMenu from "../../components/MypageMenu";
import EditIcon from "../../assets/svg/Edit.svg";
import CheckIcon from "../../assets/svg/Check.svg";
import ErrorIcon from "../../assets/svg/Error.svg";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { useCheckNicknameQuery } from "../../../auth/queries/nickname/useCheckNicknameQuery";
import { updateMyNickname } from "../../api/profileApi";

import ConfirmModal from "../../components/ConfirmModal";
import { useAccountActions } from "../../hook/useAccountActions";

const HAS_KOREAN_JAMO = /[\u3131-\u318E\u1100-\u11FF\uA960-\uA97F\uD7B0-\uD7FF]/;
const FINAL_ALLOWED_REGEX = /^[가-힣a-zA-Z0-9]+$/;
const NICKNAME_MAX = 10;

export default function EditProfile({ navigation }) {
    const { width, height } = useWindowDimensions();
    const { logout, deleteAccount } = useAccountActions(navigation);

    const [nickName, setNickName] = useState("");
    const [draftNickName, setDraftNickName] = useState("");
    const [email] = useState("usermail@fry.com");

    const [isEditing, setIsEditing] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [nicknameError, setNicknameError] = useState(null);

    const inputRef = useRef(null);
    const safeNick = (nickName ?? "").trim();
    const safeDraft = draftNickName ?? "";
    const trimmed = safeDraft.trim();

    const isChanged = trimmed && trimmed !== safeNick;
    const isNeutral = !isChanged || trimmed.length < 2;
    const isError = !isNeutral && !!nicknameError;
    const isValid = !isNeutral && !nicknameError;

    const [debouncedCheck, setDebouncedCheck] = useState("");
    const checkQuery = useCheckNicknameQuery(debouncedCheck, { enabled: false });

    const containerWidth = Math.min(width - 40, 520);
    const errorWidth = Math.min(Math.max(180, containerWidth * 0.55), 280);
    const contentPaddingBottom = Math.max(24, Math.min(48, height * 0.04));

    const errorMessage = useMemo(() => {
        if (nicknameError === "duplicate") return "이미 사용중인 닉네임이에요";
        if (nicknameError === "tooLong" || nicknameError === "invalid")
            return "닉네임은 한/영문/숫자 10자까지 입력 가능해요";
        if (nicknameError === "network") return "잠시 후 다시 시도해주세요.";
        return "";
    }, [nicknameError]);

    useEffect(() => {
        let alive = true;
        (async () => {
            const [a, s] = await Promise.all([
                AsyncStorage.getItem("nickname"),
                SecureStore.getItemAsync("nickname"),
            ]);
            if (!alive) return;
            const saved = (a ?? s ?? "").trim();
            if (saved) {
                setNickName(saved);
                setDraftNickName(saved);
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
        requestAnimationFrame(() => inputRef.current?.focus?.());
    };

    const onChangeNickname = (text) => {
        const raw = text ?? "";
        setDraftNickName(raw);

        if (nicknameError && raw.trim().length <= NICKNAME_MAX) {
            setNicknameError(null);
        }
    };

    const finishEdit = async () => {
        const v = (draftNickName ?? "").trim();

        if (v.length > NICKNAME_MAX) {
            setNicknameError("tooLong");
            return;
        }

        if (HAS_KOREAN_JAMO.test(v)) return setNicknameError("invalid");
        if (!v || v === safeNick || v.length < 2) {
            setDraftNickName(safeNick);
            setNicknameError(null);
            setIsEditing(false);
            Keyboard.dismiss();
            return;
        }
        if (v.length > NICKNAME_MAX) return setNicknameError("tooLong");
        if (!FINAL_ALLOWED_REGEX.test(v)) return setNicknameError("invalid");

        try {
            setDebouncedCheck(v);
            const res = await checkQuery.refetch();
            const available = res?.data?.available ?? res?.data?.data?.available;
            if (available === false) return setNicknameError("duplicate");
            if (available == null) return setNicknameError("network");
        } catch {
            return setNicknameError("network");
        }

        try {
            await updateMyNickname(v, { skipErrorToast: true });
            await Promise.allSettled([
                AsyncStorage.setItem("nickname", v),
                SecureStore.setItemAsync("nickname", v),
            ]);
            setNickName(v);
            setDraftNickName(v);
            setNicknameError(null);
            setIsEditing(false);
            Keyboard.dismiss();
        } catch {
            setNicknameError("network");
        }
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
                                            maxLength={NICKNAME_MAX + 1}
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
                                                <ErrorIcon width={24} height={24} />
                                            </TouchableOpacity>
                                        ) : null}

                                        {isValid ? (
                                            <TouchableOpacity
                                                activeOpacity={0.5}
                                                onPress={finishEdit}
                                                style={{ marginLeft: 10 }}
                                            >
                                                <CheckIcon width={24} height={24} />
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
                                        <AppText variant="M400" className="text-bk75">
                                            {email}
                                        </AppText>
                                    </View>
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

            <ConfirmModal
                visible={modalType === "logout"}
                onClose={() => setModalType(null)}
                message="FryDay에서 로그아웃하시겠어요?"
                primaryText="네, 로그아웃 할래요"
                onPrimary={logout}
                containerWidth={containerWidth}
            />

            <ConfirmModal
                visible={modalType === "delete"}
                onClose={() => setModalType(null)}
                message={
                    "계정 삭제 시 모든 데이터가 삭제돼요.\n" +
                    "재가입은 7일 이후에 가능하며,\n" +
                    "재가입 시에도 삭제된 데이터는 복구되지 않아요!\n" +
                    "정말 계정을 삭제하시겠어요?"
                }
                secondaryText="아니요, 계속 튀길래요!"
                primaryText="네, 삭제할래요"
                onSecondary={() => setModalType(null)}
                onPrimary={deleteAccount}
                containerWidth={containerWidth}
            />
        </SafeAreaView>
    );
}
