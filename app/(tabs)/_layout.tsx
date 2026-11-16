import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        title: route.name === 'index' ? 'Home' : 'Payouts',
        tabBarIcon: ({ color }) => (
          <IconSymbol
            size={28}
            name={route.name === 'index' ? 'house.fill' : 'arrow.up.circle.fill'}
            color={color}
          />
        ),
      })}
    />
  );
}
