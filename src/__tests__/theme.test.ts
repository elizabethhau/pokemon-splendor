import { themes, THEME_IDS } from '../theme/themes';
import { loadStoredThemeId, persistThemeId } from '../theme/ThemeContext';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

test('exposes the three prototype palettes with their labels', () => {
  expect(THEME_IDS).toEqual(['A', 'B', 'C']);
  expect(themes.A.label).toBe('TCG');
  expect(themes.B.label).toBe('Clean');
  expect(themes.C.label).toBe('Pokédex');
});

test('every palette defines the same token set', () => {
  const keysA = Object.keys(themes.A).sort();
  expect(Object.keys(themes.B).sort()).toEqual(keysA);
  expect(Object.keys(themes.C).sort()).toEqual(keysA);
});

test('defaults to theme A when nothing is stored', async () => {
  mockGetItem.mockResolvedValueOnce(null);
  expect(await loadStoredThemeId()).toBe('A');
});

test('returns the stored theme when valid', async () => {
  mockGetItem.mockResolvedValueOnce('C');
  expect(await loadStoredThemeId()).toBe('C');
});

test('falls back to theme A when the stored value is not a theme id', async () => {
  mockGetItem.mockResolvedValueOnce('purple');
  expect(await loadStoredThemeId()).toBe('A');
});

test('persists the chosen theme so it survives restart', async () => {
  mockSetItem.mockResolvedValueOnce(undefined);
  await persistThemeId('B');
  expect(mockSetItem).toHaveBeenCalledWith('themeId', 'B');

  mockGetItem.mockResolvedValueOnce('B');
  expect(await loadStoredThemeId()).toBe('B');
});
