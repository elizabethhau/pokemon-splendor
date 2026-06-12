import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Fredoka_500Medium, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ToastProvider } from './src/components/Toast';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { useGameStore } from './src/store/useGameStore';

const SOUND_KEY = 'soundEnabled';

SplashScreen.preventAutoHideAsync();

// The whole app lives inside the device safe area; the system-bar margins show
// the theme's bezel color, like the prototype's device frame around its canvas.
function SafeAreaFrame() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bezel }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <ToastProvider>
          <AppNavigator />
        </ToastProvider>
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  const setSoundEnabled = useGameStore((s) => s.setSoundEnabled);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const hydrated = useRef(false);

  const [fontsLoaded, fontError] = useFonts({
    Fredoka_500Medium,
    Fredoka_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Load persisted sound preference once on mount
  useEffect(() => {
    AsyncStorage.getItem(SOUND_KEY)
      .then((stored) => {
        if (stored !== null) setSoundEnabled(JSON.parse(stored) as boolean);
        hydrated.current = true;
      })
      .catch(() => { hydrated.current = true; });
  }, [setSoundEnabled]);

  // Save whenever soundEnabled changes (skip the initial hydration write)
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(SOUND_KEY, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Proceed on fontError too — system fonts beat a permanently blank splash
  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SafeAreaFrame />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
