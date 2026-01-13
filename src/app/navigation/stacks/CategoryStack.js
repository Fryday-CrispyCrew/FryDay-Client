// src/app/navigation/stacks/CategoryStack.js
import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import CategListScreen from "../../../features/todo/screens/Category/CategListScreen";
import CategEditScreen from "../../../features/todo/screens/Category/CategEditScreen";

const Stack = createNativeStackNavigator();

export default function CategoryStack() {
  return (
    <Stack.Navigator
      initialRouteName="CategList"
      screenOptions={{headerShown: false}}
    >
      <Stack.Screen name="CategList" component={CategListScreen} />
      <Stack.Screen name="CategEdit" component={CategEditScreen} />
    </Stack.Navigator>
  );
}
