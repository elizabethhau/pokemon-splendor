import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ScoutedHandModal from '../components/ScoutedHandModal';
import { PlayerState, PokemonCard } from '../types/game';

// Sprites load async over the network; stub them out for deterministic rendering.
jest.mock('../components/board/ArtworkImage', () => ({ __esModule: true, default: () => null }));

const card = (over: Partial<PokemonCard>): PokemonCard => ({
  pokedexNumber: 1, name: 'Bulbasaur', energyType: 'Grass', evolutionTier: 1,
  cost: { Grass: 1 }, trainerPoints: 0, typeBonus: 'Grass', ...over,
});

const player = (over: Partial<PlayerState>): PlayerState => ({
  id: 'p1', name: 'You', isAI: false,
  energyTokens: {}, typeBonuses: {}, trainedCards: [], scoutedCards: [],
  legendaries: [], mythical: null, pokeballs: {}, ...over,
});

test('renders nothing when not visible', () => {
  render(<ScoutedHandModal visible={false} player={player({})} scale={1} onClose={() => {}} onCardPress={() => {}} />);
  expect(screen.queryByText('Your Hand')).toBeNull();
});

test('shows the empty state explaining Scouting when the hand is empty', () => {
  render(<ScoutedHandModal visible player={player({ scoutedCards: [] })} scale={1} onClose={() => {}} onCardPress={() => {}} />);
  expect(screen.getByText('No scouted cards yet')).toBeTruthy();
  expect(screen.getByText(/reserve a card here/i)).toBeTruthy();
});

test('labels an affordable card "Ready to train" and an unaffordable one "Need more energy"', () => {
  const affordable = card({ pokedexNumber: 1, name: 'Bulbasaur', cost: { Grass: 1 } });
  const unaffordable = card({ pokedexNumber: 4, name: 'Charmander', energyType: 'Fire', cost: { Fire: 3 } });
  render(
    <ScoutedHandModal
      visible
      player={player({ scoutedCards: [affordable, unaffordable], energyTokens: { Grass: 2 } })}
      scale={1}
      onClose={() => {}}
      onCardPress={() => {}}
    />,
  );
  expect(screen.getByText('Ready to train')).toBeTruthy();
  expect(screen.getByText('Need more energy')).toBeTruthy();
});

test('tapping a card calls onCardPress with that card', () => {
  const onCardPress = jest.fn();
  const c = card({ pokedexNumber: 25, name: 'Pikachu', energyType: 'Electric', cost: { Electric: 1 } });
  render(
    <ScoutedHandModal
      visible
      player={player({ scoutedCards: [c], energyTokens: { Electric: 1 } })}
      scale={1}
      onClose={() => {}}
      onCardPress={onCardPress}
    />,
  );
  fireEvent.press(screen.getByText('Pikachu'));
  expect(onCardPress).toHaveBeenCalledWith(c);
});

test('tapping the close button calls onClose', () => {
  const onClose = jest.fn();
  render(<ScoutedHandModal visible player={player({})} scale={1} onClose={onClose} onCardPress={() => {}} />);
  fireEvent.press(screen.getByText('✕'));
  expect(onClose).toHaveBeenCalled();
});
