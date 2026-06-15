import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import TokenDiscardModal from '../components/TokenDiscardModal';
import { useGameStore } from '../store/useGameStore';
import { GameConfig, TokenType } from '../types/game';

// Board scale derives from device + safe-area insets; pin it so layout maths are 1:1.
jest.mock('../components/board/useBoardScale', () => ({ useBoardScale: () => 1 }));

const TWO_PLAYER: GameConfig = { playerNames: ['Alice', 'Bob'], deckMode: 'first151', passAndPlay: false };

function setupDiscarding(tokens: Partial<Record<TokenType, number>>) {
  useGameStore.getState().initGame(TWO_PLAYER);
  const g = useGameStore.getState().game!;
  const idx = g.currentPlayerIndex;
  const players = g.players.map((p, i) => (i === idx ? { ...p, energyTokens: tokens } : p));
  const discardTokens = jest.fn();
  useGameStore.setState({
    game: { ...g, phase: 'discarding', players },
    discardTokens,
    advanceTurn: jest.fn(),
  });
  return discardTokens;
}

beforeEach(() => useGameStore.setState({ game: null }));

test('renders nothing outside the discarding phase', () => {
  useGameStore.getState().initGame(TWO_PLAYER); // phase: playing
  render(<TokenDiscardModal />);
  expect(screen.queryByText('Token limit reached')).toBeNull();
});

test('shows the over-limit count and disables Done while over 10', () => {
  setupDiscarding({ Fire: 6, Water: 6 }); // holding 12
  render(<TokenDiscardModal />);
  expect(screen.getByText('Token limit reached')).toBeTruthy();
  expect(screen.getByText('2 over the limit')).toBeTruthy();
  expect(screen.getByText('Done')).toBeDisabled();
});

test('returning tokens to ≤10 flips the copy, enables Done, and discards the net selection', () => {
  const discardTokens = setupDiscarding({ Fire: 6, Water: 6 });
  render(<TokenDiscardModal />);

  fireEvent.press(screen.getByText('Fire'));
  fireEvent.press(screen.getByText('Fire')); // holding now 10

  expect(screen.getByText(/under the limit/)).toBeTruthy();
  expect(screen.getByText('Done')).toBeEnabled();

  fireEvent.press(screen.getByText('Done'));
  expect(discardTokens).toHaveBeenCalledWith({ Fire: 2 });
});

test('Reset appears once dirty and restores the held tokens', () => {
  setupDiscarding({ Fire: 6, Water: 6 });
  render(<TokenDiscardModal />);

  expect(screen.queryByText('↩ Reset')).toBeNull();
  fireEvent.press(screen.getByText('Fire'));
  expect(screen.getByText('↩ Reset')).toBeTruthy();

  fireEvent.press(screen.getByText('↩ Reset'));
  expect(screen.queryByText('↩ Reset')).toBeNull();
  expect(screen.getByText('2 over the limit')).toBeTruthy();
});
