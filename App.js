import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { TransactionProvider } from './src/context/TransactionContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <TransactionProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </TransactionProvider>
  );
}
