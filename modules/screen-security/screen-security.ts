import { requireOptionalNativeModule } from 'expo-modules-core';
import type { EventSubscription } from 'expo-modules-core';
import { Platform } from 'react-native';

interface ScreenSecurityNativeModule {
  getDeviceId(): Promise<string>;
  isBiometricAuthenticated(): Promise<boolean>;
  addListener(
    eventName: 'onScreenshotTaken',
    listener: () => void
  ): EventSubscription;
}

const nativeModule =
  Platform.OS === 'web'
    ? null
    : requireOptionalNativeModule<ScreenSecurityNativeModule>('ScreenSecurity');

export function isScreenSecurityAvailable(): boolean {
  return nativeModule !== null;
}

export async function getDeviceId(): Promise<string> {
  if (!nativeModule) {
    throw new Error(
      'ScreenSecurity is not installed in this app. Rebuild the native development app to enable device identity.'
    );
  }
  return nativeModule.getDeviceId();
}

export async function isBiometricAuthenticated(): Promise<boolean> {
  if (!nativeModule) {
    throw new Error(
      'ScreenSecurity is not installed in this app. Rebuild the native development app to use biometric authentication.'
    );
  }
  return nativeModule.isBiometricAuthenticated();
}

export function addScreenshotListener(listener: () => void) {
  if (!nativeModule) {
    throw new Error(
      'ScreenSecurity is not installed in this app. Rebuild the native development app to listen for screenshots.'
    );
  }
  return nativeModule.addListener('onScreenshotTaken', listener);
}
