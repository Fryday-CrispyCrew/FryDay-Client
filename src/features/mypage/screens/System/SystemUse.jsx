import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MyPageHeader from "../../components/MypageHeader";
import SystemBox from "../../components/SystemBox";
import { TERMS_DATA } from "../../../../shared/constants/terms";

export default function SystemUse() {
    return (
        <SafeAreaView className="flex-1 bg-gr" edges={["top", "bottom"]}>
            <MyPageHeader showBackButton title="이용 약관" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 16,
                    paddingBottom: 24,
                    rowGap: 16,
                }}
            >
                {TERMS_DATA.map((item) => (
                    <SystemBox
                        key={item.key}
                        title={item.title}
                        content={item.content}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
