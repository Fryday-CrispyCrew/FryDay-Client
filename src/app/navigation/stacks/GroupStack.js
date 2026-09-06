import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupHomeScreen from "../../../features/group/screens/GroupHomeScreen";

const Stack = createNativeStackNavigator();

export default function GroupStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupHome" component={GroupHomeScreen} />
    </Stack.Navigator>
  );
}
