import { useGameStore } from '../store/useGameStore';
import { currentPlayer, trainerPoints } from '../store/selectors';
import { GameConfig, PlayerState } from '../types/game';

const TWO_PLAYER: GameConfig = {
  playerNames: ['Alice', 'Bob'],
  deckMode: 'first151', passAndPlay: false,
};

beforeEach(() => {
  useGameStore.setState({ game: null });
});

// ─── Test 1 ───────────────────────────────────────────────────────────────────
test('initGame creates a game with the correct number of players', () => {
  useGameStore.getState().initGame(TWO_PLAYER);
  const { game } = useGameStore.getState();
  expect(game).not.toBeNull();
  expect(game!.players).toHaveLength(2);
  expect(game!.players[0].name).toBe('Alice');
  expect(game!.players[1].name).toBe('Bob');
});

// ─── Test 2 ───────────────────────────────────────────────────────────────────
test('initGame deals 4 face-up cards per tier from the deck', () => {
  useGameStore.getState().initGame(TWO_PLAYER);
  const { board } = useGameStore.getState().game!;

  expect(board.tier1Face).toHaveLength(4);
  expect(board.tier2Face).toHaveLength(4);
  expect(board.tier3Face).toHaveLength(4);

  // Face-up cards must be valid PokemonCards with the right tiers
  board.tier1Face.forEach(c => expect(c.evolutionTier).toBe(1));
  board.tier2Face.forEach(c => expect(c.evolutionTier).toBe(2));
  board.tier3Face.forEach(c => expect(c.evolutionTier).toBe(3));

  // Decks must have had their top 4 removed
  expect(board.tier1Deck.length).toBeGreaterThan(0);
  expect(board.tier2Deck.length).toBeGreaterThan(0);
  expect(board.tier3Deck.length).toBeGreaterThan(0);
});

// ─── Test 3 ───────────────────────────────────────────────────────────────────
test('initGame sets energy supply to 7 per type and 5 Ditto', () => {
  useGameStore.getState().initGame(TWO_PLAYER);
  const { energySupply } = useGameStore.getState().game!.board;

  expect(energySupply.Fire).toBe(7);
  expect(energySupply.Water).toBe(7);
  expect(energySupply.Grass).toBe(7);
  expect(energySupply.Electric).toBe(7);
  expect(energySupply.Psychic).toBe(7);
  expect(energySupply.Ditto).toBe(5);
});

// ─── Test 4 ───────────────────────────────────────────────────────────────────
test('initGame places all 5 legendaries on the board', () => {
  useGameStore.getState().initGame(TWO_PLAYER);
  const { availableLegendaries } = useGameStore.getState().game!.board;
  expect(availableLegendaries).toHaveLength(5);
  const names = availableLegendaries.map(l => l.name);
  expect(names).toContain('Articuno');
  expect(names).toContain('Zapdos');
  expect(names).toContain('Moltres');
  expect(names).toContain('Mewtwo');
  expect(names).toContain('Dragonite');
});

// ─── Test 5 ───────────────────────────────────────────────────────────────────
test('initGame places Mew on the board', () => {
  useGameStore.getState().initGame(TWO_PLAYER);
  const { mew } = useGameStore.getState().game!.board;
  expect(mew).not.toBeNull();
  expect(mew!.name).toBe('Mew');
  expect(mew!.pokedexNumber).toBe(151);
});

// ─── Test 6 ───────────────────────────────────────────────────────────────────
test('initGame gives all players empty hands and zero bonuses', () => {
  useGameStore.getState().initGame(TWO_PLAYER);
  const { players } = useGameStore.getState().game!;
  for (const player of players) {
    expect(Object.keys(player.energyTokens)).toHaveLength(0);
    expect(Object.keys(player.typeBonuses)).toHaveLength(0);
    expect(player.trainedCards).toHaveLength(0);
    expect(player.scoutedCards).toHaveLength(0);
    expect(player.legendaries).toHaveLength(0);
    expect(player.mythical).toBeNull();
    expect(Object.keys(player.pokeballs)).toHaveLength(0);
  }
});

// ─── Test 6b ──────────────────────────────────────────────────────────────────
test('initGame throws for 0 players or more than 4 players', () => {
  expect(() => useGameStore.getState().initGame({ ...TWO_PLAYER, playerNames: [] }))
    .toThrow('at least 1 player');
  expect(() => useGameStore.getState().initGame({ ...TWO_PLAYER, playerNames: ['A', 'B', 'C', 'D', 'E'] }))
    .toThrow('maximum of 4 players');
});

// ─── Test 7 ───────────────────────────────────────────────────────────────────
test('currentPlayer() returns the player at currentPlayerIndex', () => {
  useGameStore.getState().initGame(TWO_PLAYER);
  const game = useGameStore.getState().game!;

  expect(currentPlayer(game).name).toBe('Alice');

  useGameStore.setState({ game: { ...game, currentPlayerIndex: 1 } });
  expect(currentPlayer(useGameStore.getState().game!).name).toBe('Bob');
});

// ─── Test 8 ───────────────────────────────────────────────────────────────────
test('trainerPoints() sums card TP, legendary TP (3 each), and Mew TP (5)', () => {
  const player: PlayerState = {
    id: 'p0', name: 'Alice', isAI: false,
    energyTokens: {}, typeBonuses: {}, scoutedCards: [], pokeballs: {},
    trainedCards: [
      { pokedexNumber: 6, name: 'Charizard', energyType: 'Fire', evolutionTier: 3,
        cost: {}, trainerPoints: 5, typeBonus: 'Fire' },
      { pokedexNumber: 1, name: 'Bulbasaur', energyType: 'Grass', evolutionTier: 1,
        cost: {}, trainerPoints: 0, typeBonus: 'Grass' },
    ],
    legendaries: [
      { pokedexNumber: 146, name: 'Moltres', trainerPoints: 3, requirements: {} },
    ],
    mythical: { pokedexNumber: 151, name: 'Mew', trainerPoints: 5, legendariesRequired: 2 },
  };

  // 5 (Charizard) + 0 (Bulbasaur) + 3 (Moltres) + 5 (Mew) = 13
  expect(trainerPoints(player)).toBe(13);
});

// ─── Test 9 ───────────────────────────────────────────────────────────────────
test('advanceTurn moves to the next player and wraps back to 0', () => {
  useGameStore.getState().initGame(TWO_PLAYER);

  expect(useGameStore.getState().game!.currentPlayerIndex).toBe(0);

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn();
  expect(useGameStore.getState().game!.currentPlayerIndex).toBe(1);

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn(); // wraps to 0
  expect(useGameStore.getState().game!.currentPlayerIndex).toBe(0);
});

// ─── Test 10 ──────────────────────────────────────────────────────────────────
test('advanceTurn throws if no action was taken this turn', () => {
  useGameStore.getState().initGame(TWO_PLAYER);
  expect(() => useGameStore.getState().advanceTurn()).toThrow('Must take an action before ending turn');
});
