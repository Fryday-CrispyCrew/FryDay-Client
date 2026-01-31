import {SafeAreaView} from "react-native-safe-area-context";
import MyPageHeader from "../../components/MypageHeader";
import {View, Platform, Linking} from "react-native";
import ToggleMenu from "../../components/ToggleMenu";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useEffect, useState, useCallback, useRef} from "react";
import {useFocusEffect} from "@react-navigation/native";
import {useUpdateNotificationSettingsMutation} from "../../../../notifications/queries/useUpdateNotificationSettingsMutation";
import {useCreateMarketingConsentMutation} from "../../../auth/queries/marketing/useCreateMarketingConsentMutation";
import {MARKETING_CONSENT_KEY} from "../../../../shared/constants/onboardingStep";

export default function SystemAlarm() {
    const updateSettings = useUpdateNotificationSettingsMutation();
    const createMarketingConsent = useCreateMarketingConsentMutation();
    const hasSyncedOnLoadRef = useRef(false);

    const [pushEnabled, setPushEnabled] = useState(false);
    const [fryEnabled, setFryEnabled] = useState(true);
    const [marketingEnabled, setMarketingEnabled] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    const syncWithSystemPermission = useCallback(async () => {
        const {status} = await Notifications.getPermissionsAsync();
        const allowed = status === "granted";
        setPushEnabled(allowed);
        return allowed;
    }, []);

    useFocusEffect(
        useCallback(() => {
            syncWithSystemPermission();
        }, [syncWithSystemPermission])
    );

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [allowed, marketingVal] = await Promise.all([
                Notifications.getPermissionsAsync().then((r) => r.status === "granted"),
                AsyncStorage.getItem(MARKETING_CONSENT_KEY),
            ]);
            if (cancelled) return;
            setPushEnabled(allowed);
            setMarketingEnabled(marketingVal === "true");
            setInitialLoadDone(true);
        })();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!initialLoadDone || !pushEnabled || hasSyncedOnLoadRef.current) return;
        hasSyncedOnLoadRef.current = true;
        updateSettings.mutate({pushNotificationEnabled: true});
    }, [initialLoadDone, pushEnabled, updateSettings]);

    const openSystemSettings = useCallback(async () => {
        if (Platform.OS === "ios") {
            await Linking.openURL("app-settings:");
            return;
        }
        await Linking.openSettings();
    }, []);

    // 푸시 알람 = 기기 알람 허용 여부만. API 호출 없음.
    const handleTogglePush = useCallback(
        async (next) => {
            if (!next) {
                await openSystemSettings();
                return;
            }
            const allowed = await syncWithSystemPermission();
            if (!allowed) await openSystemSettings();
        },
        [openSystemSettings, syncWithSystemPermission]
    );

    // 튀김 알람 = pushNotificationEnabled (서버에 푸시 보낼지)
    const handleToggleFry = useCallback(
        (next) => {
            setFryEnabled(next);
            updateSettings.mutate({pushNotificationEnabled: next});
        },
        [updateSettings]
    );

    const handleToggleMarketing = useCallback(
        (next) => {
            setMarketingEnabled(next);
            AsyncStorage.setItem(MARKETING_CONSENT_KEY, next ? "true" : "false");
            createMarketingConsent.mutate({
                marketingOptional: next,
                skipErrorToast: true,
            });
        },
        [createMarketingConsent]
    );

    return (
        <SafeAreaView className="flex-1">
            <MyPageHeader showBackButton title="알림 설정" />
            <View className="px-5 gap-6">
                <ToggleMenu
                    title="푸시 알림"
                    content="프라이데이에서 보내는 푸시 알람을 받을 수 있어요"
                    value={pushEnabled}
                    onToggle={handleTogglePush}
                    allowPressWhenDisabled={true}
                />

                <ToggleMenu
                    title="튀김 알림"
                    content="내가 설정한 튀김 알림을 받을 수 있어요"
                    value={fryEnabled}
                    onToggle={handleToggleFry}
                    disabled={!pushEnabled}
                />

                <ToggleMenu
                    title="마케팅 정보 알림"
                    content="프라이데이의 새로운 소식 알람을 받을 수 있어요"
                    value={marketingEnabled}
                    onToggle={handleToggleMarketing}
                    disabled={!pushEnabled}
                />
            </View>
        </SafeAreaView>
    );
}
