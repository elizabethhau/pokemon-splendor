import { useGameStore } from '../store/useGameStore';
import { GameConfig, PokemonCard } from '../types/game';

const TWO_PLAYER: GameConfig = {
  playerNames: ['Alice', 'Bob'],
  deckMode: 'first151',
  passAndPlay: false,
};

const TWO_PLAYER_PNP: GameConfig = { ...TWO_PLAYER, passAndPlay: true };

const BULBASAUR: PokemonCard = {
  pokedexNumber: 1, name: 'Bulbasaur', energyType: 'Grass',
  evolutionTier: 1, cost: { Grass: 2 }, trainerPoints: 0, typeBonus: 'Grass',
};

// A high-value card to push a player to ≥20 TP quickly
const HIGH_TP_CARD = (tp: number): PokemonCard => ({
  pokedexNumber: 999, name: 'HighTP', energyType: 'Fire',
  evolutionTier: 1, cost: {}, trainerPoints: tp, typeBonus: 'Fire',
});

function givePlayerTokens(tokens: Partial<Record<string, number>>, playerIndex = 0) {
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === playerIndex ? { ...p, energyTokens: tokens } : p
      ),
    },
  }));
}

beforeEach(() => {
  useGameStore.setState({ game: null });
  useGameStore.getState().initGame(TWO_PLAYER);
});

// ─── Test 1 ───────────────────────────────────────────────────────────────────
test('complete turn: takeTokens then advanceTurn moves to next player and increments turnNumber', () => {
  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn();

  const { game } = useGameStore.getState();
  expect(game!.currentPlayerIndex).toBe(1);
  expect(game!.turnNumber).toBe(2);
  expect(game!.phase).toBe('playing');
});

// ─── Test 2 ───────────────────────────────────────────────────────────────────
test('taking tokens that push player >10 enters discarding phase; advanceTurn throws', () => {
  // Give Alice 9 tokens, then take 3 more → 12 total
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, energyTokens: { Fire: 3, Water: 3, Grass: 3 } } : p
      ),
    },
  }));

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });

  expect(useGameStore.getState().game!.phase).toBe('discarding');
  expect(() => useGameStore.getState().advanceTurn()).toThrow();
});

// ─── Test 3 ───────────────────────────────────────────────────────────────────
test('discardTokens that brings player to ≤10 exits discarding; advanceTurn then proceeds', () => {
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, energyTokens: { Fire: 3, Water: 3, Grass: 3 } } : p
      ),
    },
  }));

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 }); // → 12 tokens, 'discarding'
  useGameStore.getState().discardTokens({ Fire: 1, Water: 1 });          // → 10 tokens, 'playing'

  expect(useGameStore.getState().game!.phase).toBe('playing');
  useGameStore.getState().advanceTurn(); // should not throw
  expect(useGameStore.getState().game!.currentPlayerIndex).toBe(1);
});

// ─── Test 4 ───────────────────────────────────────────────────────────────────
test('pass-and-play: advanceTurn sets pendingHandoff; actions blocked; acknowledgeHandoff clears it', () => {
  useGameStore.getState().initGame(TWO_PLAYER_PNP);

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn();

  expect(useGameStore.getState().game!.pendingHandoff).toBe(true);
  expect(() => useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 })).toThrow();

  useGameStore.getState().acknowledgeHandoff();
  expect(useGameStore.getState().game!.pendingHandoff).toBe(false);

  // Bob can now act
  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  expect(useGameStore.getState().game!.players[1].energyTokens.Fire).toBe(1);
});

// ─── Test 5 ───────────────────────────────────────────────────────────────────
test('advanceTurn when previous player has ≥20 TP triggers finalRound', () => {
  // Give Alice 20 TP via trained cards
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, trainedCards: [HIGH_TP_CARD(20)] } : p
      ),
    },
  }));

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn();

  const { game } = useGameStore.getState();
  expect(game!.phase).toBe('finalRound');
  expect(game!.finalRoundTriggerPlayerIndex).toBe(0);
  expect(game!.currentPlayerIndex).toBe(1);
});

