import { DeckMode, EnergyType, EvolutionTier, GameState, Legendary, PlayerState, PokemonCard, BoardState, TokenType } from '../types/game';
import { MAX_TOKENS, PHASE } from '../constants';
import first151Data from '../data/first-151.json';

export function totalTokens(energyTokens: Partial<Record<TokenType, number>>): number {
  return Object.values(energyTokens).reduce<number>((s, n) => s + (n ?? 0), 0);
}

export function claimLegendaries(
  typeBonuses: Partial<Record<EnergyType, number>>,
  available: Legendary[],
): Legendary[] {
  return available.filter(leg =>
    (Object.entries(leg.requirements) as [EnergyType, number][]).every(
      ([type, required]) => (typeBonuses[type] ?? 0) >= required
    )
  );
}

export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildDecks(deckMode: DeckMode) {
  // Phase 1: only first151 mode; balanced mode reuses same data until #16 ships
  const allCards = first151Data.cards as PokemonCard[];
  const tier1 = shuffle(allCards.filter(c => c.evolutionTier === 1));
  const tier2 = shuffle(allCards.filter(c => c.evolutionTier === 2));
  const tier3 = shuffle(allCards.filter(c => c.evolutionTier === 3));
  return { tier1, tier2, tier3 };
}

export function makePlayer(name: string, index: number): PlayerState {
  return {
    id: `player-${index}`,
    name,
    isAI: false,
    energyTokens: {},
    typeBonuses: {},
    trainedCards: [],
    scoutedCards: [],
    legendaries: [],
    mythical: null,
    pokeballs: {},
  };
}

export function tierFaceKey(tier: EvolutionTier): 'tier1Face' | 'tier2Face' | 'tier3Face' {
  return (['tier1Face', 'tier2Face', 'tier3Face'] as const)[tier - 1];
}

export function tierDeckKey(tier: EvolutionTier): 'tier1Deck' | 'tier2Deck' | 'tier3Deck' {
  return (['tier1Deck', 'tier2Deck', 'tier3Deck'] as const)[tier - 1];
}

// updatedBoard should already have face/deck mutations applied; this function adds the player scout + Ditto grant.
export function applyScout(
  game: GameState,
  playerIdx: number,
  card: PokemonCard,
  updatedBoard: BoardState,
): GameState {
  const player = game.players[playerIdx];
  const playerWithScout = { ...player, scoutedCards: [...player.scoutedCards, card] };

  const boardDittoSupply = updatedBoard.energySupply.Ditto ?? 0;
  const dittoGain = boardDittoSupply > 0 ? 1 : 0;
  const newPlayer = {
    ...playerWithScout,
    energyTokens: {
      ...playerWithScout.energyTokens,
      Ditto: (playerWithScout.energyTokens.Ditto ?? 0) + dittoGain,
    },
  };

  const newPhase = totalTokens(newPlayer.energyTokens) > MAX_TOKENS ? PHASE.DISCARDING : game.phase;

  return {
    ...game,
    phase: newPhase,
    actionTakenThisTurn: true,
    players: game.players.map((p, i) => i === playerIdx ? newPlayer : p),
    board: { ...updatedBoard, energySupply: { ...updatedBoard.energySupply, Ditto: boardDittoSupply - dittoGain } },
  };
}
