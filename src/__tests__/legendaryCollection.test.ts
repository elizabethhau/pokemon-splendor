import { useGameStore } from '../store/useGameStore';
import { GameConfig, Legendary, PokemonCard } from '../types/game';

const TWO_PLAYER: GameConfig = {
  playerNames: ['Alice', 'Bob'],
  deckMode: 'first151',
  passAndPlay: false,
};

// Zapdos requires Electric: 4, Fire: 3
const ZAPDOS: Legendary = {
  pokedexNumber: 145, name: 'Zapdos', trainerPoints: 3,
  requirements: { Electric: 4, Fire: 3 },
};

// A Fire Tier 1 card (adds 1 Fire typeBonus)
const CHARMANDER: PokemonCard = {
  pokedexNumber: 4, name: 'Charmander', energyType: 'Fire',
  evolutionTier: 1, cost: { Fire: 2 }, trainerPoints: 0, typeBonus: 'Fire',
};

// A Water Tier 1 card (adds 1 Water typeBonus)
const SQUIRTLE: PokemonCard = {
  pokedexNumber: 7, name: 'Squirtle', energyType: 'Water',
  evolutionTier: 1, cost: { Water: 2 }, trainerPoints: 0, typeBonus: 'Water',
};

function putCardInFace(card: PokemonCard) {
  const faceKey = (['tier1Face', 'tier2Face', 'tier3Face'] as const)[card.evolutionTier - 1];
  useGameStore.setState((s) => {
    const rest = s.game!.board[faceKey].filter(c => c.pokedexNumber !== card.pokedexNumber).slice(0, 3);
    return {
      game: { ...s.game!, board: { ...s.game!.board, [faceKey]: [card, ...rest] } },
    };
  });
}

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

beforeEach(() => {
  useGameStore.setState({ game: null });
  useGameStore.getState().initGame(TWO_PLAYER);
  // Use only Zapdos on the board for predictable tests
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, availableLegendaries: [ZAPDOS] },
    },
  }));
});

// ─── Test 1 ───────────────────────────────────────────────────────────────────
test('training a card that completes a Legendary requirement auto-collects it', () => {
  // Alice needs Fire: 3, Electric: 4 for Zapdos — she has Electric: 4, Fire: 2
  setTypeBonuses({ Electric: 4, Fire: 2 });
  putCardInFace(CHARMANDER); // typeBonus: Fire → pushes Fire to 3
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, energyTokens: { Fire: 5 } } : p
      ),
    },
  }));

  useGameStore.getState().trainCard(CHARMANDER);

  const player = useGameStore.getState().game!.players[0];
  expect(player.legendaries).toHaveLength(1);
  expect(player.legendaries[0].name).toBe('Zapdos');
});

// ─── Test 2 ───────────────────────────────────────────────────────────────────
test('claimed Legendary is removed from board.availableLegendaries', () => {
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

  expect(useGameStore.getState().game!.board.availableLegendaries).toHaveLength(0);
});

// ─── Test 3 ───────────────────────────────────────────────────────────────────
test('multiple Legendaries can be collected in a single trainCard call', () => {
  // Add a second Legendary that will also trigger: Moltres (Fire: 4, Grass: 3)
  const MOLTRES: Legendary = {
    pokedexNumber: 146, name: 'Moltres', trainerPoints: 3,
    requirements: { Fire: 4, Grass: 3 },
  };
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, availableLegendaries: [ZAPDOS, MOLTRES] },
    },
  }));

  // Electric: 4, Fire: 3 → Zapdos. Fire: 4, Grass: 3 → Moltres.
  // After training one more Fire card: Fire goes 3→4, completing both.
  setTypeBonuses({ Electric: 4, Fire: 3, Grass: 3 });
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

  const player = useGameStore.getState().game!.players[0];
  expect(player.legendaries).toHaveLength(2);
  expect(useGameStore.getState().game!.board.availableLegendaries).toHaveLength(0);
});

// ─── Test 4 ───────────────────────────────────────────────────────────────────
test('Legendary is NOT collected when requirements are only partially met', () => {
  // Alice has Electric: 4, Fire: 1 — still needs Fire: 3 for Zapdos
  setTypeBonuses({ Electric: 4, Fire: 1 });
  putCardInFace(CHARMANDER); // adds only 1 Fire → Fire becomes 2, still short
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, energyTokens: { Fire: 5 } } : p
      ),
    },
  }));

  useGameStore.getState().trainCard(CHARMANDER);

  const player = useGameStore.getState().game!.players[0];
  expect(player.legendaries).toHaveLength(0);
  expect(useGameStore.getState().game!.board.availableLegendaries).toHaveLength(1);
});

// ─── Test 5 ───────────────────────────────────────────────────────────────────
test('first player to claim a Legendary earns a MasterBall; subsequent claims do not', () => {
  // Alice claims Zapdos first → gets MasterBall
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

  expect(useGameStore.getState().game!.players[0].pokeballs.MasterBall).toBe(1);
  expect(useGameStore.getState().game!.board.firstLegendaryClaimed).toBe(true);

  // Add Moltres back so Bob can claim it
  const MOLTRES: Legendary = {
    pokedexNumber: 146, name: 'Moltres', trainerPoints: 3,
    requirements: { Water: 1 },
  };
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      currentPlayerIndex: 1,
      actionTakenThisTurn: false,
      board: { ...s.game!.board, availableLegendaries: [MOLTRES] },
      players: s.game!.players.map((p, i) =>
        i === 1 ? { ...p, energyTokens: { Water: 5 }, typeBonuses: {} } : p
      ),
    },
  }));

  putCardInFace(SQUIRTLE); // typeBonus: Water — meets Moltres { Water: 1 }
  useGameStore.getState().trainCard(SQUIRTLE);

  // Bob claims Moltres but gets no MasterBall (already claimed by Alice)
  expect(useGameStore.getState().game!.players[1].legendaries).toHaveLength(1);
  expect(useGameStore.getState().game!.players[1].pokeballs.MasterBall).toBeUndefined();
});

// ─── Test 6 ───────────────────────────────────────────────────────────────────
test('claiming multiple legendaries in a single trainCard gives exactly 1 MasterBall', () => {
  // Two legendaries both triggered by one card: Moltres (Fire:4, Grass:3) + Zapdos (Electric:4, Fire:3)
  // After training one more Fire card (Fire goes 3→4), both trigger simultaneously
  const MOLTRES: Legendary = {
    pokedexNumber: 146, name: 'Moltres', trainerPoints: 3,
    requirements: { Fire: 4, Grass: 3 },
  };
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      board: { ...s.game!.board, availableLegendaries: [ZAPDOS, MOLTRES] },
    },
  }));

  setTypeBonuses({ Electric: 4, Fire: 3, Grass: 3 });
  putCardInFace(CHARMANDER);
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === 0 ? { ...p, energyTokens: { Fire: 5 } } : p
      ),
    },
  }));

  useGameStore.getState().trainCard(CHARMANDER); // Fire goes 3→4 → triggers both Zapdos and Moltres

  const player = useGameStore.getState().game!.players[0];
  expect(player.legendaries).toHaveLength(2);
  // First-legendary bonus fires once for the whole trainCard call, not once per legendary
  expect(player.pokeballs.MasterBall).toBe(1);
});
