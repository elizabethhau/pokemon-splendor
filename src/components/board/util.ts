import { PokeballTier, TokenType } from '../../types/game';

// Prototype DARK(): light token colors need dark text
export function onTypeColor(type: TokenType): string {
  return type === 'Electric' || type === 'Ditto' ? '#243049' : '#ffffff';
}

// Prototype ballTop colors (top half of the ball glyph)
export const BALL_TOP_COLORS: Record<PokeballTier, string> = {
  Pokeball: '#ee4b3b',
  GreatBall: '#3a78d8',
  UltraBall: '#f5c211',
  MasterBall: '#6a4aa0',
};

// Seat avatars: Pikachu, Charmander, Squirtle, Bulbasaur
export const SEAT_AVATAR_DEX = [25, 4, 7, 1] as const;
