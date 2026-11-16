import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import {
  addScreenshotListener,
  isScreenSecurityAvailable,
} from '@/modules/screen-security/screen-security';

export function useScreenshotWarning() {
  const [visible, setVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setVisible(false);
      if (!isScreenSecurityAvailable()) {
        return;
      }

      const subscription = addScreenshotListener(() => setVisible(true));
      return () => subscription.remove();
    }, [])
  );

  return {
    visible,
    dismiss: () => setVisible(false),
  };
}
