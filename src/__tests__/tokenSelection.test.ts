import { canAddToken, isSelectionValid } from '../store/tokenSelection';
import { TokenType } from '../types/game';

const fullSupply: Record<TokenType, number> = {
  Fire: 7, Water: 7, Grass: 7, Electric: 7, Psychic: 7, Ditto: 5,
};

test('any in-supply type can start a selection', () => {
  expect(canAddToken(fullSupply, {}, 'Fire')).toBe(true);
});

test('a type with no remaining supply cannot be selected', () => {
  expect(canAddToken({ ...fullSupply, Fire: 0 }, {}, 'Fire')).toBe(false);
  // one selected of two in supply leaves one takeable; two selected leaves none
  expect(canAddToken({ ...fullSupply, Fire: 2 }, { Fire: 1 }, 'Fire')).toBe(false); // take-two needs 4+
  expect(canAddToken({ ...fullSupply, Water: 1 }, { Water: 1 }, 'Water')).toBe(false);
});

test('taking a second of the same type requires 4+ in supply', () => {
  expect(canAddToken({ ...fullSupply, Fire: 4 }, { Fire: 1 }, 'Fire')).toBe(true);
  expect(canAddToken({ ...fullSupply, Fire: 3 }, { Fire: 1 }, 'Fire')).toBe(false);
});

test('after taking two of one type, nothing more can be added', () => {
  expect(canAddToken(fullSupply, { Fire: 2 }, 'Water')).toBe(false);
  expect(canAddToken(fullSupply, { Fire: 2 }, 'Fire')).toBe(false);
});

test('up to three different types; no duplicates once two different are held', () => {
  expect(canAddToken(fullSupply, { Fire: 1, Water: 1 }, 'Grass')).toBe(true);
  expect(canAddToken(fullSupply, { Fire: 1, Water: 1 }, 'Fire')).toBe(false);
  expect(canAddToken(fullSupply, { Fire: 1, Water: 1, Grass: 1 }, 'Electric')).toBe(false);
});

test('two of one type is a valid take', () => {
  expect(isSelectionValid(fullSupply, { Fire: 2 })).toBe(true);
});

test('three different types is a valid take; fewer is not while more types remain', () => {
  expect(isSelectionValid(fullSupply, { Fire: 1, Water: 1, Grass: 1 })).toBe(true);
  expect(isSelectionValid(fullSupply, { Fire: 1, Water: 1 })).toBe(false);
  expect(isSelectionValid(fullSupply, { Fire: 1 })).toBe(false);
});

test('short supply: when only two types remain, two different is the valid take', () => {
  const shortSupply: Record<TokenType, number> = {
    Fire: 2, Water: 1, Grass: 0, Electric: 0, Psychic: 0, Ditto: 5,
  };
  expect(isSelectionValid(shortSupply, { Fire: 1, Water: 1 })).toBe(true);
  expect(isSelectionValid(shortSupply, { Fire: 1 })).toBe(false);
});

test('empty selection is not a valid take', () => {
  expect(isSelectionValid(fullSupply, {})).toBe(false);
});
