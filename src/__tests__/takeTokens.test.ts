import { useGameStore } from '../store/useGameStore';
import { GameConfig } from '../types/game';

const TWO_PLAYER: GameConfig = {
  playerNames: ['Alice', 'Bob'],
  aiFlags: [false, false],
  deckMode: 'first151', passAndPlay: false,
};

beforeEach(() => {
  useGameStore.setState({ game: null });
  useGameStore.getState().initGame(TWO_PLAYER);
});

// ─── Test 1 ───────────────────────────────────────────────────────────────────
test('taking 3 different types gives player 1 of each and removes from supply', () => {
  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  const { game } = useGameStore.getState();
  const player = game!.players[0];
  const supply = game!.board.energySupply;

  expect(player.energyTokens.Fire).toBe(1);
  expect(player.energyTokens.Water).toBe(1);
  expect(player.energyTokens.Grass).toBe(1);
  expect(supply.Fire).toBe(6);
  expect(supply.Water).toBe(6);
  expect(supply.Grass).toBe(6);
});

// ─── Test 2 ───────────────────────────────────────────────────────────────────
test('taking 2 of the same type gives player 2 and removes 2 from supply', () => {
  useGameStore.getState().takeTokens({ Electric: 2 });
  const { game } = useGameStore.getState();
  expect(game!.players[0].energyTokens.Electric).toBe(2);
  expect(game!.board.energySupply.Electric).toBe(5);
});

// ─── Test 3 ───────────────────────────────────────────────────────────────────
test('takeTokens throws on invalid selection patterns', () => {
  const { takeTokens } = useGameStore.getState();
  // 3 of same type
  expect(() => takeTokens({ Fire: 3 })).toThrow();
  // mixed 2+1
  expect(() => takeTokens({ Fire: 2, Water: 1 })).toThrow();
  // 4 tokens
  expect(() => takeTokens({ Fire: 1, Water: 1, Grass: 1, Electric: 1 })).toThrow();
  // 1 token only
  expect(() => takeTokens({ Fire: 1 })).toThrow();
});

// ─── Test 4 ───────────────────────────────────────────────────────────────────
test('takeTokens throws when taking 2 same but supply has fewer than 4', () => {
  // Drain Fire supply down to 3
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, energySupply: { ...s.game!.board.energySupply, Fire: 3 } },
    },
  }));
  expect(() => useGameStore.getState().takeTokens({ Fire: 2 })).toThrow();
});

// ─── Test 5 ───────────────────────────────────────────────────────────────────
test('takeTokens throws when a selected type has 0 in supply', () => {
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, energySupply: { ...s.game!.board.energySupply, Water: 0 } },
    },
  }));
  expect(() => useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 })).toThrow();
});

// ─── Test 6 ───────────────────────────────────────────────────────────────────
test('discardTokens moves tokens from player hand back to supply', () => {
  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().discardTokens({ Fire: 1 });
  const { game } = useGameStore.getState();
  expect(game!.players[0].energyTokens.Fire).toBe(0);
  expect(game!.board.energySupply.Fire).toBe(7);
});

// ─── Test 7 ───────────────────────────────────────────────────────────────────
test('after taking pushes player past 10, discardTokens brings them back to ≤10', () => {
  // Give Alice 9 tokens manually
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0
          ? { ...p, energyTokens: { Fire: 3, Water: 3, Grass: 3 } }
          : p
      ),
    },
  }));

  // Taking 3 more brings her to 12
  useGameStore.getState().takeTokens({ Electric: 1, Psychic: 1, Fire: 1 });
  const afterTake = useGameStore.getState().game!.players[0].energyTokens;
  const total = Object.values(afterTake).reduce((s, n) => s + n, 0);
  expect(total).toBe(12);

  // Discard 2 to get back to 10
  useGameStore.getState().discardTokens({ Fire: 1, Water: 1 });
  const afterDiscard = useGameStore.getState().game!.players[0].energyTokens;
  const totalAfter = Object.values(afterDiscard).reduce((s, n) => s + n, 0);
  expect(totalAfter).toBe(10);
});
