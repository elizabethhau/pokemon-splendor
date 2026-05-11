import { PokeballTier } from './types/game';

// Token economy
export const MAX_TOKENS = 10;
export const MIN_SUPPLY_FOR_TAKE_TWO = 4;
export const INITIAL_ENERGY_SUPPLY = 7;
export const INITIAL_DITTO_SUPPLY = 5;

// Board setup
export const FACE_UP_COUNT = 4;
export const SCOUT_HAND_LIMIT = 3;

// Player limits
export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 4;

// Victory condition
export const TP_TRIGGER_THRESHOLD = 20;

// Mew catch mechanics
export const MEWTWO_POKEDEX_NUMBER = 150;
export const MEWTWO_CATCH_BONUS = 0.10;
export const BASE_CATCH_RATES: Record<PokeballTier, number> = {
  Pokeball: 0.40,
  GreatBall: 0.65,
  UltraBall: 0.85,
  MasterBall: 1.00,
};

export const PHASE = {
  PLAYING: 'playing',
  DISCARDING: 'discarding',
  FINAL_ROUND: 'finalRound',
  GAME_OVER: 'gameOver',
} as const;
