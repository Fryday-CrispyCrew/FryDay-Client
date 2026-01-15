import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MyPageHeader from "../../components/MypageHeader";
import SystemBox from "../../components/SystemBox";

const SYSTEM_NOTICE_MOCK = {
    title: '2000.00.00',
    content: '어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구',
};

export default function SystemNotice() {
    return (
        <SafeAreaView className="flex-1 bg-gr" edges={["top", "bottom"]}>
            <MyPageHeader showBackButton title="공지 사항" />

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
                <SystemBox
                    title={SYSTEM_NOTICE_MOCK.title}
                    content={SYSTEM_NOTICE_MOCK.content}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
