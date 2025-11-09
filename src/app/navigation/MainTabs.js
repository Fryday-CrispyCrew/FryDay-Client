// src/app/navigation/stacks/MainTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import TodoStack from './stacks/TodoStack';
import CalendarStack from './stacks/CalendarStack';
import ReportStack from './stacks/ReportStack';
import MyPageStack from './stacks/MyPageStack';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Todo" // Home tab (TodoStack) selected by default
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1a1a1a',
        tabBarInactiveTintColor: '#c7c7c7',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { paddingTop: 6 },
        tabBarIcon: ({ color, focused, size }) => {
          let iconName = 'home-outline';
          switch (route.name) {
            case 'Todo':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Calendar':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Report':
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
              break;
            case 'MyPage':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              break;
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Todo" component={TodoStack} options={{ tabBarLabel: '홈' }} />
      <Tab.Screen name="Calendar" component={CalendarStack} options={{ tabBarLabel: '캘린더' }} />
      <Tab.Screen name="Report" component={ReportStack} options={{ tabBarLabel: '리포트' }} />
      <Tab.Screen name="MyPage" component={MyPageStack} options={{ tabBarLabel: '설정' }} />
    </Tab.Navigator>
  );
}
