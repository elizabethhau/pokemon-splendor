import { GameState, PlayerState } from '../types/game';

export function currentPlayer(game: GameState): PlayerState {
  return game.players[game.currentPlayerIndex];
}

export function trainerPoints(player: PlayerState): number {
  const cardTP = player.trainedCards.reduce((sum, c) => sum + c.trainerPoints, 0);
  const legendaryTP = player.legendaries.reduce((sum, l) => sum + l.trainerPoints, 0);
  const mewTP = player.mythical ? player.mythical.trainerPoints : 0;
  return cardTP + legendaryTP + mewTP;
}
