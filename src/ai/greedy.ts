import { GameAction, GameState } from '../types/game';
import { canCatchMew, currentPlayer } from '../store/selectors';
import { bestAffordableCard, bestTokenSelection, BALL_ORDER } from './utils';

export function getGreedyMove(game: GameState): GameAction {
  const player = currentPlayer(game);

  // 1. Catch Mew if eligible
  if (game.board.mew && canCatchMew(player, game.board.mew)) {
    const ball = BALL_ORDER.find(b => (player.pokeballs[b] ?? 0) > 0);
    if (ball) return { type: 'catchMew', ball };
  }

  // 2. Train highest-TP affordable card
  const card = bestAffordableCard(player, game);
  if (card) return { type: 'trainCard', card };

  // 3. Take tokens
  const tokens = bestTokenSelection(player, game.board.energySupply);
  if (tokens) return { type: 'takeTokens', tokens };

  // Fallback: take 1 of whatever is available (shouldn't normally reach here)
  const anyType = (['Fire', 'Water', 'Grass', 'Electric', 'Psychic'] as const)
    .find(t => game.board.energySupply[t] > 0);
  if (anyType) return { type: 'takeTokens', tokens: { [anyType]: 1 } };

  // Last resort: take 1 token even if it triggers discard (game is stuck otherwise)
  return { type: 'takeTokens', tokens: { Fire: 1 } };
}
