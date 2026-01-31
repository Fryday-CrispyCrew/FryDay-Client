import {SafeAreaView} from "react-native-safe-area-context";
import MyPageHeader from "../../components/MypageHeader";
import {View, Platform, Linking} from "react-native";
import ToggleMenu from "../../components/ToggleMenu";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useEffect, useState, useCallback} from "react";
import {useFocusEffect} from "@react-navigation/native";
import {useUpdateNotificationSettingsMutation} from "../../../../notifications/queries/useUpdateNotificationSettingsMutation";
import {useCreateMarketingConsentMutation} from "../../../auth/queries/marketing/useCreateMarketingConsentMutation";
import {MARKETING_CONSENT_KEY} from "../../../../shared/constants/onboardingStep";

export default function SystemAlarm() {
    const updateSettings = useUpdateNotificationSettingsMutation();
    const createMarketingConsent = useCreateMarketingConsentMutation();

    const [systemAllowed, setSystemAllowed] = useState(false);

    const [pushEnabled, setPushEnabled] = useState(true);
    const [fryEnabled, setFryEnabled] = useState(true);
    const [marketingEnabled, setMarketingEnabled] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    const syncSystemPermission = useCallback(async () => {
        const {status} = await Notifications.getPermissionsAsync();
        const allowed = status === "granted";
        setSystemAllowed(allowed);
        return allowed;
    }, []);

    useFocusEffect(
        useCallback(() => {
            syncSystemPermission();
        }, [syncSystemPermission])
    );

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const [allowed, marketingVal] = await Promise.all([
                Notifications.getPermissionsAsync().then((r) => r.status === "granted"),
                AsyncStorage.getItem(MARKETING_CONSENT_KEY),
            ]);

            if (cancelled) return;

            setSystemAllowed(allowed);
            setMarketingEnabled(marketingVal === "true");
            setInitialLoadDone(true);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const openSystemSettings = useCallback(async () => {
        if (Platform.OS === "ios") {
            await Linking.openURL("app-settings:");
            return;
        }
        await Linking.openSettings();
    }, []);

    const handleTogglePush = useCallback(
        async (next) => {
            const allowed = await syncSystemPermission();

            if (next) {
                if (!allowed) {
                    await openSystemSettings();
                    return;
                }
                setPushEnabled(true);
                updateSettings.mutate({pushNotificationEnabled: true});
                return;
            }

            setPushEnabled(false);
            setFryEnabled(false);
            setMarketingEnabled(false);

            updateSettings.mutate({pushNotificationEnabled: false});
            AsyncStorage.setItem(MARKETING_CONSENT_KEY, "false");
            createMarketingConsent.mutate({marketingOptional: false, skipErrorToast: true});
        },
        [syncSystemPermission, openSystemSettings, updateSettings, createMarketingConsent]
    );

    const handleToggleFry = useCallback(
        (next) => {
            if (!pushEnabled) return;
            setFryEnabled(next);
            updateSettings.mutate({pushNotificationEnabled: next});
        },
        [pushEnabled, updateSettings]
    );

    const handleToggleMarketing = useCallback(
        (next) => {
            if (!pushEnabled) return;
            setMarketingEnabled(next);
            AsyncStorage.setItem(MARKETING_CONSENT_KEY, next ? "true" : "false");
            createMarketingConsent.mutate({marketingOptional: next, skipErrorToast: true});
        },
        [pushEnabled, createMarketingConsent]
    );

    useEffect(() => {
        if (!initialLoadDone) return;
        if (!pushEnabled) return;
        if (systemAllowed) return;
        setPushEnabled(false);
    }, [initialLoadDone, pushEnabled, systemAllowed]);

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
