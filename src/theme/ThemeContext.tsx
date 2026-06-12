import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeId, themes, THEME_IDS } from './themes';

const THEME_KEY = 'themeId';

export async function loadStoredThemeId(): Promise<ThemeId> {
  const stored = await AsyncStorage.getItem(THEME_KEY);
  if (stored && (THEME_IDS as readonly string[]).includes(stored)) return stored as ThemeId;
  return 'A';
}

export async function persistThemeId(id: ThemeId): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, id);
}

type ThemeContextValue = {
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: themes.A,
  themeId: 'A',
  setThemeId: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>('A');

  useEffect(() => {
    loadStoredThemeId().then(setThemeIdState).catch(() => {});
  }, []);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    persistThemeId(id).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeId], themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
