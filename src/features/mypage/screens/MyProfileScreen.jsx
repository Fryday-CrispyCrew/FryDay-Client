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
          <View className="px-5">
              <MyPageMenu
                  menuTitle="계정 설정"
                  to="EditProfile"/>
          </View>
      </SafeAreaView>

  );
}