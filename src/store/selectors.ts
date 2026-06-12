import { EnergyType, GameState, Legendary, Mythical, PlayerState, PokemonCard } from '../types/game';
import { SCOUT_HAND_LIMIT } from '../constants';

const ENERGY_TYPES: EnergyType[] = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic'];

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
  let playerDitto = player.energyTokens.Ditto ?? 0;

  for (const [type, rawCost] of Object.entries(card.cost) as [EnergyType, number][]) {
    const bonus = player.typeBonuses[type] ?? 0;
    const effective = Math.max(0, rawCost - bonus);
    const tokensPay = Math.min(effective, player.energyTokens[type] ?? 0);
    playerDitto -= effective - tokensPay;
  }

  return playerDitto >= 0;
}

export function canClaimLegendary(player: Pick<PlayerState, 'typeBonuses'>, legendary: Legendary): boolean {
  return (Object.entries(legendary.requirements) as [EnergyType, number][]).every(
    ([type, required]) => (player.typeBonuses[type] ?? 0) >= required
  );
}

export function canCatchMew(player: PlayerState, mew: Mythical): boolean {
  const hasEnoughLegendaries = player.legendaries.length >= mew.legendariesRequired;
  const hasAnyBall = Object.values(player.pokeballs).some(n => (n ?? 0) > 0);
  return hasEnoughLegendaries && hasAnyBall;
}

// True if the current player can take any of the five turn actions.
// When false, the only legal move is to pass.
export function hasLegalMove(game: GameState): boolean {
  const player = currentPlayer(game);
  if (ENERGY_TYPES.some(t => game.board.energySupply[t] > 0)) return true;

  const faceUp = [...game.board.tier1Face, ...game.board.tier2Face, ...game.board.tier3Face];
  if ([...faceUp, ...player.scoutedCards].some(c => canAfford(player, c))) return true;

  if (player.scoutedCards.length < SCOUT_HAND_LIMIT) {
    const deckCount = game.board.tier1Deck.length + game.board.tier2Deck.length + game.board.tier3Deck.length;
    if (deckCount > 0 || faceUp.length > 0) return true;
  }

  return game.board.mew !== null && canCatchMew(player, game.board.mew);
}

// Returns the winner(s) at game over. Tiebreaker: fewest trained cards.
// Returns multiple players only when both TP and trained-card count are tied.
export function getWinners(players: PlayerState[]): PlayerState[] {
  const maxTP = Math.max(...players.map(trainerPoints));
  const leaders = players.filter(p => trainerPoints(p) === maxTP);
  const minCards = Math.min(...leaders.map(p => p.trainedCards.length));
  return leaders.filter(p => p.trainedCards.length === minCards);
}
