// src/app/navigation/stacks/MyPageStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';
import MyProfileScreen from '../../../features/mypage/screens/MyProfileScreen';
import EditProfile from '../../../features/mypage/screens/EditProfile/EditProfile';
import SystemNotice from "../../../features/mypage/screens/System/SystemNotice";
import SystemUse from "../../../features/mypage/screens/System/SystemUse";
import SystemQna from "../../../features/mypage/screens/System/SystemQna";

const Stack = createNativeStackNavigator();

export default function MyPageStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="Notice" component={SystemNotice} />
        <Stack.Screen name="Use" component={SystemUse} />
        <Stack.Screen name="Qna" component={SystemQna} />
    </Stack.Navigator>
  );
}
