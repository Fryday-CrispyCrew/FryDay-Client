import {SafeAreaView} from "react-native-safe-area-context";
import MyPageHeader from "../../components/MypageHeader";
import {View, Platform, Linking} from "react-native";
import ToggleMenu from "../../components/ToggleMenu";
import * as Notifications from "expo-notifications";
import {useEffect, useState, useCallback} from "react";

export default function SystemAlarm() {
    const [isPushEnabled, setIsPushEnabled] = useState(false);
    const [isFryAlarmEnabled, setIsFryAlarmEnabled] = useState(false);

    const syncWithSystemPermission = useCallback(async () => {
        const {status} = await Notifications.getPermissionsAsync();
        const allowed = status === "granted";
        setIsPushEnabled(allowed);
        setIsFryAlarmEnabled(allowed ? true : false); // 푸시 ON이면 튀김 기본 true
        return allowed;
    }, []);

    useEffect(() => {
        syncWithSystemPermission();
    }, [syncWithSystemPermission]);

    const openSystemSettings = useCallback(async () => {
        if (Platform.OS === "ios") {
            await Linking.openURL("app-settings:");
            return;
        }
        await Linking.openSettings();
    }, []);

    const handleTogglePush = useCallback(
        async (next) => {
            if (!next) {
                setIsPushEnabled(false);
                setIsFryAlarmEnabled(false);
                return;
            }
            const allowed = await syncWithSystemPermission();
            if (allowed) return;

            await openSystemSettings();
        },
        [openSystemSettings, syncWithSystemPermission]
    );

    return (
        <SafeAreaView className="flex-1">
            <MyPageHeader showBackButton title="알림 설정" />
            <View className="px-5 gap-6">
                <ToggleMenu
                    title="푸시 알림"
                    content="프라이데이에서 보내는 푸시 알람을 받을 수 있어요"
                    value={isPushEnabled}
                    onToggle={handleTogglePush}
                    allowPressWhenDisabled={true}
                />

                <ToggleMenu
                    title="튀김 알림"
                    content="내가 설정한 튀김 알림을 받을 수 있어요"
                    value={isFryAlarmEnabled}
                    onToggle={(v) => setIsFryAlarmEnabled(v)}
                    disabled={!isPushEnabled}
                />

                <ToggleMenu
                    title="마케팅 정보 알림"
                    content="프라이데이의 새로운 소식 알람을 받을 수 있어요"
                    disabled={!isPushEnabled}
                />
            </View>
        </SafeAreaView>
    );
}
