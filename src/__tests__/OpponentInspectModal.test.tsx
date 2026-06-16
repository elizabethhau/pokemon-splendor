import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import OpponentInspectModal from '../components/OpponentInspectModal';
import { Legendary, PlayerState, PokemonCard } from '../types/game';

// Sprites load async over the network; stub them out for deterministic rendering.
jest.mock('../components/board/ArtworkImage', () => ({ __esModule: true, default: () => null }));

const card = (over: Partial<PokemonCard>): PokemonCard => ({
  pokedexNumber: 1, name: 'Bulbasaur', energyType: 'Grass', evolutionTier: 1,
  cost: { Grass: 1 }, trainerPoints: 0, typeBonus: 'Grass', ...over,
});

const legendary = (over: Partial<Legendary>): Legendary => ({
  pokedexNumber: 144, name: 'Articuno', trainerPoints: 3, requirements: { Water: 4 }, ...over,
});

const player = (over: Partial<PlayerState>): PlayerState => ({
  id: 'p2', name: 'Rival', isAI: true,
  energyTokens: {}, typeBonuses: {}, trainedCards: [], scoutedCards: [],
  legendaries: [], mythical: null, pokeballs: {}, ...over,
});

const base = {
  visible: true as const, avatarDex: 150, scale: 1, onClose: () => {},
};

test('renders nothing when not visible', () => {
  render(<OpponentInspectModal {...base} visible={false} player={player({})} />);
  expect(screen.queryByText('Rival')).toBeNull();
});

test('renders the opponent name and the read-only sections', () => {
  render(<OpponentInspectModal {...base} player={player({})} />);
  expect(screen.getByText('Rival')).toBeTruthy();
  expect(screen.getByText(/view only/i)).toBeTruthy();
  expect(screen.getByText('TYPE BONUS')).toBeTruthy();
  expect(screen.getByText('ENERGY')).toBeTruthy();
  expect(screen.getByText('POKÉ BALLS')).toBeTruthy();
  expect(screen.getByText('SCOUTED HAND')).toBeTruthy();
  expect(screen.getByText(/^TRAINED/)).toBeTruthy();
});

test('shows scouted-hand SIZE but never the scouted card contents', () => {
  const secret = card({ pokedexNumber: 6, name: 'Charizard', energyType: 'Fire' });
  render(<OpponentInspectModal {...base} player={player({ scoutedCards: [secret, card({})] })} />);
  // size is public...
  expect(screen.getByText('2 / 3')).toBeTruthy();
  expect(screen.getByText(/contents hidden/i)).toBeTruthy();
  // ...but the identities are not
  expect(screen.queryByText('Charizard')).toBeNull();
  expect(screen.queryByText('Bulbasaur')).toBeNull();
});

test('lists Legendaries the opponent has collected', () => {
  render(<OpponentInspectModal {...base} player={player({ legendaries: [legendary({})] })} />);
  expect(screen.getByText('Articuno')).toBeTruthy();
});

test('shows the trained-Pokémon count and renders an empty scouted hand as "empty"', () => {
  render(<OpponentInspectModal {...base} player={player({ trainedCards: [card({}), card({ pokedexNumber: 4 })] })} />);
  expect(screen.getByText('TRAINED 2')).toBeTruthy();
  expect(screen.getByText('empty')).toBeTruthy(); // no scouted cards
});

test('tapping the close button calls onClose', () => {
  const onClose = jest.fn();
  render(<OpponentInspectModal {...base} player={player({})} onClose={onClose} />);
  fireEvent.press(screen.getByText('✕'));
  expect(onClose).toHaveBeenCalled();
});
