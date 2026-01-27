import {SafeAreaView} from "react-native-safe-area-context";
import MyPageHeader from "../../components/MypageHeader";
import {View} from "react-native";
import ToggleMenu from "../../components/ToggleMenu";

export default function SystemAlarm () {
    return(
        <SafeAreaView className="flex-1">
            <MyPageHeader showBackButton title="알림 설정" />
            <View className="px-5 gap-6">
                <ToggleMenu
                    title="푸시 알림"
                    content="프라이데이에서 보내는 푸시 알람을 받을 수 있어요"
                />
                <ToggleMenu
                    title="튀김 알림"
                    content="내가 설정한 튀김 알림을 받을 수 있어요"
                />
                <ToggleMenu
                    title="푸시 알림"
                    content="프라이데이의 새로운 소식 알람을 받을 수 있어요"
                />
            </View>
        </SafeAreaView>
    )
};