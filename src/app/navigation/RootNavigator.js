// src/app/navigation/RootNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "./stacks/AuthStack";
import OnboardingStack from "./stacks/OnboardingStack";
import NamingStack from "./stacks/NamingStack";
import MainTabs from "./MainTabs";
import AppErrorBoundary from "../../shared/components/AppErrorBoundary";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    return (
        <AppErrorBoundary>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Auth">
                <Stack.Screen name="Auth" component={AuthStack} />
                <Stack.Screen name="Onboarding" component={OnboardingStack} />
                <Stack.Screen name="Naming" component={NamingStack} />
                <Stack.Screen name="Main" component={MainTabs} />
            </Stack.Navigator>
        </AppErrorBoundary>
    );
}
