import { useGameStore } from '../store/useGameStore';
import { GameConfig, Legendary, PokemonCard } from '../types/game';
import { putCardInFace } from './helpers';

const TWO_PLAYER: GameConfig = {
  playerNames: ['Alice', 'Bob'],
  deckMode: 'first151',
  passAndPlay: false,
};

// Articuno requires Water: 4, Psychic: 3 (pokedex 144 — lowest of the trio)
const ARTICUNO: Legendary = {
  pokedexNumber: 144, name: 'Articuno', trainerPoints: 3,
  requirements: { Water: 4, Psychic: 3 },
};

// Zapdos requires Electric: 4, Fire: 3
const ZAPDOS: Legendary = {
  pokedexNumber: 145, name: 'Zapdos', trainerPoints: 3,
  requirements: { Electric: 4, Fire: 3 },
};

// Moltres requires Fire: 4, Grass: 3
const MOLTRES: Legendary = {
  pokedexNumber: 146, name: 'Moltres', trainerPoints: 3,
  requirements: { Fire: 4, Grass: 3 },
};

// A Fire Tier 1 card (adds 1 Fire typeBonus)
const CHARMANDER: PokemonCard = {
  pokedexNumber: 4, name: 'Charmander', energyType: 'Fire',
  evolutionTier: 1, cost: { Fire: 2 }, trainerPoints: 0, typeBonus: 'Fire',
};

function setTypeBonuses(bonuses: Partial<Record<string, number>>, playerIndex = 0) {
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === playerIndex ? { ...p, typeBonuses: bonuses } : p
      ),
    },
  }));
}

// End-of-turn claim is gated on an action having been taken; mark one without
// running a real action so each test can pin typeBonuses directly.
function markActionTaken() {
  useGameStore.setState((s) => ({ game: { ...s.game!, actionTakenThisTurn: true } }));
}

function setBoardLegendaries(legendaries: Legendary[]) {
  useGameStore.setState((s) => ({
    game: { ...s.game!, board: { ...s.game!.board, availableLegendaries: legendaries } },
  }));
}

beforeEach(() => {
  useGameStore.setState({ game: null });
  useGameStore.getState().initGame(TWO_PLAYER);
  setBoardLegendaries([ZAPDOS]); // predictable default; tests override as needed
});

// ─── trainCard no longer claims ─────────────────────────────────────────────
test('trainCard does NOT claim a Legendary even when requirements are met', () => {
  // Alice meets Zapdos the instant Charmander pushes Fire 2→3
  setTypeBonuses({ Electric: 4, Fire: 2 });
  putCardInFace(CHARMANDER);
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, energyTokens: { Fire: 5 } } : p
      ),
    },
  }));

  useGameStore.getState().trainCard(CHARMANDER);

  // Claim is deferred to end of turn — nothing happens mid-action.
  expect(useGameStore.getState().game!.players[0].legendaries).toHaveLength(0);
  expect(useGameStore.getState().game!.board.availableLegendaries).toHaveLength(1);
});

// ─── single eligible claimed at end of turn ─────────────────────────────────
test('a single newly-eligible Legendary is claimed at end of turn', () => {
  setTypeBonuses({ Electric: 4, Fire: 3 }); // meets Zapdos
  markActionTaken();

  useGameStore.getState().advanceTurn();

  const alice = useGameStore.getState().game!.players[0];
  expect(alice.legendaries.map(l => l.name)).toEqual(['Zapdos']);
  expect(alice.pokeballs.MasterBall).toBe(1); // first Legendary → MasterBall
  expect(useGameStore.getState().game!.board.availableLegendaries).toHaveLength(0);
  expect(useGameStore.getState().game!.board.firstLegendaryClaimed).toBe(true);
});

