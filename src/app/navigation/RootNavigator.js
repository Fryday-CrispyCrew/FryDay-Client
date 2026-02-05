import React, {useEffect, useState} from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {getAccessToken} from "../../shared/lib/storage/tokenStorage";

import AuthStack from "./stacks/AuthStack";
import OnboardingStack from "./stacks/OnboardingStack";
import NamingStack from "./stacks/NamingStack";
import ConsentStack from "./stacks/ConsentStack";
import MainTabs from "./MainTabs";
import CategoryStack from "./stacks/CategoryStack";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      setIsLoggedIn(!!token);
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <Stack.Navigator
      id="root"
      screenOptions={{headerShown: false}}
      initialRouteName={isLoggedIn ? "Main" : "Auth"}
      // initialRouteName="Auth"
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
