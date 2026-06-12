import { costRows } from '../store/costRows';
import { makePlayer } from '../store/gameRules';
import { PokemonCard } from '../types/game';

function card(cost: PokemonCard['cost']): PokemonCard {
  return {
    pokedexNumber: 4, name: 'Charmander', energyType: 'Fire',
    evolutionTier: 1, trainerPoints: 0, cost, typeBonus: 'Fire',
  } as PokemonCard;
}

test('free card shows a single no-cost row', () => {
  const rows = costRows(makePlayer('A', 0, false), card({}));
  expect(rows).toEqual([{ type: null, need: 0, label: 'Free', status: 'no cost', ok: true }]);
});

test('cost fully covered by type bonus', () => {
  const player = { ...makePlayer('A', 0, false), typeBonuses: { Fire: 2 } };
  const rows = costRows(player, card({ Fire: 2 }));
  expect(rows).toEqual([
    { type: 'Fire', need: 2, label: 'Fire (−2 bonus)', status: 'covered by bonus', ok: true },
  ]);
});

test('enough tokens after partial bonus', () => {
  const player = {
    ...makePlayer('A', 0, false),
    typeBonuses: { Fire: 1 },
    energyTokens: { Fire: 2 },
  };
  const rows = costRows(player, card({ Fire: 3 }));
  expect(rows).toEqual([
    { type: 'Fire', need: 3, label: 'Fire (−1 bonus)', status: 'you have 2', ok: true },
  ]);
});

test('shortfall shows have/need', () => {
  const player = { ...makePlayer('A', 0, false), energyTokens: { Water: 1 } };
  const rows = costRows(player, card({ Water: 3 }));
  expect(rows).toEqual([
    { type: 'Water', need: 3, label: 'Water', status: 'have 1 / need 3', ok: false },
  ]);
});
