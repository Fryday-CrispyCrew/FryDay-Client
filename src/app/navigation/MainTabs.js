// src/app/navigation/stacks/MainTabs.jsx
import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TodoStack from "./stacks/TodoStack";
import CalendarStack from "./stacks/CalendarStack";
import ReportScreen from "../../features/report/screens/ReportScreen";
import MyPageStack from "./stacks/MyPageStack";
import analytics from "@react-native-firebase/analytics";

import CustomTabBar from "./components/CustomTabBar";
import * as SecureStore from "expo-secure-store";

const Tab = createBottomTabNavigator();

/** 하단 탭 바 네비게이션 */
export default function MainTabs() {
  useEffect(() => {
    const trackFirstMainView = async () => {
      const hasTracked = await SecureStore.getItemAsync("hasTrackedMainView");

      if (!hasTracked) {
        await analytics().logEvent("main_view");
        await SecureStore.setItemAsync("hasTrackedMainView", "true");
      }
    };

    trackFirstMainView().catch(() => {});
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Todo"
      tabBar={(props) => {
        const focusedRoute = props.state.routes[props.state.index];

        const nestedRouteName =
          focusedRoute.state?.routes?.[focusedRoute.state?.index]?.name;

        if (nestedRouteName === "OnboardingReview") {
          return null;
        }

        return <CustomTabBar {...props} />;
      }}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Todo" component={TodoStack} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="MyPage" component={MyPageStack} />
    </Tab.Navigator>
  );
}
