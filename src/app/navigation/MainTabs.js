// src/app/navigation/stacks/MainTabs.jsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TodoStack from './stacks/TodoStack';
import CalendarStack from './stacks/CalendarStack';
import ReportStack from './stacks/ReportStack';
import MyPageStack from './stacks/MyPageStack';

import HomeActive from './assets/Home_Active.svg';
import HomeInactive from './assets/Home_Inactive.svg';
import CalendarActive from './assets/Calendar_Active.svg';
import CalendarInactive from './assets/Calendar_Inactive.svg';
import ReportActive from './assets/Report_Active.svg';
import ReportInactive from './assets/Report_Inactive.svg';
import SettingActive from './assets/Settings_Active.svg';
import SettingInactive from './assets/Settings_Inactive.svg';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  Todo: { label: '홈', active: HomeActive, inactive: HomeInactive },
  Calendar: { label: '캘린더', active: CalendarActive, inactive: CalendarInactive },
  Report: { label: '리포트', active: ReportActive, inactive: ReportInactive },
  MyPage: { label: '설정', active: SettingActive, inactive: SettingInactive },
};

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { label, active, inactive } = TAB_CONFIG[route.name];
        const Icon = focused ? active : inactive;

        const color = focused ? '#141312' : 'rgba(20, 19, 18, 0.25)';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
            activeOpacity={0.8}
          >
            <Icon width={24} height={24} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Todo"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Todo" component={TodoStack} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
      <Tab.Screen name="Report" component={ReportStack} />
      <Tab.Screen name="MyPage" component={MyPageStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderTopWidth: 0,
    height: '12%',
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3%', // 아이콘과 텍스트 간격
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});
