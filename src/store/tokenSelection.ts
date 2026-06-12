import { EnergyType, TokenType } from '../types/game';
import { MIN_SUPPLY_FOR_TAKE_TWO } from '../constants';
import { maxDifferentTakeable } from './gameRules';

export type TokenSelection = Partial<Record<EnergyType, number>>;

// Client-side take rules: 3 different (fewer if supply is short), or 2 of one
// type when 4+ remain. Mirrors the engine's takeTokens validation.
export function canAddToken(
  supply: Record<TokenType, number>,
  selection: TokenSelection,
  type: EnergyType,
): boolean {
  const currentSelected = selection[type] ?? 0;
  const totalSelected = Object.values(selection).reduce<number>((acc, n) => acc + (n ?? 0), 0);

  if (supply[type] - currentSelected <= 0) return false;
  if (totalSelected === 0) return true;

  const selectedTypes = (Object.keys(selection) as EnergyType[]).filter(t => (selection[t] ?? 0) > 0);

  if (totalSelected === 2 && selectedTypes.length === 1) return false;
  if (totalSelected >= 3) return false;

  if (totalSelected === 1 && selectedTypes.length === 1) {
    if (type === selectedTypes[0]) return supply[type] >= MIN_SUPPLY_FOR_TAKE_TWO;
    return true;
  }
  if (totalSelected === 2 && selectedTypes.length === 2) {
    return !selectedTypes.includes(type);
  }
  return false;
}

export function isSelectionValid(
  supply: Record<TokenType, number>,
  selection: TokenSelection,
): boolean {
  const entries = (Object.entries(selection) as [EnergyType, number][]).filter(([, n]) => n > 0);
  const total = entries.reduce((acc, [, n]) => acc + n, 0);
  if (total === 2 && entries.length === 1) return true;
  return entries.length > 0 &&
    entries.length === maxDifferentTakeable(supply) &&
    entries.every(([, n]) => n === 1);
}
