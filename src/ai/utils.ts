import { EnergyType, GameState, PlayerState, PokeballTier, TokenType } from '../types/game';
import { canAfford } from '../store/selectors';
import { totalTokens } from '../store/gameRules';
import { MAX_TOKENS, MIN_SUPPLY_FOR_TAKE_TWO } from '../constants';

export const BALL_ORDER: PokeballTier[] = ['MasterBall', 'UltraBall', 'GreatBall', 'Pokeball'];

export function bestAffordableCard(player: PlayerState, game: GameState, typeFilter?: EnergyType) {
  const faceCards = [
    ...game.board.tier1Face,
    ...game.board.tier2Face,
    ...game.board.tier3Face,
  ];
  const candidates = [...faceCards, ...player.scoutedCards]
    .filter(c => canAfford(player, c))
    .filter(c => typeFilter == null || c.energyType === typeFilter);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, c) => c.trainerPoints > best.trainerPoints ? c : best);
}

export function bestTokenSelection(
  _player: PlayerState,
  supply: GameState['board']['energySupply'],
  preferTypes?: EnergyType[],
): Partial<Record<EnergyType, number>> | null {
  const types: EnergyType[] = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic'];

  // Sort: preferred types first, then by supply descending
  const available = types
    .filter(t => supply[t] > 0)
    .sort((a, b) => {
      const aPref = preferTypes?.includes(a) ? 1 : 0;
      const bPref = preferTypes?.includes(b) ? 1 : 0;
      if (bPref !== aPref) return bPref - aPref;
      return supply[b] - supply[a];
    });

  if (available.length === 0) return null;

  // Try 3 different types
  if (available.length >= 3) {
    return { [available[0]]: 1, [available[1]]: 1, [available[2]]: 1 } as Partial<Record<EnergyType, number>>;
  }

  // Try 2 different types
  if (available.length === 2) {
    return { [available[0]]: 1, [available[1]]: 1 } as Partial<Record<EnergyType, number>>;
  }

  // Try 2 of same type
  if (supply[available[0]] >= MIN_SUPPLY_FOR_TAKE_TWO) {
    return { [available[0]]: 2 };
  }

  // Take 1
  return { [available[0]]: 1 };
}

// Returns which tokens to discard to get back to MAX_TOKENS.
// Strategy: discard most-held types first.
export function getAIDiscard(player: PlayerState): Partial<Record<TokenType, number>> {
  const excess = totalTokens(player.energyTokens) - MAX_TOKENS;
  if (excess <= 0) return {};

  const sorted = (Object.entries(player.energyTokens) as [TokenType, number][])
    .filter(([, n]) => n > 0)
    .sort(([, a], [, b]) => b - a);

  const discard: Partial<Record<TokenType, number>> = {};
  let remaining = excess;

  for (const [type, held] of sorted) {
    if (remaining <= 0) break;
    const drop = Math.min(held, remaining);
    discard[type] = drop;
    remaining -= drop;
  }

  return discard;
}
