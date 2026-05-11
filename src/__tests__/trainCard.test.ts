import { useGameStore } from '../store/useGameStore';
import { GameConfig, PokemonCard } from '../types/game';

const TWO_PLAYER: GameConfig = {
  playerNames: ['Alice', 'Bob'],
  deckMode: 'first151', passAndPlay: false,
};

// A known T1 card (Bulbasaur) for predictable cost tests
const BULBASAUR: PokemonCard = {
  pokedexNumber: 1, name: 'Bulbasaur', energyType: 'Grass',
  evolutionTier: 1, cost: { Grass: 2 }, trainerPoints: 0, typeBonus: 'Grass',
};

// A known T2 card (Ivysaur) for tier tests
const IVYSAUR: PokemonCard = {
  pokedexNumber: 2, name: 'Ivysaur', energyType: 'Grass',
  evolutionTier: 2, cost: { Grass: 3 }, trainerPoints: 1, typeBonus: 'Grass',
};

// A known T3 card (Venusaur) for tier tests
const VENUSAUR: PokemonCard = {
  pokedexNumber: 3, name: 'Venusaur', energyType: 'Grass',
  evolutionTier: 3, cost: { Grass: 7, Fire: 3 }, trainerPoints: 5, typeBonus: 'Grass',
};

// Eevee — typeBonus is null
const EEVEE: PokemonCard = {
  pokedexNumber: 133, name: 'Eevee', energyType: 'Electric',
  evolutionTier: 1, cost: { Electric: 2 }, trainerPoints: 0, typeBonus: null,
};

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

function putCardInFace(card: PokemonCard) {
  const faceKey = (['tier1Face', 'tier2Face', 'tier3Face'] as const)[card.evolutionTier - 1];
  useGameStore.setState((s) => {
    const rest = s.game!.board[faceKey].filter(c => c.pokedexNumber !== card.pokedexNumber).slice(0, 3);
    return {
      game: { ...s.game!, board: { ...s.game!.board, [faceKey]: [card, ...rest] } },
    };
  });
}

function putCardInScouted(card: PokemonCard, playerIndex = 0) {
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === playerIndex ? { ...p, scoutedCards: [...p.scoutedCards, card] } : p
      ),
    },
  }));
}

beforeEach(() => {
  useGameStore.setState({ game: null });
  useGameStore.getState().initGame(TWO_PLAYER);
});

// ─── Test 1 ───────────────────────────────────────────────────────────────────
test('training a face-up tier 1 card adds it to trainedCards and grants a Pokeball', () => {
  putCardInFace(BULBASAUR);
  givePlayerTokens({ Grass: 2 });

  useGameStore.getState().trainCard(BULBASAUR);

  const player = useGameStore.getState().game!.players[0];
  expect(player.trainedCards).toContainEqual(BULBASAUR);
  expect(player.pokeballs.Pokeball).toBe(1);
});

// ─── Test 2 ───────────────────────────────────────────────────────────────────
test('training a face-up card replaces it from the deck; empty deck leaves the slot gone', () => {
  putCardInFace(BULBASAUR);
  givePlayerTokens({ Grass: 5 });

  const deckBefore = useGameStore.getState().game!.board.tier1Deck;
  const expectedReplacement = deckBefore[0]; // top of deck

  useGameStore.getState().trainCard(BULBASAUR);

  const board = useGameStore.getState().game!.board;
  expect(board.tier1Face).toContainEqual(expectedReplacement);
  expect(board.tier1Deck).toHaveLength(deckBefore.length - 1);
  expect(board.tier1Face).not.toContainEqual(BULBASAUR);

  // When deck is empty the slot disappears (face shrinks by 1)
  useGameStore.setState((s) => ({
    game: { ...s.game!, actionTakenThisTurn: false, board: { ...s.game!.board, tier1Deck: [] } },
  }));
  const faceCountBefore = useGameStore.getState().game!.board.tier1Face.length;
  putCardInFace(BULBASAUR);
  useGameStore.getState().trainCard(BULBASAUR);
  expect(useGameStore.getState().game!.board.tier1Face).toHaveLength(faceCountBefore - 1);
});

