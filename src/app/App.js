// src/app/App.js
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppProviders from './AppProviders';
import RootNavigator from './navigation/RootNavigator';
import "../../global.css"

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProviders>
        <RootNavigator />
      </AppProviders>
    </SafeAreaProvider>
  );
}
