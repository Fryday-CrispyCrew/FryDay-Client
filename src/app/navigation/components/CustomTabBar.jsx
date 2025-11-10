// src/app/navigation/stacks/components/CustomTabBar.jsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_CONFIG, HIDDEN_ROUTES } from './tabConfig';
import { getDeepActiveRouteName } from './navigationHelper';

export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();

  const activeTabRoute = state.routes[state.index];
  const activeNestedRouteName = getDeepActiveRouteName(activeTabRoute);

  // 숨김 조건
  if (activeNestedRouteName && HIDDEN_ROUTES.includes(activeNestedRouteName)) {
    return null;
  }

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
