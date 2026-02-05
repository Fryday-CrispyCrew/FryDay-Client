import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Pressable, ScrollView, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useNavigation, useRoute} from "@react-navigation/native";

import NamingArrow from "../../assets/svg/naming-arrow.svg";
import AppText from "../../../../shared/components/AppText";
import {deleteTokens} from "../../../../shared/lib/storage/tokenStorage";

import CheckOn from "../../assets/svg/checkbox-on.svg";
import CheckOff from "../../assets/svg/checkbox-off.svg";

import {useCreateConsentMutation} from "../../queries/consent/useCreateConsentMutation"; // 경로만 프로젝트에 맞게

// 체크 버튼
function CheckIcon({checked}) {
    return checked ? <CheckOn width={24} height={24} /> : <CheckOff width={24} height={24} />;
}

// 버튼 + 라벨
function CheckRow({checked, onPress, label}) {
    return (
        <Pressable onPress={onPress} className="flex-row items-center">
            <CheckIcon checked={checked} />
            <AppText variant="XL500" className="ml-3 text-bk">
                {label}
            </AppText>
        </Pressable>
    );
}

// 동의 컴포넌트
function TermsBox({title, body}) {
    return (
        <View>
            <AppText variant="M500" className="text-gr500 mb-2">
                {title}
            </AppText>

            <View className="relative rounded-2xl bg-gr">
                <ScrollView
                    className="px-4 py-4"
                    style={{height: 120}}
                    showsVerticalScrollIndicator={false}
                >
                    <AppText variant="L400" className="text-bk">
                        {body}
                    </AppText>
                </ScrollView>
            </View>
        </View>
    );
}

export default function ConsentScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const isNewUser = route?.params?.isNewUser ?? false;

    const [agreeAll, setAgreeAll] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);

    const canNext = agreeTerms && agreePrivacy;

    const goBackToAuth = useCallback(async () => {
        if (isNewUser) await deleteTokens();

        const rootNav = navigation.getParent("root") ?? navigation.getParent();
        rootNav?.reset({index: 0, routes: [{name: "Auth"}]});
    }, [navigation, isNewUser]);

    const toggleAll = useCallback(() => {
        const next = !agreeAll;
        setAgreeAll(next);
        setAgreeTerms(next);
        setAgreePrivacy(next);
        setAgreeMarketing(next);
    }, [agreeAll]);

    useEffect(() => {
        const nextAll = agreeTerms && agreePrivacy && agreeMarketing;
        if (agreeAll !== nextAll) setAgreeAll(nextAll);
    }, [agreeTerms, agreePrivacy, agreeMarketing]);

    const termsText = useMemo(
        () =>
            "이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트",
        []
    );

    const privacyText = useMemo(
        () =>
            "개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 개인정보 수집 및 이용 정책 텍스트 ",
        []
    );

    const {mutateAsync: setConsent, isPending: isSubmitting} = useCreateConsentMutation();

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

            <View className="flex-1 px-5 gap-4" contentContainerStyle={{paddingBottom: 0}}>
                <View className="mt-6">
                    <AppText variant="H2" className="text-bk leading-8">
                        FryDay와 바삭한 하루를 시작하기 위해{"\n"}이용 약관 동의가 필요해요
                    </AppText>
                </View>

                <View className="mt-4">
                    <CheckRow checked={agreeAll} onPress={toggleAll} label="전체 동의" />
                </View>

                <View className="mt-4 gap-2">
                    <TermsBox title="이용 약관 (필수)" body={termsText} />
                    <CheckRow
                        checked={agreeTerms}
                        onPress={() => setAgreeTerms((v) => !v)}
                        label="이용 약관 동의"
                    />
                </View>

                <View className="mt-4 gap-2">
                    <TermsBox title="개인정보 수집 및 이용 정책 (필수)" body={privacyText} />
                    <CheckRow
                        checked={agreePrivacy}
                        onPress={() => setAgreePrivacy((v) => !v)}
                        label="개인정보 수집 및 이용 동의"
                    />
                </View>

                <View className="mt-4 gap-2">
                    <AppText variant="L400" className="text-gr500">
                        마케팅 정보 수신 동의 (선택)
                    </AppText>
                    <CheckRow
                        checked={agreeMarketing}
                        onPress={() => setAgreeMarketing((v) => !v)}
                        label="마케팅 정보 수신 동의"
                    />
                </View>

                <View className="mt-10">
                    <Pressable
                        disabled={!canNext || isSubmitting}
                        onPress={async () => {
                            await setConsent({
                                termsRequired: agreeTerms,
                                privacyRequired: agreePrivacy,
                                marketingOptional: agreeMarketing,
                            });

                            navigation.navigate("Naming", {
                                isNewUser,
                                consent: {agreeTerms, agreePrivacy, agreeMarketing},
                            });
                        }}
                        className={`h-14 rounded-2xl items-center justify-center ${
                            canNext && !isSubmitting ? "bg-bk" : "bg-gr200"
                        }`}
                    >
                        <AppText variant="L600" className={canNext && !isSubmitting ? "text-wt" : "text-gr300"}>
                            다음으로
                        </AppText>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}
