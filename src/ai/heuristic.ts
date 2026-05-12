import { EnergyType, GameAction, GameState, PlayerState, PokemonCard } from '../types/game';
import { canAfford, canCatchMew, currentPlayer } from '../store/selectors';
import { bestTokenSelection, BALL_ORDER } from './utils';
const ENERGY_TYPES: EnergyType[] = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic'];

// Derive the AI's focus type from its current type bonuses + what's reachable on the board.
function focusType(player: PlayerState, game: GameState): EnergyType {
  // Prefer the type with highest bonus (most invested)
  let best: EnergyType = 'Fire';
  let bestBonus = -1;
  for (const t of ENERGY_TYPES) {
    const b = player.typeBonuses[t] ?? 0;
    if (b > bestBonus) { bestBonus = b; best = t; }
  }
  // If no bonuses yet, prefer the type with highest-value Tier 3 card on the board
  if (bestBonus === 0) {
    let bestTP = -1;
    for (const card of game.board.tier3Face) {
      if (card.trainerPoints > bestTP) { bestTP = card.trainerPoints; best = card.energyType; }
    }
  }
  return best;
}

// Score a card for training. Higher = more desirable.
function cardScore(card: PokemonCard, player: PlayerState, game: GameState, focus: EnergyType): number {
  let score = card.trainerPoints * 10;

  // Bonus for being in the focus type
  if (card.energyType === focus) score += 15;

  // Bonus if training this card would claim a legendary
  if (card.typeBonus !== null) {
    const newBonus = (player.typeBonuses[card.typeBonus] ?? 0) + 1;
    for (const leg of game.board.availableLegendaries) {
      const needed = leg.requirements[card.typeBonus] ?? 0;
      if (needed > 0 && newBonus >= needed) {
        // Check all requirements are met
        const wouldClaim = (Object.entries(leg.requirements) as [EnergyType, number][]).every(([t, req]) =>
          t === card.typeBonus ? newBonus >= req : (player.typeBonuses[t] ?? 0) >= req
        );
        if (wouldClaim) {
          score += 30;
          // Urgency: bump score if an opponent is also close to claiming it
          for (const opponent of game.players) {
            if (opponent.id === player.id) continue;
            const opponentClose = (Object.entries(leg.requirements) as [EnergyType, number][]).every(
              ([t, req]) => (opponent.typeBonuses[t] ?? 0) >= req - 1
            );
            if (opponentClose) score += 20;
          }
        }
      }
    }
  }

  return score;
}

function bestScoutableTier3(player: PlayerState, game: GameState, focus: EnergyType): PokemonCard | null {
  if (player.scoutedCards.length >= 3) return null;
  const already = new Set(player.scoutedCards.map(c => c.pokedexNumber));
  const candidates = game.board.tier3Face
    .filter(c => !already.has(c.pokedexNumber) && !canAfford(player, c) && c.energyType === focus)
    .sort((a, b) => b.trainerPoints - a.trainerPoints);
  return candidates[0] ?? null;
}

export function getHeuristicMove(game: GameState): GameAction {
  const player = currentPlayer(game);
  const focus = focusType(player, game);

  // 1. Catch Mew if eligible — always worth it
  if (game.board.mew && canCatchMew(player, game.board.mew)) {
    const ball = BALL_ORDER.find(b => (player.pokeballs[b] ?? 0) > 0);
    if (ball) return { type: 'catchMew', ball };
  }

  // 2. Train the best scored affordable card
  const allFace = [
    ...game.board.tier1Face,
    ...game.board.tier2Face,
    ...game.board.tier3Face,
  ];
  const affordable = [...allFace, ...player.scoutedCards].filter(c => canAfford(player, c));
  if (affordable.length > 0) {
    const best = affordable.reduce((top, c) =>
      cardScore(c, player, game, focus) > cardScore(top, player, game, focus) ? c : top
    );
    return { type: 'trainCard', card: best };
  }

  // 3. Scout a high-value Tier 3 card in focus type if one is available
  const scoutTarget = bestScoutableTier3(player, game, focus);
  if (scoutTarget) return { type: 'scoutFaceUp', card: scoutTarget };

  // 4. Take tokens biased toward focus type and types needed for scouted cards
  const neededTypes = new Set<EnergyType>();
  neededTypes.add(focus);
  for (const card of player.scoutedCards) {
    for (const [t, cost] of Object.entries(card.cost) as [EnergyType, number][]) {
      const held = player.energyTokens[t] ?? 0;
      const bonus = player.typeBonuses[t] ?? 0;
      if (held + bonus < cost) neededTypes.add(t);
    }
  }

  const tokens = bestTokenSelection(player, game.board.energySupply, [...neededTypes]);
  if (tokens) return { type: 'takeTokens', tokens };

  // Fallback
  const anyType = ENERGY_TYPES.find(t => game.board.energySupply[t] > 0);
  if (anyType) return { type: 'takeTokens', tokens: { [anyType]: 1 } };
  return { type: 'takeTokens', tokens: { Fire: 1 } };
}