// ─── at most one per turn; the rest carry over ──────────────────────────────
test('at most one Legendary is claimed per turn; the rest carry over', () => {
  setBoardLegendaries([ZAPDOS, MOLTRES]);
  setTypeBonuses({ Electric: 4, Fire: 4, Grass: 3 }); // meets BOTH Zapdos and Moltres
  markActionTaken();

  useGameStore.getState().advanceTurn();

  // Only one claimed this turn; the other stays available and eligible.
  expect(useGameStore.getState().game!.players[0].legendaries).toHaveLength(1);
  expect(useGameStore.getState().game!.board.availableLegendaries).toHaveLength(1);
});

// ─── 2+ eligible resolves deterministically by lowest Pokédex # ─────────────
test('when 2+ are eligible, the lowest Pokédex number is claimed first', () => {
  setBoardLegendaries([ZAPDOS, ARTICUNO]); // 145 vs 144
  setTypeBonuses({ Electric: 4, Fire: 3, Water: 4, Psychic: 3 }); // meets both
  markActionTaken();

  useGameStore.getState().advanceTurn();

  expect(useGameStore.getState().game!.players[0].legendaries.map(l => l.name))
    .toEqual(['Articuno']); // 144 < 145
  expect(useGameStore.getState().game!.board.availableLegendaries.map(l => l.name))
    .toEqual(['Zapdos']);
});

// ─── carry-over claimed on a later turn ─────────────────────────────────────
test('a carried-over eligible Legendary is claimed on a later turn', () => {
  setBoardLegendaries([ARTICUNO, ZAPDOS]);
  setTypeBonuses({ Electric: 4, Fire: 3, Water: 4, Psychic: 3 }); // meets both
  markActionTaken();

  useGameStore.getState().advanceTurn(); // claims Articuno (144)

  // Back to Alice's turn; Zapdos is still eligible and gets claimed.
  useGameStore.setState((s) => ({
    game: { ...s.game!, currentPlayerIndex: 0, actionTakenThisTurn: true },
  }));
  useGameStore.getState().advanceTurn();

  expect(useGameStore.getState().game!.players[0].legendaries.map(l => l.name))
    .toEqual(['Articuno', 'Zapdos']);
  expect(useGameStore.getState().game!.board.availableLegendaries).toHaveLength(0);
});

// ─── Legendary TP counts toward the final-round trigger ─────────────────────
test('Legendary TP counts before the final-round trigger is evaluated', () => {
  // Alice sits at 18 TP from trained cards (threshold is 20). The Legendary's
  // +3 TP must be counted at end of turn to tip her over and trigger final round.
  setTypeBonuses({ Electric: 4, Fire: 3 }); // meets Zapdos (3 TP)
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      actionTakenThisTurn: true,
      players: s.game!.players.map((p, i) =>
        i === 0
          ? { ...p, trainedCards: [{ ...CHARMANDER, pokedexNumber: 999, trainerPoints: 18 }] }
          : p
      ),
    },
  }));

  useGameStore.getState().advanceTurn();

  expect(useGameStore.getState().game!.phase).toBe('finalRound');
  expect(useGameStore.getState().game!.finalRoundTriggerPlayerIndex).toBe(0);
});

// ─── MasterBall-for-first preserved across players ──────────────────────────
test('only the first Legendary ever claimed grants a MasterBall', () => {
  // Alice claims first → MasterBall
  setTypeBonuses({ Electric: 4, Fire: 3 });
  markActionTaken();
  useGameStore.getState().advanceTurn();
  expect(useGameStore.getState().game!.players[0].pokeballs.MasterBall).toBe(1);

  // Bob claims Moltres on his turn → no MasterBall (already claimed)
  setBoardLegendaries([MOLTRES]);
  setTypeBonuses({ Fire: 4, Grass: 3 }, 1);
  useGameStore.setState((s) => ({
    game: { ...s.game!, currentPlayerIndex: 1, actionTakenThisTurn: true },
  }));
  useGameStore.getState().advanceTurn();

  expect(useGameStore.getState().game!.players[1].legendaries).toHaveLength(1);
  expect(useGameStore.getState().game!.players[1].pokeballs.MasterBall).toBeUndefined();
});
