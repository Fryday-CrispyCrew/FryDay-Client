// src/app/navigation/stacks/CalendarStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';
import CalendarScreen from '../../../features/calendar/screens/Calendar/CalendarScreen';

const Stack = createNativeStackNavigator();

export default function CalendarStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Fryday 로그인' }} />
    </Stack.Navigator>
  );
}
