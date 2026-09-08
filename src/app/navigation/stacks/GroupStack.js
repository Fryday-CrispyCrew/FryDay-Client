import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupHomeScreen from "../../../features/group/screens/GroupHomeScreen";
import GroupCreateScreen from "../../../features/group/screens/GroupCreateScreen";
import GroupCreateCompleteScreen from "../../../features/group/screens/GroupCreateCompleteScreen";
import GroupJoinScreen from "../../../features/group/screens/GroupJoinScreen";

const Stack = createNativeStackNavigator();

export default function GroupStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupHome" component={GroupHomeScreen} />
      <Stack.Screen
        name="GroupCreate"
        component={GroupCreateScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="GroupCreateComplete" component={GroupCreateCompleteScreen} />
      <Stack.Screen
        name="GroupJoin"
        component={GroupJoinScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
