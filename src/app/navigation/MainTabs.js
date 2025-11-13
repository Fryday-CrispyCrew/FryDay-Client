// src/app/navigation/stacks/MainTabs.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TodoStack from './stacks/TodoStack';
import CalendarStack from './stacks/CalendarStack';
import ReportScreen from '../../features/report/screens/report/ReportScreen';
import MyPageStack from './stacks/MyPageStack';

import CustomTabBar from './components/CustomTabBar';

const Tab = createBottomTabNavigator();

/** 하단 탭 바 네비게이션 */
export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Todo"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Todo" component={TodoStack} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="MyPage" component={MyPageStack} />
    </Tab.Navigator>
  );
}