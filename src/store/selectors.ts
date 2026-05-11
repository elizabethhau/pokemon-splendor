import { EnergyType, GameState, Legendary, Mythical, PlayerState, PokemonCard } from '../types/game';

export function currentPlayer(game: GameState): PlayerState {
  return game.players[game.currentPlayerIndex];
}

export function trainerPoints(player: PlayerState): number {
  const cardTP = player.trainedCards.reduce((sum, c) => sum + c.trainerPoints, 0);
  const legendaryTP = player.legendaries.reduce((sum, l) => sum + l.trainerPoints, 0);
  const mewTP = player.mythical ? player.mythical.trainerPoints : 0;
  return cardTP + legendaryTP + mewTP;
}

export function canAfford(player: PlayerState, card: PokemonCard): boolean {
  let dittoAvailable = player.energyTokens.Ditto ?? 0;
  let dittoNeeded = 0;

  for (const [type, rawCost] of Object.entries(card.cost) as [EnergyType, number][]) {
    const bonus = player.typeBonuses[type] ?? 0;
    const effective = Math.max(0, rawCost - bonus);
    const tokensPay = Math.min(effective, player.energyTokens[type] ?? 0);
    dittoNeeded += effective - tokensPay;
  }

  return dittoNeeded <= dittoAvailable;
}

export function canClaimLegendary(player: PlayerState, legendary: Legendary): boolean {
  return (Object.entries(legendary.requirements) as [EnergyType, number][]).every(
    ([type, required]) => (player.typeBonuses[type] ?? 0) >= required
  );
}

export function canCatchMew(player: PlayerState, mew: Mythical): boolean {
  const hasEnoughLegendaries = player.legendaries.length >= mew.legendariesRequired;
  const hasAnyBall = Object.values(player.pokeballs).some(n => (n ?? 0) > 0);
  return hasEnoughLegendaries && hasAnyBall;
}
