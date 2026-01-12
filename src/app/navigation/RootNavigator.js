// src/app/navigation/RootNavigator.js
import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";

import AuthStack from "./stacks/AuthStack";
import OnboardingStack from "./stacks/OnboardingStack";
import NamingStack from "./stacks/NamingStack";
import MainTabs from "./MainTabs";
import AppErrorBoundary from "../../shared/components/AppErrorBoundary";
import AgreementModal from "../../features/auth/screens/Agreement/AgreementModal";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <AppErrorBoundary>
      <Stack.Navigator
        id="root"
        screenOptions={{headerShown: false}}
        initialRouteName="Main"
      >
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Naming" component={NamingStack} />
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Agreement"
          component={AgreementModal}
          options={{
            presentation: "transparentModal",
            contentStyle: {backgroundColor: "transparent"},
            animation: "fade",
          }}
        />
      </Stack.Navigator>
    </AppErrorBoundary>
  );
}
