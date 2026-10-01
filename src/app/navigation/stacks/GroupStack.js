import React, { useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import useGroupEvents from "../../../features/group/hooks/useGroupEvents";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupHomeScreen from "../../../features/group/screens/GroupHomeScreen";
import GroupCreateScreen from "../../../features/group/screens/GroupCreateScreen";
import GroupCreateCompleteScreen from "../../../features/group/screens/GroupCreateCompleteScreen";
import GroupJoinScreen from "../../../features/group/screens/GroupJoinScreen";
import GroupDetailScreen from "../../../features/group/screens/GroupDetailScreen";
import GroupSettingScreen from "../../../features/group/screens/GroupSettingScreen";
import GroupNameEditScreen from "../../../features/group/screens/GroupNameEditScreen";
import GroupCategorySelectScreen from "../../../features/group/screens/GroupCategorySelectScreen";
import GroupMemberTodosScreen from "../../../features/group/screens/GroupMemberTodosScreen";

const Stack = createNativeStackNavigator();

export default function GroupStack() {
  const [groupId, setGroupId] = useState(null);
  const focused = useIsFocused();
  useGroupEvents(focused ? groupId : null);
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      screenListeners={{
        state: ({ data }) => {
          const state = data.state;
          const route = state.routes[state.index ?? 0];
          setGroupId(route?.params?.groupId ? String(route.params.groupId) : null);
        },
      }}
    >
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
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="GroupSetting" component={GroupSettingScreen} />
      <Stack.Screen name="GroupNameEdit" component={GroupNameEditScreen} />
      <Stack.Screen
        name="GroupCategorySelect"
        component={GroupCategorySelectScreen}
      />
      <Stack.Screen
        name="GroupMemberTodos"
        component={GroupMemberTodosScreen}
      />
    </Stack.Navigator>
  );
}
