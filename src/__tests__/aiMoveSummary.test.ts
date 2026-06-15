import { formatAIMove } from '../ai/aiMoveSummary';

test('takeTokens summarises the total energy taken', () => {
  expect(formatAIMove('Rival', { kind: 'takeTokens', tokens: { Fire: 1, Water: 1, Grass: 1 } }))
    .toBe('Rival took 3 Energy');
  expect(formatAIMove('Rival', { kind: 'takeTokens', tokens: { Fire: 2 } }))
    .toBe('Rival took 2 Energy');
});

test('trainCard names the card', () => {
  expect(formatAIMove('Rival', { kind: 'trainCard', cardName: 'Arcanine', claimedLegendaries: [] }))
    .toBe('Rival trained Arcanine');
});

test('trainCard appends claimed legendaries when the train triggers a collection', () => {
  expect(formatAIMove('Blue', { kind: 'trainCard', cardName: 'Arcanine', claimedLegendaries: ['Moltres'] }))
    .toBe('Blue trained Arcanine and caught Moltres!');
  expect(formatAIMove('Blue', { kind: 'trainCard', cardName: 'Arcanine', claimedLegendaries: ['Moltres', 'Zapdos'] }))
    .toBe('Blue trained Arcanine and caught Moltres & Zapdos!');
});

test('scoutFaceUp names the revealed card; scoutFromDeck hides it behind the deck label', () => {
  expect(formatAIMove('Rival', { kind: 'scoutFaceUp', cardName: 'Pikachu' }))
    .toBe('Rival scouted Pikachu');
  expect(formatAIMove('Rival', { kind: 'scoutFromDeck', tier: 3 }))
    .toBe('Rival scouted from the Stage 2 deck');
  expect(formatAIMove('Rival', { kind: 'scoutFromDeck', tier: 1 }))
    .toBe('Rival scouted from the Basic deck');
});

test('catchMew reports success and failure distinctly', () => {
  expect(formatAIMove('Rival', { kind: 'catchMew', caught: true })).toBe('Rival caught Mew! +5 TP');
  expect(formatAIMove('Rival', { kind: 'catchMew', caught: false })).toBe("Rival's Poké Ball missed Mew");
});

test('pass', () => {
  expect(formatAIMove('Rival', { kind: 'pass' })).toBe('Rival passed');
});
