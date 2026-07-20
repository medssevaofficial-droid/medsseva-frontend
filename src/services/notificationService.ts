import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import api from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerFcmToken = async (): Promise<void> => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) return;

    const token = await messaging().getToken();
    if (!token) return;

    const saved = await AsyncStorage.getItem('fcm_token');
    if (saved === token) return;

    await api.post('/notifications/token/register', {
      token,
      platform: Platform.OS,
    });

    await AsyncStorage.setItem('fcm_token', token);
  } catch (e) {
    console.warn('FCM token registration failed', e);
  }
};

export const unregisterFcmToken = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem('fcm_token');
    if (!token) return;

    await api.post('/notifications/token/unregister', { token });
    await AsyncStorage.removeItem('fcm_token');
  } catch (e) {
    console.warn('FCM token unregister failed', e);
  }
};

export const setupTokenRefreshListener = (): (() => void) => {
  const unsubscribe = messaging().onTokenRefresh(async (token) => {
    try {
      await api.post('/notifications/token/register', {
        token,
        platform: Platform.OS,
      });
      await AsyncStorage.setItem('fcm_token', token);
    } catch (e) {
      console.warn('Token refresh failed', e);
    }
  });
  return unsubscribe;
};

export const getDeepLinkRoute = (data: Record<string, string>): string | null => {
  const { type, deepLink } = data || {};
  if (!type) return null;

  switch (type) {
    case 'BOOKING_CREATED':
    case 'BOOKING_ACCEPTED':
    case 'BOOKING_REJECTED':
    case 'PARTNER_ARRIVED':
    case 'SAMPLE_COLLECTED':
    case 'PAYMENT_SUCCESS':
    case 'BOOKING_CANCELLED':
    case 'BOOKING_RESCHEDULED':
    case 'APPOINTMENT_REMINDER':
    case 'MISSED_APPOINTMENT':
      return data.bookingId ? `/(tabs)/bookings` : '/(tabs)/bookings';
    case 'PARTNER_ON_THE_WAY':
      return '/(tabs)/track';
    case 'SAMPLE_RECEIVED_IN_LAB':
      return '/(tabs)/bookings';
    case 'REPORT_READY':
    case 'REPORT_SENT':
    case 'REPORT_APPROVED':
      return '/(tabs)/reports';
    case 'PAYMENT_FAILED':
      return '/(tabs)/bookings';
    case 'NEW_BOOKING_ASSIGNED':
      return '/(partner)/home';
    case 'BOOKING_CANCELLED_BY_USER':
      return '/(partner)/home';
    case 'NEW_CHAT_MESSAGE':
    case 'SUPPORT_REPLY':
      return '/support/chat';
    case 'NEW_OFFER':
    case 'NEW_PACKAGE':
    case 'PRICE_UPDATE':
      return '/package';
    default:
      return null;
  }
};