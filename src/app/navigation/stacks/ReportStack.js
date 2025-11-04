// src/app/navigation/stacks/ReportStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';
import ReportScreen from '../../../features/report/screens/report/ReportScreen';

const Stack = createNativeStackNavigator();

export default function ReportStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Fryday 로그인' }} />
    </Stack.Navigator>
  );
}
