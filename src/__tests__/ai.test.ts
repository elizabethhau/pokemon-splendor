import { useGameStore } from '../store/useGameStore';
import { GameConfig, Legendary, PokemonCard } from '../types/game';
import { getGreedyMove } from '../ai/greedy';
import { getHeuristicMove } from '../ai/heuristic';
import { getAIDiscard, bestTokenSelection, bestAffordableCard } from '../ai/utils';
import { givePlayerTokens, putCardInFace } from './helpers';

// ── Shared fixtures ──────────────────────────────────────────────────────────

const VS_AI: GameConfig = {
  playerNames: ['Alice', 'Rival (Easy)'],
  deckMode: 'first151',
  passAndPlay: false,
  aiPlayerIndices: [1],
  aiDifficulty: 'greedy',
};

// Affordable Tier 1 card with 2 TP
const BULBASAUR: PokemonCard = {
  pokedexNumber: 1, name: 'Bulbasaur', energyType: 'Grass',
  evolutionTier: 1, cost: { Grass: 1 }, trainerPoints: 2, typeBonus: 'Grass',
};

// Higher-TP Tier 2 card
const IVYSAUR: PokemonCard = {
  pokedexNumber: 2, name: 'Ivysaur', energyType: 'Grass',
  evolutionTier: 2, cost: { Grass: 3 }, trainerPoints: 4, typeBonus: 'Grass',
};

// Tier 3 card — high TP, expensive
const VENUSAUR: PokemonCard = {
  pokedexNumber: 3, name: 'Venusaur', energyType: 'Grass',
  evolutionTier: 3, cost: { Grass: 7 }, trainerPoints: 6, typeBonus: 'Grass',
};

// Free card (no cost)
const EEVEE: PokemonCard = {
  pokedexNumber: 133, name: 'Eevee', energyType: 'Fire',
  evolutionTier: 1, cost: {}, trainerPoints: 0, typeBonus: null,
};

const ZAPDOS: Legendary = {
  pokedexNumber: 145, name: 'Zapdos', trainerPoints: 3,
  requirements: { Electric: 4, Fire: 3 },
};

function setAIPlayer(overrides: Partial<import('../types/game').PlayerState>) {
  useGameStore.setState(s => ({
    game: {
      ...s.game!,
      currentPlayerIndex: 1,
      actionTakenThisTurn: false,
      players: s.game!.players.map((p, i) =>
        i === 1 ? { ...p, ...overrides } : p
      ),
    },
  }));
}

function currentGame() {
  return useGameStore.getState().game!;
}

beforeEach(() => {
  useGameStore.setState({ game: null });
  useGameStore.getState().initGame(VS_AI);
});

// ── getAIDiscard ─────────────────────────────────────────────────────────────

test('getAIDiscard returns empty when at or under MAX_TOKENS', () => {
  const player = currentGame().players[0];
  // Give player exactly 10 tokens
  useGameStore.setState(s => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, energyTokens: { Fire: 4, Water: 3, Grass: 3 } } : p
      ),
    },
  }));
  const p = currentGame().players[0];
  expect(getAIDiscard(p)).toEqual({});
});

test('getAIDiscard discards excess from most-held types first', () => {
  useGameStore.setState(s => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, energyTokens: { Fire: 6, Water: 5, Grass: 2 } } : p
      ),
    },
  }));
  const p = currentGame().players[0];
  // Holds 13, must discard 3. Most held = Fire(6), then Water(5)
  const discard = getAIDiscard(p);
  const total = Object.values(discard).reduce((s, n) => s + (n ?? 0), 0);
  expect(total).toBe(3);
  // Fire should be discarded first (highest count)
  expect((discard.Fire ?? 0)).toBeGreaterThan(0);
});

// ── bestTokenSelection ───────────────────────────────────────────────────────

test('bestTokenSelection picks 3 different types when available', () => {
  const supply = { Fire: 7, Water: 7, Grass: 7, Electric: 7, Psychic: 7, Ditto: 5 };
  const player = currentGame().players[0];
  const result = bestTokenSelection(player, supply);
  expect(result).not.toBeNull();
  const total = Object.values(result!).reduce((s, n) => s + (n ?? 0), 0);
  expect(total).toBe(3);
  expect(Object.keys(result!)).toHaveLength(3);
});

test('bestTokenSelection picks preferred types first', () => {
  const supply = { Fire: 7, Water: 7, Grass: 7, Electric: 7, Psychic: 7, Ditto: 5 };
  const player = currentGame().players[0];
  const result = bestTokenSelection(player, supply, ['Electric', 'Psychic']);
  expect(result).not.toBeNull();
  expect(result!.Electric).toBe(1);
  expect(result!.Psychic).toBe(1);
});

