import { Capacitor } from '@capacitor/core';
import { AdMob } from '@capacitor-community/admob';
import { PushNotifications } from '@capacitor/push-notifications';
import { Purchases } from '@revenuecat/purchases-capacitor';

export const isNative = Capacitor.isNativePlatform();

export const initializeNativePlugins = async () => {
  if (!isNative) return;

  try {
    // Initialize AdMob
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
      initializeForTesting: true,
    });
    console.log('AdMob initialized');
  } catch (e) {
    console.error('Failed to initialize AdMob', e);
  }

  try {
    // Initialize RevenueCat (replace with your actual public API key)
    await Purchases.configure({ apiKey: 'goog_YOUR_REVENUECAT_API_KEY' });
    console.log('RevenueCat initialized');
  } catch (e) {
    console.error('Failed to initialize RevenueCat', e);
  }

  try {
    // Request Push Notification permissions
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive === 'granted') {
      await PushNotifications.register();
      console.log('Push Notifications registered');
    }
  } catch (e) {
    console.error('Failed to initialize Push Notifications', e);
  }
};
