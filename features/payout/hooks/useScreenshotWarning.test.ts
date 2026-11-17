import { act, renderHook } from '@testing-library/react-native';

import {
  addScreenshotListener,
  isScreenSecurityAvailable,
} from '@/modules/screen-security/screen-security';
import { useScreenshotWarning } from './useScreenshotWarning';

jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  return {
    useFocusEffect: (effect: () => void | (() => void)) =>
      React.useEffect(effect, [effect]),
  };
});

jest.mock('@/modules/screen-security/screen-security', () => ({
  addScreenshotListener: jest.fn(),
  isScreenSecurityAvailable: jest.fn(() => true),
}));

describe('useScreenshotWarning', () => {
  const remove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(isScreenSecurityAvailable).mockReturnValue(true);
    jest.mocked(addScreenshotListener).mockReturnValue({ remove });
  });

  it('registers a listener while focused and removes it on blur', () => {
    const { unmount } = renderHook(() => useScreenshotWarning());

    expect(addScreenshotListener).toHaveBeenCalledTimes(1);
    unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('shows the warning when a screenshot event is received', () => {
    const { result } = renderHook(() => useScreenshotWarning());
    const onScreenshot = jest.mocked(addScreenshotListener).mock.calls[0][0];

    act(() => onScreenshot());

    expect(result.current.visible).toBe(true);
  });
});
