import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MyPageHeader from "../../components/MypageHeader";
import SystemBox from "../../components/SystemBox";
import { SYSTEM_NOTICE_LIST } from "../../../../shared/constants/terms";

export default function SystemNotice() {
    return (
        <SafeAreaView className="flex-1 bg-gr" edges={["top", "bottom"]}>
            <MyPageHeader showBackButton title="공지 사항" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 16,
                    paddingBottom: 24,
                    rowGap: 16,
                }}
            >
                {SYSTEM_NOTICE_LIST.map((item) => (
                    <SystemBox
                        key={item.id}
                        title={item.title}
                        content={item.content}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
