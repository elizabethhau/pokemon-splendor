import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import { useGameStore } from './src/store/useGameStore';

const SOUND_KEY = 'soundEnabled';

export default function App() {
  const setSoundEnabled = useGameStore((s) => s.setSoundEnabled);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const hydrated = useRef(false);

  // Load persisted sound preference once on mount
  useEffect(() => {
    AsyncStorage.getItem(SOUND_KEY).then((stored) => {
      if (stored !== null) setSoundEnabled(JSON.parse(stored) as boolean);
      hydrated.current = true;
    });
  }, [setSoundEnabled]);

  // Save whenever soundEnabled changes (skip the initial hydration write)
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(SOUND_KEY, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  return <AppNavigator />;
}
