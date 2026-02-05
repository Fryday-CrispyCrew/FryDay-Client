import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NamingScreen from "../../../features/auth/screens/Naming/NamingScreen";
import ConsentScreen from "../../../features/auth/screens/consent/ConsentScreen";

const Stack = createNativeStackNavigator();

export default function NamingStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Consent" component={ConsentScreen} />
        </Stack.Navigator>
    );
}