// ─── Test 6 ───────────────────────────────────────────────────────────────────
test('all players completing Final Round turns transitions to gameOver', () => {
  // Alice hits 20 TP → finalRound triggered at index 0
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, trainedCards: [HIGH_TP_CARD(20)] } : p
      ),
    },
  }));

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn(); // → Bob's Final Round turn (index 1), phase=finalRound

  // Bob takes his Final Round turn
  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn(); // → would wrap to Alice (index 0) = trigger → gameOver

  expect(useGameStore.getState().game!.phase).toBe('gameOver');
});

// ─── Test 7 ───────────────────────────────────────────────────────────────────
test('actions throw when phase is gameOver', () => {
  useGameStore.setState((s) => ({
    game: { ...s.game!, phase: 'gameOver' },
  }));

  expect(() => useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 })).toThrow();
  expect(() => useGameStore.getState().scoutFromDeck(1)).toThrow();
  expect(() => useGameStore.getState().advanceTurn()).toThrow();
});

// ─── Test 8 ───────────────────────────────────────────────────────────────────
test('3-player final round: all remaining players complete their turns before gameOver', () => {
  const THREE_PLAYER: GameConfig = {
    playerNames: ['Alice', 'Bob', 'Carol'],
    deckMode: 'first151',
    passAndPlay: false,
  };
  useGameStore.getState().initGame(THREE_PLAYER);

  // Alice hits ≥20 TP
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, trainedCards: [HIGH_TP_CARD(20)] } : p
      ),
    },
  }));

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn(); // → Bob; finalRound starts

  expect(useGameStore.getState().game!.phase).toBe('finalRound');
  expect(useGameStore.getState().game!.currentPlayerIndex).toBe(1);

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn(); // → Carol; still finalRound

  expect(useGameStore.getState().game!.phase).toBe('finalRound');
  expect(useGameStore.getState().game!.currentPlayerIndex).toBe(2);

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn(); // → wraps to Alice (trigger) → gameOver

  expect(useGameStore.getState().game!.phase).toBe('gameOver');
});

// ─── Test 10 ──────────────────────────────────────────────────────────────────
test('discarding during finalRound restores finalRound phase, not playing', () => {
  // Alice hits 20 TP → triggers finalRound
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, trainedCards: [HIGH_TP_CARD(20)] } : p
      ),
    },
  }));
  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn(); // → Bob, phase=finalRound

  // Give Bob 9 tokens so his next take pushes to 12 → discarding
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 1 ? { ...p, energyTokens: { Fire: 3, Water: 3, Grass: 3 } } : p
      ),
    },
  }));
  useGameStore.getState().takeTokens({ Electric: 1, Psychic: 1, Fire: 1 }); // 12 tokens → discarding

  expect(useGameStore.getState().game!.phase).toBe('discarding');

  useGameStore.getState().discardTokens({ Electric: 1, Psychic: 1 }); // back to 10

  // Must restore to finalRound, not playing — otherwise advanceTurn never reaches gameOver
  expect(useGameStore.getState().game!.phase).toBe('finalRound');

  useGameStore.getState().advanceTurn(); // → wraps to Alice (trigger) → gameOver
  expect(useGameStore.getState().game!.phase).toBe('gameOver');
});

// ─── Test 9 ───────────────────────────────────────────────────────────────────
test('4-player final round: all three remaining players complete turns before gameOver', () => {
  const FOUR_PLAYER: GameConfig = {
    playerNames: ['Alice', 'Bob', 'Carol', 'Dave'],
    deckMode: 'first151',
    passAndPlay: false,
  };
  useGameStore.getState().initGame(FOUR_PLAYER);

  // Alice hits ≥20 TP
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, trainedCards: [HIGH_TP_CARD(20)] } : p
      ),
    },
  }));

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn(); // → Bob; finalRound

  expect(useGameStore.getState().game!.phase).toBe('finalRound');
  expect(useGameStore.getState().game!.currentPlayerIndex).toBe(1);

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn(); // → Carol

  expect(useGameStore.getState().game!.phase).toBe('finalRound');
  expect(useGameStore.getState().game!.currentPlayerIndex).toBe(2);

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn(); // → Dave

  expect(useGameStore.getState().game!.phase).toBe('finalRound');
  expect(useGameStore.getState().game!.currentPlayerIndex).toBe(3);

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn(); // → wraps to Alice (trigger) → gameOver

  expect(useGameStore.getState().game!.phase).toBe('gameOver');
});
