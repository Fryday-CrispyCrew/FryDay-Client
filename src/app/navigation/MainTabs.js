// src/app/navigation/stacks/MainTabs.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TodoStack from './stacks/TodoStack';
import CalendarStack from './stacks/CalendarStack';
import ReportStack from './stacks/ReportStack';
import MyPageStack from './stacks/MyPageStack';

import CustomTabBar from './components/CustomTabBar';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Todo"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Todo" component={TodoStack} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Report" component={ReportStack} />
      <Tab.Screen name="MyPage" component={MyPageStack} />
    </Tab.Navigator>
  );
}
