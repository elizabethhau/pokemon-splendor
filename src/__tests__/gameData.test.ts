import first151 from '../data/first-151.json';
import legendaries from '../data/legendaries.json';
import mew from '../data/mew.json';
import { PokemonCard, Legendary, Mythical, EnergyType } from '../types/game';

const VALID_ENERGY_TYPES: EnergyType[] = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic'];
const cards = first151.cards as PokemonCard[];

// ─── Test 1 ───────────────────────────────────────────────────────────────────
test('first-151 deck has exactly 144 playable cards', () => {
  expect(cards).toHaveLength(144);
});

// ─── Test 2 ───────────────────────────────────────────────────────────────────
test('every card has valid schema fields', () => {
  for (const card of cards) {
    expect(typeof card.pokedexNumber).toBe('number');
    expect(typeof card.name).toBe('string');
    expect(card.name.length).toBeGreaterThan(0);
    expect(VALID_ENERGY_TYPES).toContain(card.energyType);
    expect([1, 2, 3]).toContain(card.evolutionTier);
    expect(typeof card.trainerPoints).toBe('number');
    expect(card.trainerPoints).toBeGreaterThanOrEqual(0);
    expect(typeof card.cost).toBe('object');
    // typeBonus must be valid energy type or null
    if (card.typeBonus !== null) {
      expect(VALID_ENERGY_TYPES).toContain(card.typeBonus);
    }
  }
});

// ─── Test 3 ───────────────────────────────────────────────────────────────────
test('Eevee (#133) has null typeBonus and all other cards have a typeBonus', () => {
  const eevee = cards.find(c => c.pokedexNumber === 133);
  expect(eevee).toBeDefined();
  expect(eevee!.typeBonus).toBeNull();

  const nonEevee = cards.filter(c => c.pokedexNumber !== 133);
  for (const card of nonEevee) {
    expect(card.typeBonus).not.toBeNull();
  }
});

// ─── Test 4 ───────────────────────────────────────────────────────────────────
test('no duplicate pokedex numbers in the deck', () => {
  const nums = cards.map(c => c.pokedexNumber);
  const unique = new Set(nums);
  expect(unique.size).toBe(cards.length);
});

// ─── Test 5 ───────────────────────────────────────────────────────────────────
test('type distribution matches design (Fire 29, Water 28, Grass 40, Electric 32, Psychic 15)', () => {
  const counts: Record<string, number> = {};
  for (const card of cards) {
    counts[card.energyType] = (counts[card.energyType] ?? 0) + 1;
  }
  expect(counts['Fire']).toBe(29);
  expect(counts['Water']).toBe(28);
  expect(counts['Grass']).toBe(40);
  expect(counts['Electric']).toBe(32);
  expect(counts['Psychic']).toBe(15);
});

// ─── Test 6 ───────────────────────────────────────────────────────────────────
test('legendaries.json has exactly 5 legendaries with valid requirements', () => {
  const legs = legendaries.legendaries as Legendary[];
  expect(legs).toHaveLength(5);
  for (const leg of legs) {
    expect(typeof leg.pokedexNumber).toBe('number');
    expect(typeof leg.name).toBe('string');
    expect(leg.trainerPoints).toBe(3);
    expect(typeof leg.requirements).toBe('object');
    const reqValues = Object.values(leg.requirements);
    expect(reqValues.length).toBeGreaterThan(0);
    for (const v of reqValues) {
      expect(typeof v).toBe('number');
      expect(v).toBeGreaterThan(0);
    }
    for (const k of Object.keys(leg.requirements)) {
      expect(VALID_ENERGY_TYPES).toContain(k);
    }
  }
});

// ─── Test 7 ───────────────────────────────────────────────────────────────────
test('mew.json defines Mew with correct trainerPoints and legendariesRequired', () => {
  const m = mew.mythical as Mythical;
  expect(m.pokedexNumber).toBe(151);
  expect(m.name).toBe('Mew');
  expect(m.trainerPoints).toBe(5);
  expect(m.legendariesRequired).toBe(2);
});
