import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MyPageHeader from "../components/MypageHeader";
import MyPageMenu from "../components/MypageMenu";
import Banner from "../../../shared/components/Banner";

export default function MyProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gr" edges={["top", "bottom"]}>
      <MyPageHeader showBackButton={false} title="설정" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
          rowGap: 16,
        }}
      >
        <MyPageMenu menuTitle="공지 사항" to="Notice" />
        <MyPageMenu menuTitle="계정 설정" to="EditProfile" />
        <MyPageMenu menuTitle="알림 설정" to="Alarm" />
        <MyPageMenu menuTitle="이용 약관" to="Use" />
        <MyPageMenu menuTitle="자주 묻는 질문" to="Qna" />
        <MyPageMenu menuTitle="버전 정보" rightText="v1.1.0" hideArrow />

        {/* 배너 광고 */}
        <View
          style={{
            alignSelf: "center",
            marginTop: 40,
          }}
        >
          <Banner />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
