import { getSpriteUri } from '../utils/spriteCache';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Test 8a ──────────────────────────────────────────────────────────────────
test('getSpriteUri returns cached URI without fetching when cache hit', async () => {
  const cachedUri = `${SPRITE_BASE}/25.png`;
  mockGetItem.mockResolvedValueOnce(cachedUri);

  const uri = await getSpriteUri(25);

  expect(uri).toBe(cachedUri);
  expect(mockSetItem).not.toHaveBeenCalled();
});

// ─── Test 8b ──────────────────────────────────────────────────────────────────
test('getSpriteUri builds correct PokeAPI CDN URI on cache miss and stores it', async () => {
  mockGetItem.mockResolvedValueOnce(null);
  mockSetItem.mockResolvedValueOnce(undefined);

  const uri = await getSpriteUri(25);

  expect(uri).toBe(`${SPRITE_BASE}/25.png`);
  expect(mockSetItem).toHaveBeenCalledWith('sprite_25', `${SPRITE_BASE}/25.png`);
});
