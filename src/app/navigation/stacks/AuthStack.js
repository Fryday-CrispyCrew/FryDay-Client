// src/app/navigation/stacks/AuthStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';
import LoginScreen from '../../../features/auth/screens/Login/LoginScreen';
import OnboardingScreen from "../../../features/auth/screens/Onboarding/OnboardingScreen";
import NamingScreen from "../../../features/auth/screens/Naming/NamingScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}  initialRouteName='Login'>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Fryday 로그인' }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Naming" component={NamingScreen} />
    </Stack.Navigator>
  );
}
