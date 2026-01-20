// src/app/navigation/stacks/PreferencesStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';
import LoginScreen from '../../../features/auth/screens/Login/LoginScreen';

const Stack = createNativeStackNavigator();

export default function PreferencesStack() {
  return (
    <Stack.Navigator initialRouteName='Login'>
      {/* <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Fryday 로그인' }} /> */}
    </Stack.Navigator>
  );
}
