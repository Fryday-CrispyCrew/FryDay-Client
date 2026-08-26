import React, { useEffect, useState } from "react";
import { Image, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

import MyPageHeader from "../components/MypageHeader";
import MyPageMenu from "../components/MypageMenu";
import Banner from "../../../shared/components/Banner";
import CharaterImage from "../assets/png/mypage_icon.png";
import AccountReportCard from "../components/AccountReportCard";
import { getReport } from "../../report/api/reportApi";

export default function MyProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [nickname, setNickname] = useState("");
  const [summary, setSummary] = useState({ crispy: 0, burnt: 0 });

  // 화면 진입할 때마다 fresh 로 로드
  useFocusEffect(
    React.useCallback(() => {
      let alive = true;

      (async () => {
        const nick = await SecureStore.getItemAsync("nickname");
        if (alive && nick) setNickname(nick);

        try {
          const res = await getReport(year, month);
          if (!alive) return;

          const payload = res?.data ?? res?.result ?? res;
          const categories =
            payload?.categories ??
            payload?.categoryList ??
            payload?.categoryStats ??
            [];

          const totals = categories.reduce(
            (acc, c) => {
              const total = Number(c?.totalTodos ?? c?.total ?? 0);
              const success = Number(c?.completedTodos ?? c?.completed ?? 0);
              const fail =
                c?.incompleteTodos != null
                  ? Number(c.incompleteTodos)
                  : c?.fail != null
                    ? Number(c.fail)
                    : Math.max(0, total - success);
              acc.crispy += success;
              acc.burnt += fail;
              return acc;
            },
            { crispy: 0, burnt: 0 },
          );
          setSummary(totals);
        } catch {
          if (alive) setSummary({ crispy: 0, burnt: 0 });
        }
      })();

      return () => {
        alive = false;
      };
    }, [year, month]),
  );

  return (
    <SafeAreaView className="flex-1 bg-gr" edges={["top", "bottom"]}>
      <View
        pointerEvents="none"
        className="absolute right-5"
        style={{ top: insets.top }}
      >
        <Image
          source={CharaterImage}
          style={{ width: 155, height: 155 }}
          resizeMode="contain"
        />
      </View>

      <MyPageHeader showBackButton={false} title="마이페이지" />

      <View
        className="flex-col px-5 py-4 gap-4"
      >
        <AccountReportCard
          username={nickname}
          monthLabel={month}
          crispyCount={summary.crispy}
          burntCount={summary.burnt}
          onPressAccount={() => navigation.navigate("EditProfile")}
          onPressReport={() => navigation.navigate("Report")}
        />

        {/* 배너 광고 */}
        <View style={{ alignSelf: "center", marginTop: 28 }}>
          <Banner />
        </View>

        <MyPageMenu menuTitle="공지 사항" to="Notice" />
        {/*<MyPageMenu menuTitle="계정 설정" to="EditProfile" />*/}
        <MyPageMenu menuTitle="알림 설정" to="Alarm" />
        <MyPageMenu menuTitle="이용 약관" to="Use" />
        <MyPageMenu menuTitle="자주 묻는 질문" to="Qna" />
        <MyPageMenu menuTitle="버전 정보" rightText="v1.2.0" hideArrow />
      </View>
    </SafeAreaView>
  );
}