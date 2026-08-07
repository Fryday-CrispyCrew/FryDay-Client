import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MyPageHeader from "../../components/MypageHeader";
import SystemBox from "../../components/SystemBox";
import { TERMS_DATA } from "../../../../shared/constants/terms";

export default function SystemUse() {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView className="flex-1 bg-gr" edges={["top"]}>
            <MyPageHeader showBackButton title="이용 약관" />

            <View className="flex-1">
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingTop: 16,
                        paddingBottom: 80 + (insets.bottom || 0),
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
            </View>
        </SafeAreaView>
    );
}
