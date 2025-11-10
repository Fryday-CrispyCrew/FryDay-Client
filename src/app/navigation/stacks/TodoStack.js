// src/app/navigation/stacks/TodoStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import HomeScreen from '../../../features/todo/screens/Home/HomeScreen';

const Stack = createNativeStackNavigator();

export default function TodoStack() {
  return (
    <Stack.Navigator initialRouteName='Home'>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}
