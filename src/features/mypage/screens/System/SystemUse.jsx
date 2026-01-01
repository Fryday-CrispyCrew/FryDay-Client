import { SafeAreaView } from 'react-native-safe-area-context';
import MyPageHeader from "../../components/MypageHeader";
import {View} from "react-native";
import React from "react";
import SystemBox from "../../components/SystemBox";

const SYSTEM_NOTICE_MOCK = {
    title: '이용약관',
    content: '이 서비스에 대하여 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구',
};

export default function SystemUse() {
    return (
        <SafeAreaView className="flex-1 bg-gr">
            <MyPageHeader showBackButton title="이용 약관" />

            <View className="px-5 gap-4">
                <SystemBox
                    title={SYSTEM_NOTICE_MOCK.title}
                    content={SYSTEM_NOTICE_MOCK.content}
                />
            </View>

        </SafeAreaView>
    )
}