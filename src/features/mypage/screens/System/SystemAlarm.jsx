import {SafeAreaView} from "react-native-safe-area-context";
import MyPageHeader from "../../components/MypageHeader";
import {View, Platform, Linking} from "react-native";
import ToggleMenu from "../../components/ToggleMenu";
import * as Notifications from "expo-notifications";
import {useEffect, useState, useCallback} from "react";
import {useFocusEffect} from "@react-navigation/native";
import {useUpdateNotificationSettingsMutation} from "../../../../notifications/queries/useUpdateNotificationSettingsMutation";
import {useNotificationSettingsQuery} from "../../queries/notification/useNotificationSettingsQuery";
import {useCreateMarketingConsentMutation} from "../../../auth/queries/marketing/useCreateMarketingConsentMutation";

export default function SystemAlarm() {
    const updateSettings = useUpdateNotificationSettingsMutation();
    const createMarketingConsent = useCreateMarketingConsentMutation();
    const {data, refetch} = useNotificationSettingsQuery();

    const [systemAllowed, setSystemAllowed] = useState(false);
    const [fryEnabled, setFryEnabled] = useState(false);
    const [marketingEnabled, setMarketingEnabled] = useState(false);

    const log = useCallback(
        (tag, extra = {}) => {
            const payload = {
                tag,
                systemAllowed,
                server: {
                    pushNotificationEnabled: data?.pushNotificationEnabled,
                    marketingAgreed: data?.marketingAgreed,
                },
                ui: {
                    pushValue: systemAllowed ? Boolean(data?.pushNotificationEnabled) : false,
                    fryValue: systemAllowed ? fryEnabled : false,
                    marketingValue: systemAllowed ? marketingEnabled : false,
                    canControlChildren: systemAllowed && Boolean(data?.pushNotificationEnabled),
                },
                extra,
            };
            console.log("[system-alarm]", JSON.stringify(payload, null, 2));
        },
        [systemAllowed, data, fryEnabled, marketingEnabled]
    );

    const syncSystemPermission = useCallback(async () => {
        const perm = await Notifications.getPermissionsAsync();
        const allowed = perm?.status === "granted";
        setSystemAllowed(allowed);
        console.log(
            "[system-alarm]",
            JSON.stringify({tag: "permission", status: perm?.status, allowed}, null, 2)
        );
        return allowed;
    }, []);

    const openSystemSettings = useCallback(async () => {
        console.log("[system-alarm]", JSON.stringify({tag: "openSystemSettings"}, null, 2));
        if (Platform.OS === "ios") return Linking.openURL("app-settings:");
        return Linking.openSettings();
    }, []);

    useFocusEffect(
        useCallback(() => {
            console.log("[system-alarm]", JSON.stringify({tag: "focus"}, null, 2));
            (async () => {
                await syncSystemPermission();
                const res = await refetch();
                console.log(
                    "[system-alarm]",
                    JSON.stringify({tag: "refetch-result", data: res?.data ?? null}, null, 2)
                );
            })();
        }, [refetch, syncSystemPermission])
    );

    useEffect(() => {
        if (!data) return;
        setFryEnabled(Boolean(data.pushNotificationEnabled));
        setMarketingEnabled(Boolean(data.marketingAgreed));
        console.log(
            "[system-alarm]",
            JSON.stringify(
                {
                    tag: "applyServerToState",
                    pushNotificationEnabled: data.pushNotificationEnabled,
                    marketingAgreed: data.marketingAgreed,
                },
                null,
                2
            )
        );
    }, [data]);

    const pushValue = systemAllowed ? Boolean(data?.pushNotificationEnabled) : false;
    const canControlChildren = systemAllowed && Boolean(data?.pushNotificationEnabled);
    const fryValue = systemAllowed ? fryEnabled : false;
    const marketingValue = systemAllowed ? marketingEnabled : false;

    const handleTogglePush = useCallback(
        async (next) => {
            log("toggle-push", {next});

            if (next) {
                const allowed = await syncSystemPermission();
                if (!allowed) {
                    log("toggle-push-blocked-no-permission", {next});
                    await openSystemSettings();
                    return;
                }

                updateSettings.mutate(
                    {pushNotificationEnabled: true},
                    {
                        onSuccess: async (res) => {
                            console.log(
                                "[system-alarm]",
                                JSON.stringify({tag: "updateSettings-success-push-on", res: res ?? null}, null, 2)
                            );
                            const r = await refetch();
                            console.log(
                                "[system-alarm]",
                                JSON.stringify({tag: "after-refetch-push-on", data: r?.data ?? null}, null, 2)
                            );
                            log("toggle-push-on-done");
                        },
                        onError: async (e) => {
                            console.log(
                                "[system-alarm]",
                                JSON.stringify(
                                    {
                                        tag: "updateSettings-error-push-on",
                                        message: e?.message,
                                        status: e?.response?.status,
                                        data: e?.response?.data,
                                    },
                                    null,
                                    2
                                )
                            );
                            const r = await refetch();
                            console.log(
                                "[system-alarm]",
                                JSON.stringify({tag: "after-refetch-push-on-error", data: r?.data ?? null}, null, 2)
                            );
                            log("toggle-push-on-error");
                        },
                    }
                );
                return;
            }

            setFryEnabled(false);
            setMarketingEnabled(false);

            updateSettings.mutate(
                {pushNotificationEnabled: false},
                {
                    onSuccess: async (res) => {
                        console.log(
                            "[system-alarm]",
                            JSON.stringify({tag: "updateSettings-success-push-off", res: res ?? null}, null, 2)
                        );
                        const r = await refetch();
                        console.log(
                            "[system-alarm]",
                            JSON.stringify({tag: "after-refetch-push-off", data: r?.data ?? null}, null, 2)
                        );
                        log("toggle-push-off-done");
                    },
                    onError: async (e) => {
                        console.log(
                            "[system-alarm]",
                            JSON.stringify(
                                {
                                    tag: "updateSettings-error-push-off",
                                    message: e?.message,
                                    status: e?.response?.status,
                                    data: e?.response?.data,
                                },
                                null,
                                2
                            )
                        );
                        const r = await refetch();
                        console.log(
                            "[system-alarm]",
                            JSON.stringify({tag: "after-refetch-push-off-error", data: r?.data ?? null}, null, 2)
                        );
                        log("toggle-push-off-error");
                    },
                }
            );

            createMarketingConsent.mutate(
                {marketingOptional: false, skipErrorToast: true},
                {
                    onSuccess: async (res) => {
                        console.log(
                            "[system-alarm]",
                            JSON.stringify({tag: "marketingConsent-success-push-off", res: res ?? null}, null, 2)
                        );
                        const r = await refetch();
                        console.log(
                            "[system-alarm]",
                            JSON.stringify({tag: "after-refetch-marketing-off", data: r?.data ?? null}, null, 2)
                        );
                        log("toggle-push-off-marketing-done");
                    },
                    onError: async (e) => {
                        console.log(
                            "[system-alarm]",
                            JSON.stringify(
                                {
                                    tag: "marketingConsent-error-push-off",
                                    message: e?.message,
                                    status: e?.response?.status,
                                    data: e?.response?.data,
                                },
                                null,
                                2
                            )
                        );
                        const r = await refetch();
                        console.log(
                            "[system-alarm]",
                            JSON.stringify({tag: "after-refetch-marketing-off-error", data: r?.data ?? null}, null, 2)
                        );
                        log("toggle-push-off-marketing-error");
                    },
                }
            );
        },
        [log, syncSystemPermission, openSystemSettings, updateSettings, createMarketingConsent, refetch]
    );

    const handleToggleFry = useCallback(
        (next) => {
            log("toggle-fry", {next});
            if (!canControlChildren) return;

            setFryEnabled(next);
            updateSettings.mutate(
                {pushNotificationEnabled: next},
                {
                    onSuccess: async (res) => {
                        console.log(
                            "[system-alarm]",
                            JSON.stringify({tag: "updateSettings-success-fry", res: res ?? null}, null, 2)
                        );
                        const r = await refetch();
                        console.log(
                            "[system-alarm]",
                            JSON.stringify({tag: "after-refetch-fry", data: r?.data ?? null}, null, 2)
                        );
                        log("toggle-fry-done", {next});
                    },
                    onError: async (e) => {
                        console.log(
                            "[system-alarm]",
                            JSON.stringify(
                                {
                                    tag: "updateSettings-error-fry",
                                    message: e?.message,
                                    status: e?.response?.status,
                                    data: e?.response?.data,
                                },
                                null,
                                2
                            )
                        );
                        const r = await refetch();
                        console.log(
                            "[system-alarm]",
                            JSON.stringify({tag: "after-refetch-fry-error", data: r?.data ?? null}, null, 2)
                        );
                        log("toggle-fry-error", {next});
                    },
                }
            );
        },
        [log, canControlChildren, updateSettings, refetch]
    );

    const handleToggleMarketing = useCallback(
        (next) => {
            log("toggle-marketing", {next});
            if (!canControlChildren) return;

            setMarketingEnabled(next);
            createMarketingConsent.mutate(
                {marketingOptional: next, skipErrorToast: true},
                {
                    onSuccess: async (res) => {
                        console.log(
                            "[system-alarm]",
                            JSON.stringify({tag: "marketingConsent-success", res: res ?? null}, null, 2)
                        );
                        const r = await refetch();
                        console.log(
                            "[system-alarm]",
                            JSON.stringify({tag: "after-refetch-marketing", data: r?.data ?? null}, null, 2)
                        );
                        log("toggle-marketing-done", {next});
                    },
                    onError: async (e) => {
                        console.log(
                            "[system-alarm]",
                            JSON.stringify(
                                {
                                    tag: "marketingConsent-error",
                                    message: e?.message,
                                    status: e?.response?.status,
                                    data: e?.response?.data,
                                },
                                null,
                                2
                            )
                        );
                        const r = await refetch();
                        console.log(
                            "[system-alarm]",
                            JSON.stringify({tag: "after-refetch-marketing-error", data: r?.data ?? null}, null, 2)
                        );
                        log("toggle-marketing-error", {next});
                    },
                }
            );
        },
        [log, canControlChildren, createMarketingConsent, refetch]
    );

    return (
        <SafeAreaView className="flex-1">
            <MyPageHeader showBackButton title="알림 설정" />
            <View className="px-5 gap-6">
                <ToggleMenu
                    title="푸시 알림"
                    content="프라이데이에서 보내는 푸시 알람을 받을 수 있어요"
                    value={pushValue}
                    onToggle={handleTogglePush}
                    allowPressWhenDisabled={true}
                />

                <ToggleMenu
                    title="튀김 알림"
                    content="내가 설정한 튀김 알림을 받을 수 있어요"
                    value={fryValue}
                    onToggle={handleToggleFry}
                    disabled={!canControlChildren}
                />

                <ToggleMenu
                    title="마케팅 정보 알림"
                    content="프라이데이의 새로운 소식 알람을 받을 수 있어요"
                    value={marketingValue}
                    onToggle={handleToggleMarketing}
                    disabled={!canControlChildren}
                />
            </View>
        </SafeAreaView>
    );
}
