import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Fredoka_500Medium, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeContext';
import { useGameStore } from './src/store/useGameStore';

const SOUND_KEY = 'soundEnabled';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const setSoundEnabled = useGameStore((s) => s.setSoundEnabled);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const hydrated = useRef(false);

  const [fontsLoaded] = useFonts({
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

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
