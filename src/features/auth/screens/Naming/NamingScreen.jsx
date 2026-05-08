import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  Platform,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";

import AppText from "../../../../shared/components/AppText";
import NamingArrow from "../../assets/svg/naming-arrow.svg";

import {
  STEP_KEY,
  ONBOARDING_STEP,
} from "../../../../shared/constants/onboardingStep";
import {deleteTokens} from "../../../../shared/lib/storage/tokenStorage";
import {useCheckNicknameQuery} from "../../queries/nickname/useCheckNicknameQuery";
import {useCreateMyNicknameMutation} from "../../queries/nickname/useCreateMyNicknameMutation";

const HAS_KOREAN_JAMO =
  /[\u3131-\u318E\u1100-\u11FF\uA960-\uA97F\uD7B0-\uD7FF]/;
const FINAL_ALLOWED_REGEX = /^[가-힣a-zA-Z0-9]+$/;
const NICKNAME_MAX = 10;

export default function NamingScreen({navigation, route}) {
  const {width, height} = useWindowDimensions();
  const isNewUser = route?.params?.isNewUser ?? true;

  const [draft, setDraft] = useState("");
  const trimmed = (draft ?? "").trim();

  const [nicknameError, setNicknameError] = useState(null);

  useEffect(() => {
    AsyncStorage.setItem(STEP_KEY, ONBOARDING_STEP.NEEDS_NICKNAME);
  }, []);

  const onChangeNickname = (text) => {
    const raw = text ?? "";
    const filtered = raw.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\sㆍ]/g,
      "");
    const limited = filtered.slice(0, NICKNAME_MAX);
    setDraft(limited);
    if (nicknameError) setNicknameError(null);
  };

  const isLengthValid = trimmed.length >= 2 && trimmed.length <= NICKNAME_MAX;

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

  const available = debouncedNickname
    ? (checkQuery?.data?.available ?? null)
    : null;
  const isDuplicate = available === false;

  const isNeutral = !trimmed || trimmed.length < 2;
  const isError =
    !isNeutral &&
    (!!nicknameError || isDuplicate || (!checking && isCheckError));

  const errorMessage = useMemo(() => {
    if (nicknameError === "duplicate" || isDuplicate)
      return "이미 사용중인 닉네임이에요";
    if (nicknameError === "tooLong" || nicknameError === "invalid")
      return "닉네임은 한/영문/숫자 10자까지 입력 가능해요";
    if (nicknameError === "network") return "잠시 후 다시 시도해주세요.";
    if (!checking && isCheckError) return "잠시 후 다시 시도해주세요.";
    return "";
  }, [nicknameError, isDuplicate, checking, isCheckError]);

  const isValidForButton =
    isLengthValid &&
    !nicknameError &&
    available === true &&
    !isDuplicate &&
    !isCheckError;

  const {mutateAsync: createMyNickname, isPending: isSubmitting} =
    useCreateMyNicknameMutation();

  const validateBeforeSave = (v) => {
    if (!v || v.length < 2) return "invalid";
    if (v.length > NICKNAME_MAX) return "tooLong";
    if (HAS_KOREAN_JAMO.test(v)) return "invalid";
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
      const avail = res?.data?.available ?? res?.data?.data?.available ?? null;

      if (avail === false) {
        setNicknameError("duplicate");
        return;
      }
      if (avail == null) {
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

  const goBackToConsent = useCallback(async () => {
    if (isNewUser) await deleteTokens();

    await AsyncStorage.setItem(STEP_KEY, ONBOARDING_STEP.NEEDS_AGREEMENT);

    const rootNav = navigation.getParent("root") ?? navigation.getParent();
    rootNav?.reset({index: 0, routes: [{name: "Consent"}]});
  }, [navigation, isNewUser]);

  const containerWidth = Math.min(width - 40, 520);
  const errorWidth = Math.min(Math.max(180, containerWidth * 0.55), 280);
  const topPad = Math.max(18, height * 0.03);

  const LOTTIE_H = 260;
  const lottieW = Math.min(width - 40, 520);

  return (
    <SafeAreaView className="flex-1 bg-wt">
      <View className="px-5 pt-4">
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={goBackToConsent}
          className="flex-row items-center gap-2 self-start"
        >
          <NamingArrow />
          <AppText variant="H3" className="text-bk">
            가입하기
          </AppText>
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-5" style={{paddingTop: topPad}}>
        <View
          className="items-center justify-center"
          style={{height: LOTTIE_H, width: lottieW, alignSelf: "center"}}
        >
          <LottieView
            source={require("../../assets/lottie/nickname.json")}
            autoPlay
            loop
            resizeMode="cover"
            style={{width: "100%", height: "100%"}}
          />
        </View>

        <View className="flex-row justify-between items-start">
          <AppText variant="M500" className="text-gr500">
            내 이름은...
          </AppText>

          <View style={{width: errorWidth, alignItems: "flex-end"}}>
            {isError ? (
              <AppText
                variant="S400"
                className="text-red-500"
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{textAlign: "right"}}
              >
                {errorMessage}
              </AppText>
            ) : null}
          </View>
        </View>

        <View
          className="bg-wt rounded-2xl px-4 py-4 mt-2"
          style={{
            width: containerWidth,
            alignSelf: "center",
            borderWidth: 1,
            borderColor: isError ? "#F97316" : "#E5E7EB",
          }}
        >
          <TextInput
            value={draft}
            onChangeText={onChangeNickname}
            placeholder="닉네임을 10자 이내로 입력해 주세요"
            placeholderTextColor="#BDBDBD"
            maxLength={NICKNAME_MAX + 1}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            className="text-[14px] text-bk"
            style={{
              minHeight: 22,
              paddingVertical: 0,
              paddingHorizontal: 0,
              textAlignVertical: "center",
              fontWeight: "500",
              ...(Platform.OS === "android"
                ? {includeFontPadding: false}
                : null),
            }}
          />
        </View>

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
            className={
              isValidForButton && !isSubmitting ? "text-wt" : "text-gr300"
            }
          >
            가입하기
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
