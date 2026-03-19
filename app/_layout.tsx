import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useAppStore } from '../store/appStore';
import { AlertBanner } from '../components/AlertBanner';
import { triggerService } from '../services/triggerService';
import { backgroundTask } from '../tasks/backgroundTask';
import { permissionService } from '../services/permissionService';

const CUSTOM_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#FF3B30',
    background: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    border: '#3A3A3C',
    notification: '#FF3B30',
  },
};

export default function RootLayout() {
  const isAlarmActive = useAppStore((state) => state.isAlarmActive);
  const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      await backgroundTask.register();
      const granted = await permissionService.requestAllPermissions();
      setPermissionsGranted(granted);
    };

    initializeApp();
  }, []);

  const handleStopSOS = async () => {
    await triggerService.stopSOS();
  };

  return (
    <ThemeProvider value={CUSTOM_THEME}>
      <View style={styles.container}>
        {isAlarmActive && <AlertBanner onPress={handleStopSOS} />}
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal', title: 'TapSafe Pro' }} />
        </Stack>
        <StatusBar style="light" backgroundColor="#1C1C1E" />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
});
