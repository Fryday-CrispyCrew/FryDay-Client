import React, { useMemo } from "react";
import { ScrollView, ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MyPageHeader from "../../components/MypageHeader";
import SystemBox from "../../components/SystemBox";
import { useNoticesQuery } from "../../queries/notice/useNoticesQuery";

export default function SystemNotice() {
  const { data, isLoading } = useNoticesQuery();

  const notices = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return [...data].sort((a, b) => b.id - a.id);
  }, [data]);

  return (
    <SafeAreaView className="flex-1 bg-gr" edges={["top"]}>
      <MyPageHeader showBackButton title="공지 사항" />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 24,
            rowGap: 16,
          }}
        >
          {notices.map((item) => (
            <SystemBox
              key={item.id}
              title={item.noticeDate}
              content={item.content}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
