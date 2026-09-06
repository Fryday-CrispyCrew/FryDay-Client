import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupScreen from "../../../features/group/screens/GroupScreen";

const Stack = createNativeStackNavigator();

export default function GroupStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupHome" component={GroupScreen} />
    </Stack.Navigator>
  );
}
