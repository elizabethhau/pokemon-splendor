import { useGameStore } from '../store/useGameStore';
import { GameConfig, PokemonCard } from '../types/game';

const TWO_PLAYER: GameConfig = {
  playerNames: ['Alice', 'Bob'],
  aiFlags: [false, false],
  deckMode: 'first151', passAndPlay: false,
};

const BULBASAUR: PokemonCard = {
  pokedexNumber: 1, name: 'Bulbasaur', energyType: 'Grass',
  evolutionTier: 1, cost: { Grass: 2 }, trainerPoints: 0, typeBonus: 'Grass',
};

function putCardInFace(card: PokemonCard) {
  const faceKey = (['tier1Face', 'tier2Face', 'tier3Face'] as const)[card.evolutionTier - 1];
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, [faceKey]: [card, ...s.game!.board[faceKey].slice(1)] },
    },
  }));
}

beforeEach(() => {
  useGameStore.setState({ game: null });
  useGameStore.getState().initGame(TWO_PLAYER);
});

// ─── Test 1 ───────────────────────────────────────────────────────────────────
test('scouting a face-up card adds it to scoutedCards and gives player 1 Ditto', () => {
  putCardInFace(BULBASAUR);

  useGameStore.getState().scoutFaceUp(BULBASAUR);

  const { game } = useGameStore.getState();
  const player = game!.players[0];
  expect(player.scoutedCards).toContainEqual(BULBASAUR);
  expect(player.energyTokens.Ditto).toBe(1);
  expect(game!.board.energySupply.Ditto).toBe(4);
});

// ─── Test 2 ───────────────────────────────────────────────────────────────────
test('scouted face-up card slot is refilled from the deck; empty deck leaves slot gone', () => {
  putCardInFace(BULBASAUR);
  const deckBefore = useGameStore.getState().game!.board.tier1Deck;
  const faceBefore = useGameStore.getState().game!.board.tier1Face.length;
  const replacement = deckBefore[0];

  useGameStore.getState().scoutFaceUp(BULBASAUR);

  const board = useGameStore.getState().game!.board;
  expect(board.tier1Face).not.toContainEqual(BULBASAUR);
  expect(board.tier1Face).toContainEqual(replacement);       // slot refilled
  expect(board.tier1Face).toHaveLength(faceBefore);          // count unchanged
  expect(board.tier1Deck).toHaveLength(deckBefore.length - 1);

  // When deck is empty the slot disappears
  useGameStore.setState((s) => ({
    game: { ...s.game!, board: { ...s.game!.board, tier1Deck: [] } },
  }));
  const faceCount = useGameStore.getState().game!.board.tier1Face.length;
  putCardInFace(BULBASAUR);
  useGameStore.getState().scoutFaceUp(BULBASAUR);
  expect(useGameStore.getState().game!.board.tier1Face).toHaveLength(faceCount - 1);
});

// ─── Test 3 ───────────────────────────────────────────────────────────────────
test('scouting from deck takes the top deck card into scoutedCards and gives 1 Ditto', () => {
  const deckBefore = useGameStore.getState().game!.board.tier1Deck;
  const topCard = deckBefore[0];

  useGameStore.getState().scoutFromDeck(1);

  const { game } = useGameStore.getState();
  const player = game!.players[0];
  expect(player.scoutedCards).toContainEqual(topCard);
  expect(game!.board.tier1Deck).toHaveLength(deckBefore.length - 1);
  expect(player.energyTokens.Ditto).toBe(1);
  expect(game!.board.energySupply.Ditto).toBe(4);
});

// ─── Test 4 ───────────────────────────────────────────────────────────────────
test('player gains no Ditto when supply is exhausted', () => {
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, energySupply: { ...s.game!.board.energySupply, Ditto: 0 } },
    },
  }));
  putCardInFace(BULBASAUR);

  useGameStore.getState().scoutFaceUp(BULBASAUR);

  const player = useGameStore.getState().game!.players[0];
  expect(player.energyTokens.Ditto ?? 0).toBe(0);
});

// ─── Test 5 ───────────────────────────────────────────────────────────────────
test('scouting throws when player already holds 3 scouted cards', () => {
  // Fill scouted hand to 3
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0
          ? { ...p, scoutedCards: [BULBASAUR, BULBASAUR, BULBASAUR] }
          : p
      ),
    },
  }));

  putCardInFace(BULBASAUR);
  expect(() => useGameStore.getState().scoutFaceUp(BULBASAUR)).toThrow();
  expect(() => useGameStore.getState().scoutFromDeck(1)).toThrow();
});

// ─── Test 6 ───────────────────────────────────────────────────────────────────
test('scoutFromDeck throws when the target deck is empty', () => {
  useGameStore.setState((s) => ({
    game: { ...s.game!, board: { ...s.game!.board, tier2Deck: [] } },
  }));

  expect(() => useGameStore.getState().scoutFromDeck(2)).toThrow();
});