// ─── Test 3 ───────────────────────────────────────────────────────────────────
test('training a scouted card removes it from scoutedCards without touching the deck', () => {
  // Use a fake pokedex number so this card is guaranteed not to appear in the
  // shuffled face-up rows — otherwise trainCard would take the face path instead.
  const SCOUTED_ONLY: PokemonCard = {
    pokedexNumber: 9999, name: 'TestCard', energyType: 'Grass',
    evolutionTier: 1, cost: { Grass: 2 }, trainerPoints: 0, typeBonus: 'Grass',
  };
  putCardInScouted(SCOUTED_ONLY);
  givePlayerTokens({ Grass: 2 });

  const deckBefore = [...useGameStore.getState().game!.board.tier1Deck];
  const faceBefore = [...useGameStore.getState().game!.board.tier1Face];

  useGameStore.getState().trainCard(SCOUTED_ONLY);

  const { game } = useGameStore.getState();
  expect(game!.players[0].scoutedCards).toHaveLength(0);
  expect(game!.players[0].trainedCards).toContainEqual(SCOUTED_ONLY);
  expect(game!.board.tier1Deck).toEqual(deckBefore);
  expect(game!.board.tier1Face).toEqual(faceBefore);
});

// ─── Test 4 ───────────────────────────────────────────────────────────────────
test('type bonuses reduce cost; only the remainder is paid from energy tokens', () => {
  putCardInFace(BULBASAUR); // cost: { Grass: 2 }
  // Give player 1 Grass type bonus (permanently reduces Grass cost by 1)
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, typeBonuses: { Grass: 1 }, energyTokens: { Grass: 1 } } : p
      ),
    },
  }));

  useGameStore.getState().trainCard(BULBASAUR);

  const { game } = useGameStore.getState();
  // Paid 1 Grass token (2 cost - 1 bonus = 1 token needed)
  expect(game!.players[0].energyTokens.Grass).toBe(0);
  expect(game!.board.energySupply.Grass).toBe(8); // 7 initial + 1 returned
});

// ─── Test 5 ───────────────────────────────────────────────────────────────────
test('Ditto tokens cover remaining cost when energy tokens are insufficient', () => {
  putCardInFace(BULBASAUR); // cost: { Grass: 2 }
  // Player has 1 Grass + 2 Ditto; needs 2 Grass → uses 1 Grass + 1 Ditto
  givePlayerTokens({ Grass: 1, Ditto: 2 });

  useGameStore.getState().trainCard(BULBASAUR);

  const { game } = useGameStore.getState();
  expect(game!.players[0].energyTokens.Grass).toBe(0);
  expect(game!.players[0].energyTokens.Ditto).toBe(1);
  expect(game!.board.energySupply.Grass).toBe(8); // 7 + 1 Grass returned
  expect(game!.board.energySupply.Ditto).toBe(6); // 5 + 1 Ditto returned
});

// ─── Test 6 ───────────────────────────────────────────────────────────────────
test('correct Pokeball tier earned per card tier', () => {
  putCardInFace(IVYSAUR);
  givePlayerTokens({ Grass: 5 });
  useGameStore.getState().trainCard(IVYSAUR);
  expect(useGameStore.getState().game!.players[0].pokeballs.GreatBall).toBe(1);

  // Reset and train a T3
  useGameStore.getState().initGame(TWO_PLAYER);
  putCardInFace(VENUSAUR);
  givePlayerTokens({ Grass: 10, Fire: 5 });
  useGameStore.getState().trainCard(VENUSAUR);
  expect(useGameStore.getState().game!.players[0].pokeballs.UltraBall).toBe(1);
});

// ─── Test 7 ───────────────────────────────────────────────────────────────────
test('typeBonus increments for the card energyType; Eevee grants no bonus', () => {
  putCardInFace(BULBASAUR);
  givePlayerTokens({ Grass: 2 });
  useGameStore.getState().trainCard(BULBASAUR);
  expect(useGameStore.getState().game!.players[0].typeBonuses.Grass).toBe(1);

  // Eevee grants no type bonus
  useGameStore.getState().initGame(TWO_PLAYER);
  putCardInFace(EEVEE);
  givePlayerTokens({ Electric: 2 });
  useGameStore.getState().trainCard(EEVEE);
  const bonuses = useGameStore.getState().game!.players[0].typeBonuses;
  expect(bonuses.Electric).toBeUndefined();
});

// ─── Test 8 ───────────────────────────────────────────────────────────────────
test('trainCard throws when player cannot afford the card', () => {
  putCardInFace(BULBASAUR); // cost: { Grass: 2 }
  givePlayerTokens({ Grass: 1 }); // only 1 — not enough

  expect(() => useGameStore.getState().trainCard(BULBASAUR)).toThrow();
  // Card still on board, not in trainedCards
  const { game } = useGameStore.getState();
  expect(game!.players[0].trainedCards).toHaveLength(0);
  expect(game!.board.tier1Face).toContainEqual(BULBASAUR);
});
