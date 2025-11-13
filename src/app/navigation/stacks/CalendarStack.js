// src/app/navigation/stacks/CalendarStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';
import WeekScreen from '../../../features/calendar/screens/Week/WeekScreen';
import MonthScreen from '../../../features/calendar/screens/Month/MonthScreen';

const Stack = createNativeStackNavigator();

export default function CalendarStack() {
  return (
    <Stack.Navigator initialRouteName='Week'>
      <Stack.Screen name="Week" component={WeekScreen}/>
      <Stack.Screen name="Month" component={MonthScreen}/>
    </Stack.Navigator>
  );
}