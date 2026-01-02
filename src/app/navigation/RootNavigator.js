// src/app/navigation/RootNavigator.js
import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import AuthStack from "./stacks/AuthStack";
import MainTabs from "./MainTabs";
import AppErrorBoundary from "../../shared/components/AppErrorBoundary";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
      <AppErrorBoundary>
    <Stack.Navigator
      screenOptions={{headerShown: false}}  
      initialRouteName="Main"
    >
      <Stack.Screen name="Auth" component={AuthStack} screenOptions={{headerShown: false}}/>
      <Stack.Screen name="Main" component={MainTabs} screenOptions={{headerShown: false}}/>
    </Stack.Navigator>
      </AppErrorBoundary>
  );
}