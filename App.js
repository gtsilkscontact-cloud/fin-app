import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PermissionsAndroid, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { TransactionProvider } from './src/context/TransactionContext';
import AppNavigator from './src/navigation/AppNavigator';

// Configure notification handler to fix deprecation warnings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Delay to ensure app is fully loaded
      setTimeout(() => {
        requestSmsPermission();
      }, 1000);
    }
  }, []);

  async function requestSmsPermission() {
    try {
      // First check if we already have permissions
      const readSmsGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );
      const receiveSmsGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
      );

      if (readSmsGranted && receiveSmsGranted) {
        console.log('SMS permissions already granted');
        return;
      }

      // Request permissions
      console.log('Requesting SMS permissions...');
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      ]);

      console.log('Permission results:', granted);

      if (
        granted['android.permission.READ_SMS'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.RECEIVE_SMS'] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('SMS permissions granted');
      } else {
        console.log('SMS permissions denied');
        console.log('Please enable SMS permissions in Settings > Apps > fin-app > Permissions');
      }
    } catch (err) {
      console.warn('Error requesting SMS permissions:', err);
    }
  }

  return (
    <TransactionProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </TransactionProvider>
  );
}
