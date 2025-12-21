// src/app/navigation/stacks/MyPageStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';
import MyProfileScreen from '../../../features/mypage/screens/MyProfileScreen';
import EditProfile from '../../../features/mypage/screens/EditProfile/EditProfile';

const Stack = createNativeStackNavigator();

export default function MyPageStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
  );
}
