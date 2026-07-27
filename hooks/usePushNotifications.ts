import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import { shopApi } from '@/services/api';

export const usePushNotifications = (isAuthenticated: boolean) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const requestUserPermission = async () => {
      try {
        if (Platform.OS === 'ios') {
          const authStatus = await messaging().requestPermission();
          const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

          if (!enabled) {
            console.log('Push notification permission denied by user.');
            return;
          }
        } else if (Platform.OS === 'android') {
          // On Android 13+, you might need PermissionsAndroid or Expo's permission handler
          // messaging().requestPermission() also handles Android 13+ seamlessly in newer RNFB versions
          const authStatus = await messaging().requestPermission();
          if (authStatus !== messaging.AuthorizationStatus.AUTHORIZED) {
             console.log('Android Push notification permission denied.');
             return;
          }
        }

        // Get the device token
        const fcmToken = await messaging().getToken();
        
        if (fcmToken) {
          console.log('FCM Token:', fcmToken);
          setToken(fcmToken);
          // Send the token to the backend
          await sendTokenToBackend(fcmToken);
        }

      } catch (error) {
        console.error('Error setting up push notifications:', error);
      }
    };

    const sendTokenToBackend = async (fcmToken: string) => {
      try {
        await shopApi.post('/users/me/push-token', { token: fcmToken });
        console.log('Push token saved to backend successfully.');
      } catch (error) {
        console.error('Failed to save push token to backend:', error);
      }
    };

    requestUserPermission();

    // Listen to token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (fcmToken) => {
      setToken(fcmToken);
      await sendTokenToBackend(fcmToken);
    });

    return () => {
      unsubscribeTokenRefresh();
    };
  }, [isAuthenticated]);

  return { token };
};