test('bestTokenSelection returns 2-same when only 1 type has enough supply', () => {
  const supply = { Fire: 4, Water: 0, Grass: 0, Electric: 0, Psychic: 0, Ditto: 0 };
  const player = currentGame().players[0];
  const result = bestTokenSelection(player, supply);
  expect(result).toEqual({ Fire: 2 });
});

test('bestTokenSelection returns null when no supply', () => {
  const supply = { Fire: 0, Water: 0, Grass: 0, Electric: 0, Psychic: 0, Ditto: 0 };
  const player = currentGame().players[0];
  expect(bestTokenSelection(player, supply)).toBeNull();
});

// ── bestAffordableCard ───────────────────────────────────────────────────────

test('bestAffordableCard returns highest-TP affordable card', () => {
  putCardInFace(BULBASAUR);
  putCardInFace(IVYSAUR);
  givePlayerTokens({ Grass: 5 });
  const game = currentGame();
  const player = game.players[0];
  const card = bestAffordableCard(player, game);
  expect(card?.pokedexNumber).toBe(IVYSAUR.pokedexNumber);
});

test('bestAffordableCard returns null when nothing affordable', () => {
  putCardInFace(VENUSAUR);
  givePlayerTokens({ Grass: 1 }); // needs 7
  const game = currentGame();
  const player = game.players[0];
  expect(bestAffordableCard(player, game)).toBeNull();
});

test('bestAffordableCard respects typeFilter', () => {
  putCardInFace(BULBASAUR); // Grass
  putCardInFace(EEVEE);     // Fire, free
  givePlayerTokens({ Grass: 5 });
  const game = currentGame();
  const player = game.players[0];
  const card = bestAffordableCard(player, game, 'Grass');
  expect(card?.energyType).toBe('Grass');
});

// ── Greedy AI ────────────────────────────────────────────────────────────────

test('greedy AI trains highest-TP affordable card over taking tokens', () => {
  putCardInFace(BULBASAUR);
  putCardInFace(IVYSAUR);
  setAIPlayer({ energyTokens: { Grass: 5 } });

  const action = getGreedyMove(currentGame());
  expect(action.type).toBe('trainCard');
  if (action.type === 'trainCard') {
    expect(action.card.pokedexNumber).toBe(IVYSAUR.pokedexNumber);
  }
});

test('greedy AI takes tokens when no affordable card', () => {
  useGameStore.setState(s => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, tier1Face: [], tier2Face: [], tier3Face: [VENUSAUR] },
    },
  }));
  setAIPlayer({ energyTokens: {} });

  const action = getGreedyMove(currentGame());
  expect(action.type).toBe('takeTokens');
});

test('greedy AI takes 3 different tokens when supply allows', () => {
  // Only VENUSAUR (costs 7 Grass) — nothing affordable with empty tokens
  useGameStore.setState(s => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, tier1Face: [], tier2Face: [], tier3Face: [VENUSAUR] },
    },
  }));
  setAIPlayer({ energyTokens: {} });

  const action = getGreedyMove(currentGame());
  expect(action.type).toBe('takeTokens');
  if (action.type === 'takeTokens') {
    const total = Object.values(action.tokens).reduce((s, n) => s + (n ?? 0), 0);
    expect(total).toBe(3);
  }
});

test('greedy AI catches Mew when eligible, using best ball', () => {
  const mew = currentGame().board.mew!;
  // Give AI 2 legendaries (meets requirement) + an UltraBall
  setAIPlayer({
    legendaries: [
      { pokedexNumber: 144, name: 'Articuno', trainerPoints: 3, requirements: {} },
      { pokedexNumber: 145, name: 'Zapdos', trainerPoints: 3, requirements: {} },
    ],
    pokeballs: { Pokeball: 1, UltraBall: 1 },
  });

  const action = getGreedyMove(currentGame());
  expect(action.type).toBe('catchMew');
  if (action.type === 'catchMew') {
    // Should prefer UltraBall over Pokeball
    expect(action.ball).toBe('UltraBall');
  }
});

test('greedy AI prefers Mew catch over training a card', () => {
  putCardInFace(BULBASAUR);
  setAIPlayer({
    energyTokens: { Grass: 5 },
    legendaries: [
      { pokedexNumber: 144, name: 'Articuno', trainerPoints: 3, requirements: {} },
      { pokedexNumber: 145, name: 'Zapdos', trainerPoints: 3, requirements: {} },
    ],
    pokeballs: { MasterBall: 1 },
  });

  const action = getGreedyMove(currentGame());
  expect(action.type).toBe('catchMew');
});

// ── Heuristic AI ─────────────────────────────────────────────────────────────

