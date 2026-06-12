import { useGameStore } from '../store/useGameStore';
import { GameConfig, PokemonCard } from '../types/game';

const TWO_PLAYER: GameConfig = {
  playerNames: ['Alice', 'Bob'],
  deckMode: 'first151', passAndPlay: false,
};

// Free card (no cost) — affordable even with zero tokens
const EEVEE: PokemonCard = {
  pokedexNumber: 133, name: 'Eevee', energyType: 'Fire',
  evolutionTier: 1, cost: {}, trainerPoints: 0, typeBonus: null,
};

// Unaffordable without tokens
const VENUSAUR: PokemonCard = {
  pokedexNumber: 3, name: 'Venusaur', energyType: 'Grass',
  evolutionTier: 3, cost: { Grass: 7 }, trainerPoints: 6, typeBonus: 'Grass',
};

beforeEach(() => {
  useGameStore.setState({ game: null });
  useGameStore.getState().initGame(TWO_PLAYER);
});

// Strand the current player: empty supply, empty board, nothing affordable
function strandCurrentPlayer() {
  useGameStore.setState(s => ({
    game: {
      ...s.game!,
      board: {
        ...s.game!.board,
        tier1Deck: [], tier2Deck: [], tier3Deck: [],
        tier1Face: [], tier2Face: [], tier3Face: [],
        energySupply: { Fire: 0, Water: 0, Grass: 0, Electric: 0, Psychic: 0, Ditto: 0 },
      },
    },
  }));
}

test('passTurn throws while legal moves exist', () => {
  expect(() => useGameStore.getState().passTurn()).toThrow('Cannot pass');
});

test('passTurn succeeds when no legal move exists and lets the turn advance', () => {
  strandCurrentPlayer();
  useGameStore.getState().passTurn();
  expect(useGameStore.getState().game!.actionTakenThisTurn).toBe(true);

  useGameStore.getState().advanceTurn();
  expect(useGameStore.getState().game!.currentPlayerIndex).toBe(1);
});

test('passTurn throws when an affordable scouted card exists', () => {
  strandCurrentPlayer();
  useGameStore.setState(s => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) => i === 0 ? { ...p, scoutedCards: [EEVEE] } : p),
    },
  }));
  expect(() => useGameStore.getState().passTurn()).toThrow('Cannot pass');
});

test('passTurn throws when scouting from a deck is still possible', () => {
  strandCurrentPlayer();
  useGameStore.setState(s => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, tier3Deck: [VENUSAUR] },
    },
  }));
  expect(() => useGameStore.getState().passTurn()).toThrow('Cannot pass');
});

test('passTurn throws when action already taken this turn', () => {
  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  strandCurrentPlayer();
  expect(() => useGameStore.getState().passTurn()).toThrow('Action already taken');
});

test('dispatchAction handles pass', () => {
  strandCurrentPlayer();
  expect(useGameStore.getState().dispatchAction({ type: 'pass' })).toBe(true);
  expect(useGameStore.getState().game!.actionTakenThisTurn).toBe(true);
});
