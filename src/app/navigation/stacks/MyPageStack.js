// src/app/navigation/stacks/MyPageStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';
import MyPageScreen from '../../../features/mypage/screens/MyPage/MyPageScreen';

const Stack = createNativeStackNavigator();

export default function MyPageStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MyPage" component={MyPageScreen} options={{ title: 'Fryday 로그인' }} />
    </Stack.Navigator>
  );
}
