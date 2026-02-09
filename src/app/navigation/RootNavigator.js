import React, {useEffect, useState} from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getAccessToken} from "../../shared/lib/storage/tokenStorage";

import AuthStack from "./stacks/AuthStack";
import OnboardingStack from "./stacks/OnboardingStack";
import NamingStack from "./stacks/NamingStack";
import ConsentStack from "./stacks/ConsentStack";
import MainTabs from "./MainTabs";
import CategoryStack from "./stacks/CategoryStack";

import {STEP_KEY, ONBOARDING_STEP} from "../../shared/constants/onboardingStep";

const Stack = createNativeStackNavigator();

function stepToRoute(step) {
  switch (step) {
    case ONBOARDING_STEP.NEEDS_AGREEMENT:
      return "Consent";
    case ONBOARDING_STEP.NEEDS_NICKNAME:
      return "Naming";
    case ONBOARDING_STEP.NEEDS_ONBOARDING:
      return "Onboarding";
    case ONBOARDING_STEP.COMPLETED:
      return "Main";
    default:
      return "Consent";
  }
}

export default function RootNavigator() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState("Auth");

  useEffect(() => {
    (async () => {
      const token = await getAccessToken();

      if (!token) {
        setInitialRoute("Auth");
        setReady(true);
        return;
      }

      const step = await AsyncStorage.getItem(STEP_KEY);
      setInitialRoute(stepToRoute(step));
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
      <Stack.Navigator
          id="root"
          screenOptions={{headerShown: false}}
          initialRouteName={initialRoute}
      >
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Naming" component={NamingStack} />
        <Stack.Screen name="Consent" component={ConsentStack} />
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
        <Stack.Screen name="Category" component={CategoryStack} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
  );
}
