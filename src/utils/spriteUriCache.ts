import AsyncStorage from '@react-native-async-storage/async-storage';

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// Phase 1: stores the CDN URL only. Intended to evolve into full image-data caching
// (base64 blobs) so sprites work offline — that's why the interface is async and uses AsyncStorage.
export async function getSpriteUri(pokedexNumber: number): Promise<string> {
  const key = `sprite_${pokedexNumber}`;
  const cached = await AsyncStorage.getItem(key);
  if (cached) return cached;

  const uri = `${SPRITE_BASE}/${pokedexNumber}.png`;
  await AsyncStorage.setItem(key, uri);
  return uri;
}
