import {SafeAreaView, View} from 'react-native'
import React from 'react'
import MyPageHeader from "../components/MypageHeader";
import MyPageMenu from "../components/MypageMenu";

export default function MyProfileScreen({}){
  return (
      <SafeAreaView className="flex-1 bg-gr">
          <MyPageHeader
          showBackButton={false}
          title="설정"/>
          <View className="px-5 gap-4">
              <MyPageMenu
                  menuTitle="계정 설정"
                  to="EditProfile"/>
              <MyPageMenu
                  menuTitle="공지 사항"
                  to="Notice"/>
              <MyPageMenu
                  menuTitle="알람 설정"
                  to="EditProfile"/>
              {/*알람 설정 페이지 수정 필요*/}
              <MyPageMenu
                  menuTitle="이용 정책"
                  to="Use"/>
          </View>
      </SafeAreaView>

  );
}