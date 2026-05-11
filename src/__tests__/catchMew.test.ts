import { useGameStore } from '../store/useGameStore';
import { GameConfig, Legendary, Mythical } from '../types/game';

const TWO_PLAYER: GameConfig = {
  playerNames: ['Alice', 'Bob'],
  deckMode: 'first151',
  passAndPlay: false,
};

const MEW: Mythical = { pokedexNumber: 151, name: 'Mew', trainerPoints: 5, legendariesRequired: 2 };

const ARTICUNO: Legendary = {
  pokedexNumber: 144, name: 'Articuno', trainerPoints: 3, requirements: {},
};
const ZAPDOS: Legendary = {
  pokedexNumber: 145, name: 'Zapdos', trainerPoints: 3, requirements: {},
};
const MEWTWO: Legendary = {
  pokedexNumber: 150, name: 'Mewtwo', trainerPoints: 3, requirements: {},
};

// Gives current player 2 legendaries, 1 of each ball type, and Mew on board
function setupEligible(extraLegendary?: Legendary) {
  const legendaries = extraLegendary
    ? [ARTICUNO, ZAPDOS, extraLegendary]
    : [ARTICUNO, ZAPDOS];

  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, mew: MEW },
      players: s.game!.players.map((p, i) =>
        i === 0
          ? {
              ...p,
              legendaries,
              pokeballs: { Pokeball: 1, GreatBall: 1, UltraBall: 1, MasterBall: 1 },
            }
          : p
      ),
    },
  }));
}

beforeEach(() => {
  useGameStore.setState({ game: null });
  useGameStore.getState().initGame(TWO_PLAYER);
});

// ─── Test 1 ───────────────────────────────────────────────────────────────────
test('successful catch moves Mew to player.mythical, clears board.mew, consumes ball', () => {
  setupEligible();

  // Pokeball = 40% threshold; rng 0.3 < 0.40 → success
  const caught = useGameStore.getState().catchMew('Pokeball', () => 0.3);

  const { game } = useGameStore.getState();
  expect(caught).toBe(true);
  expect(game!.players[0].mythical).toEqual(MEW);
  expect(game!.board.mew).toBeNull();
  expect(game!.players[0].pokeballs.Pokeball).toBe(0);
});

// ─── Test 3 ───────────────────────────────────────────────────────────────────
test('owning Mewtwo adds +10% catch rate (Pokeball 40% → 50%)', () => {
  setupEligible(MEWTWO);

  // Without Mewtwo: Pokeball threshold = 0.40; rng 0.45 → fail
  // With Mewtwo: threshold = 0.50; rng 0.45 < 0.50 → success
  const caught = useGameStore.getState().catchMew('Pokeball', () => 0.45);
  expect(caught).toBe(true);
});

// ─── Test 4 ───────────────────────────────────────────────────────────────────
test('throws when player has fewer than 2 legendaries', () => {
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, mew: MEW },
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, legendaries: [ARTICUNO], pokeballs: { Pokeball: 1 } } : p
      ),
    },
  }));

  expect(() => useGameStore.getState().catchMew('Pokeball', () => 0.1))
    .toThrow('Need ≥2 Legendaries');
});

// ─── Test 5 ───────────────────────────────────────────────────────────────────
test('throws when player has no Pokeball of the chosen tier', () => {
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, mew: MEW },
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, legendaries: [ARTICUNO, ZAPDOS], pokeballs: {} } : p
      ),
    },
  }));

  expect(() => useGameStore.getState().catchMew('GreatBall', () => 0.1))
    .toThrow('No GreatBall available');
});

// ─── Test 6 ───────────────────────────────────────────────────────────────────
test('catchMew reads legendariesRequired from mew state, not a hardcoded value', () => {
  // Mew requiring 3 legendaries — player with only 2 should be blocked
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, mew: { ...MEW, legendariesRequired: 3 } },
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, legendaries: [ARTICUNO, ZAPDOS], pokeballs: { Pokeball: 1 } } : p
      ),
    },
  }));

  expect(() => useGameStore.getState().catchMew('Pokeball', () => 0.1))
    .toThrow('Need ≥3 Legendaries');
});

// ─── Test 2 ───────────────────────────────────────────────────────────────────
test('failed catch consumes ball but leaves Mew on board and player.mythical null', () => {
  setupEligible();

  // Pokeball = 40% threshold; rng 0.5 >= 0.40 → failure
  const caught = useGameStore.getState().catchMew('Pokeball', () => 0.5);

  const { game } = useGameStore.getState();
  expect(caught).toBe(false);
  expect(game!.players[0].mythical).toBeNull();
  expect(game!.board.mew).toEqual(MEW);
  expect(game!.players[0].pokeballs.Pokeball).toBe(0);
});

// ─── Test 7 ───────────────────────────────────────────────────────────────────
test('second player cannot catch Mew after first player already caught it', () => {
  setupEligible();

  // Alice catches Mew (MasterBall always succeeds)
  useGameStore.getState().catchMew('MasterBall', () => 0);
  expect(useGameStore.getState().game!.board.mew).toBeNull();

  // Advance to Bob with enough legendaries and a ball
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      currentPlayerIndex: 1,
      players: s.game!.players.map((p, i) =>
        i === 1
          ? { ...p, legendaries: [ARTICUNO, ZAPDOS], pokeballs: { Pokeball: 1 } }
          : p
      ),
    },
  }));

  expect(() => useGameStore.getState().catchMew('Pokeball', () => 0))
    .toThrow('Mew is not on the board');
});
