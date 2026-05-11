import { canAfford, canCatchMew, canClaimLegendary } from '../store/selectors';
import { Legendary, Mythical, PlayerState, PokemonCard } from '../types/game';

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id: 'p0', name: 'Alice', isAI: false,
    energyTokens: {}, typeBonuses: {},
    trainedCards: [], scoutedCards: [],
    legendaries: [], mythical: null, pokeballs: {},
    ...overrides,
  };
}

const MEW: Mythical = { pokedexNumber: 151, name: 'Mew', trainerPoints: 5, legendariesRequired: 2 };
const ARTICUNO: Legendary = { pokedexNumber: 144, name: 'Articuno', trainerPoints: 3, requirements: { Water: 4 } };

// ─── canAfford ────────────────────────────────────────────────────────────────

const CARD: PokemonCard = {
  pokedexNumber: 1, name: 'Bulbasaur', energyType: 'Grass',
  evolutionTier: 1, cost: { Grass: 2, Fire: 1 }, trainerPoints: 0, typeBonus: 'Grass',
};

test('canAfford: true when player has exact tokens for each type', () => {
  const player = makePlayer({ energyTokens: { Grass: 2, Fire: 1 } });
  expect(canAfford(player, CARD)).toBe(true);
});

test('canAfford: true when type bonus fully covers cost (player needs no tokens)', () => {
  const player = makePlayer({ typeBonuses: { Grass: 5, Fire: 5 } });
  expect(canAfford(player, CARD)).toBe(true);
});

test('canAfford: true when Ditto covers the shortfall', () => {
  // Only 1 Grass token; Ditto must cover the remaining 1 Grass + 1 Fire
  const player = makePlayer({ energyTokens: { Grass: 1, Ditto: 2 } });
  expect(canAfford(player, CARD)).toBe(true);
});

test('canAfford: false when not enough tokens and not enough Ditto', () => {
  const player = makePlayer({ energyTokens: { Grass: 1, Ditto: 1 } });
  // effective cost: Grass 2, Fire 1. Have Grass 1 + Ditto 1 → covers 1 shortfall but needs 2 total
  expect(canAfford(player, CARD)).toBe(false);
});

test('canAfford: false when completely broke', () => {
  expect(canAfford(makePlayer(), CARD)).toBe(false);
});

test('canAfford: true for a zero-cost card', () => {
  const FREE: PokemonCard = {
    pokedexNumber: 10, name: 'Caterpie', energyType: 'Grass',
    evolutionTier: 1, cost: {}, trainerPoints: 0, typeBonus: 'Grass',
  };
  expect(canAfford(makePlayer(), FREE)).toBe(true);
});

// ─── canClaimLegendary ────────────────────────────────────────────────────────

test('canClaimLegendary: true when all requirements met', () => {
  const player = makePlayer({ typeBonuses: { Water: 4 } });
  expect(canClaimLegendary(player, ARTICUNO)).toBe(true);
});

test('canClaimLegendary: true when bonuses exceed requirement', () => {
  const player = makePlayer({ typeBonuses: { Water: 6 } });
  expect(canClaimLegendary(player, ARTICUNO)).toBe(true);
});

test('canClaimLegendary: false when short by 1', () => {
  const player = makePlayer({ typeBonuses: { Water: 3 } });
  expect(canClaimLegendary(player, ARTICUNO)).toBe(false);
});

test('canClaimLegendary: false when type missing entirely', () => {
  const player = makePlayer({ typeBonuses: { Fire: 10 } });
  expect(canClaimLegendary(player, ARTICUNO)).toBe(false);
});

// ─── canCatchMew ──────────────────────────────────────────────────────────────

test('canCatchMew: true when enough legendaries and has a ball', () => {
  const player = makePlayer({
    legendaries: [ARTICUNO, { pokedexNumber: 145, name: 'Zapdos', trainerPoints: 3, requirements: {} }],
    pokeballs: { Pokeball: 1 },
  });
  expect(canCatchMew(player, MEW)).toBe(true);
});

test('canCatchMew: false when not enough legendaries', () => {
  const player = makePlayer({ legendaries: [ARTICUNO], pokeballs: { Pokeball: 1 } });
  expect(canCatchMew(player, MEW)).toBe(false);
});

test('canCatchMew: false when enough legendaries but no balls', () => {
  const player = makePlayer({
    legendaries: [ARTICUNO, { pokedexNumber: 145, name: 'Zapdos', trainerPoints: 3, requirements: {} }],
    pokeballs: {},
  });
  expect(canCatchMew(player, MEW)).toBe(false);
});

test('canCatchMew: false when ball count is 0', () => {
  const player = makePlayer({
    legendaries: [ARTICUNO, { pokedexNumber: 145, name: 'Zapdos', trainerPoints: 3, requirements: {} }],
    pokeballs: { Pokeball: 0 },
  });
  expect(canCatchMew(player, MEW)).toBe(false);
});
