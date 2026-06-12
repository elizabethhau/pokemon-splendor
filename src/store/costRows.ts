import { EnergyType, PlayerState, PokemonCard } from '../types/game';

export type CostRow = {
  type: EnergyType | null; // null for the free-card row
  need: number;
  label: string;
  status: string;
  ok: boolean;
};

// Per-type cost status for the card detail modal (prototype wording).
// Overall affordability stays with the engine's canAfford, which is Ditto-aware.
export function costRows(player: PlayerState, card: PokemonCard): CostRow[] {
  const rows = (Object.entries(card.cost) as [EnergyType, number][])
    .filter(([, need]) => need > 0)
    .map(([type, need]) => {
      const bonus = player.typeBonuses[type] ?? 0;
      const afterBonus = Math.max(0, need - bonus);
      const have = player.energyTokens[type] ?? 0;
      const ok = have >= afterBonus;
      return {
        type,
        need,
        label: type + (bonus > 0 ? ` (−${Math.min(bonus, need)} bonus)` : ''),
        status: afterBonus === 0 ? 'covered by bonus' : ok ? `you have ${have}` : `have ${have} / need ${afterBonus}`,
        ok: afterBonus === 0 || ok,
      };
    });
  if (rows.length === 0) {
    return [{ type: null, need: 0, label: 'Free', status: 'no cost', ok: true }];
  }
  return rows;
}