test('heuristic AI prefers cards in focus type when both are affordable', () => {
  // AI has Grass bonus (focus = Grass). Two affordable cards: one Grass, one Fire.
  const CHARMANDER: PokemonCard = {
    pokedexNumber: 4, name: 'Charmander', energyType: 'Fire',
    evolutionTier: 1, cost: {}, trainerPoints: 2, typeBonus: 'Fire',
  };
  putCardInFace(EEVEE);       // Fire, free, 0 TP
  putCardInFace(BULBASAUR);   // Grass, costs Grass:1, 2 TP
  putCardInFace(CHARMANDER);  // Fire, free, 2 TP — same TP as Bulbasaur but not focus type

  setAIPlayer({
    energyTokens: { Grass: 5 },
    typeBonuses: { Grass: 2 }, // Grass is focus
  });

  const action = getHeuristicMove(currentGame());
  expect(action.type).toBe('trainCard');
  if (action.type === 'trainCard') {
    expect(action.card.energyType).toBe('Grass');
  }
});

test('heuristic AI scouts a Tier 3 focus-type card when nothing is affordable', () => {
  // Only VENUSAUR on the board — no tokens means nothing is affordable
  useGameStore.setState(s => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, tier1Face: [], tier2Face: [], tier3Face: [VENUSAUR] },
    },
  }));
  setAIPlayer({ energyTokens: {}, typeBonuses: {}, scoutedCards: [] });

  const action = getHeuristicMove(currentGame());
  expect(action.type).toBe('scoutFaceUp');
  if (action.type === 'scoutFaceUp') {
    expect(action.card.evolutionTier).toBe(3);
  }
});

test('heuristic AI does not scout when hand is full', () => {
  // Clear face cards so only VENUSAUR (unaffordable) is on the board
  useGameStore.setState(s => ({
    game: {
      ...s.game!,
      board: {
        ...s.game!.board,
        tier1Face: [], tier2Face: [], tier3Face: [VENUSAUR],
      },
    },
  }));

  const EXPENSIVE: PokemonCard = {
    pokedexNumber: 99, name: 'Expensive', energyType: 'Grass',
    evolutionTier: 2, cost: { Grass: 6 }, trainerPoints: 3, typeBonus: 'Grass',
  };
  setAIPlayer({
    energyTokens: {},
    typeBonuses: {},
    scoutedCards: [BULBASAUR, IVYSAUR, EXPENSIVE], // 3 = hand limit, none affordable
  });

  const action = getHeuristicMove(currentGame());
  // Can't scout (hand full), can't afford anything → take tokens
  expect(action.type).toBe('takeTokens');
});

test('heuristic AI boosts score for legendary-claiming card', () => {
  // AI is 1 Electric bonus away from claiming Zapdos (needs Electric:4, Fire:3)
  // Two affordable cards: Charmander (Fire, 2 TP, would claim Zapdos) vs Eevee (Fire, 0 TP)
  useGameStore.setState(s => ({
    game: { ...s.game!, board: { ...s.game!.board, availableLegendaries: [ZAPDOS] } },
  }));

  const CHARMANDER: PokemonCard = {
    pokedexNumber: 4, name: 'Charmander', energyType: 'Fire',
    evolutionTier: 1, cost: {}, trainerPoints: 0, typeBonus: 'Fire',
  };
  putCardInFace(CHARMANDER);
  putCardInFace(EEVEE);

  // Has Electric:4, Fire:2 — one more Fire typeBonus (from Charmander) completes Zapdos
  setAIPlayer({
    energyTokens: {},
    typeBonuses: { Electric: 4, Fire: 2 },
  });

  const action = getHeuristicMove(currentGame());
  expect(action.type).toBe('trainCard');
  if (action.type === 'trainCard') {
    // Should pick Charmander (legendary claim) over Eevee (no benefit)
    expect(action.card.pokedexNumber).toBe(CHARMANDER.pokedexNumber);
  }
});

test('heuristic AI biases token selection toward focus type', () => {
  // Nothing affordable; AI has Grass focus
  putCardInFace(VENUSAUR);
  setAIPlayer({
    energyTokens: {},
    typeBonuses: { Grass: 1 },
    scoutedCards: [],
  });

  // Clear all face cards so no training or scouting option
  useGameStore.setState(s => ({
    game: { ...s.game!, board: { ...s.game!.board, tier1Face: [], tier2Face: [], tier3Face: [] } },
  }));

  const action = getHeuristicMove(currentGame());
  expect(action.type).toBe('takeTokens');
  if (action.type === 'takeTokens') {
    // Grass should be among selected tokens
    expect((action.tokens as Record<string, number>).Grass).toBeDefined();
  }
});
