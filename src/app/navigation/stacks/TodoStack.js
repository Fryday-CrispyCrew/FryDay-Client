// src/app/navigation/stacks/TodoStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import HomeScreen from '../../../features/todo/screens/Home/HomeScreen';
import CategListScreen from '../../../features/todo/screens/Category/CategListScreen';
import CategCreateScreen from '../../../features/todo/screens/Category/CategCreateScreen';
import CategEditScreen from '../../../features/todo/screens/Category/CategEditScreen';

const Stack = createNativeStackNavigator();

export default function TodoStack() {
  return (
    <Stack.Navigator initialRouteName='Home' screenOptions={{headerShown:false}}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CategList" component={CategListScreen} />
      <Stack.Screen name="CategCreate" component={CategCreateScreen} />
      <Stack.Screen name="CategEdit" component={CategEditScreen} />
    </Stack.Navigator>
  );
}
