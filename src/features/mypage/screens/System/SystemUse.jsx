import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MyPageHeader from "../../components/MypageHeader";
import SystemBox from "../../components/SystemBox";

const SYSTEM_NOTICE_MOCK = {
    title: '이용약관',
    content: '이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 이용 약관 텍스트 ',
};

export default function SystemUse() {
    return (
        <SafeAreaView className="flex-1 bg-gr" edges={["top", "bottom"]}>
            <MyPageHeader showBackButton title="이용 약관" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 24,
                    rowGap: 16,
                }}
            >
                <SystemBox
                    title={SYSTEM_NOTICE_MOCK.title}
                    content={SYSTEM_NOTICE_MOCK.content}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
