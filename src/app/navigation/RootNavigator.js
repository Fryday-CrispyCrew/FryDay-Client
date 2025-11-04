// src/app/navigation/RootNavigator.js
import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import AuthStack from "./stacks/AuthStack";
import MainTabs from "./MainTabs";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}  
      initialRouteName="Auth"
    >
      <Stack.Screen name="Auth" component={AuthStack} screenOptions={{headerShown: false}}/>
      <Stack.Screen name="Main" component={MainTabs} screenOptions={{headerShown: false}}/>
    </Stack.Navigator>
  );
}