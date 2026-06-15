import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CatchMewModal, { CatchBall } from '../components/CatchMewModal';

jest.mock('../components/board/ArtworkImage', () => ({ __esModule: true, default: () => null }));

const BALLS: CatchBall[] = [
  { tier: 'GreatBall', count: 2, pct: 65 },
  { tier: 'UltraBall', count: 1, pct: 85 },
];

const base = {
  visible: true as const,
  phase: 'select' as const,
  caught: false,
  selectedBall: null,
  balls: BALLS,
  scale: 1,
  onPickBall: () => {},
  onThrow: () => {},
  onClose: () => {},
};

test('renders nothing when not visible', () => {
  render(<CatchMewModal {...base} visible={false} />);
  expect(screen.queryByText('Catch Mew!')).toBeNull();
});

test('select phase lists each available ball with its rate and count', () => {
  render(<CatchMewModal {...base} />);
  expect(screen.getByText('Catch Mew!')).toBeTruthy();
  expect(screen.getByText('Great Ball')).toBeTruthy();
  expect(screen.getByText('65%')).toBeTruthy();
  expect(screen.getByText('2 available')).toBeTruthy();
  expect(screen.getByText('Ultra Ball')).toBeTruthy();
  expect(screen.getByText('85%')).toBeTruthy();
});

test('tapping a ball calls onPickBall with its tier', () => {
  const onPickBall = jest.fn();
  render(<CatchMewModal {...base} onPickBall={onPickBall} />);
  fireEvent.press(screen.getByText('Great Ball'));
  expect(onPickBall).toHaveBeenCalledWith('GreatBall');
});

test('throw button is inert until a ball is selected, then fires onThrow', () => {
  const onThrow = jest.fn();
  const { rerender } = render(<CatchMewModal {...base} onThrow={onThrow} selectedBall={null} />);
  // No ball picked: button reads "Pick a ball" and is disabled.
  fireEvent.press(screen.getByText('Pick a ball'));
  expect(onThrow).not.toHaveBeenCalled();

  rerender(<CatchMewModal {...base} onThrow={onThrow} selectedBall="GreatBall" />);
  fireEvent.press(screen.getByText('Throw Great Ball!'));
  expect(onThrow).toHaveBeenCalled();
});

test('"Not now" calls onClose', () => {
  const onClose = jest.fn();
  render(<CatchMewModal {...base} onClose={onClose} />);
  fireEvent.press(screen.getByText('Not now'));
  expect(onClose).toHaveBeenCalled();
});

test('throwing phase shows the shaking message', () => {
  render(<CatchMewModal {...base} phase="throwing" selectedBall="GreatBall" />);
  expect(screen.getByText('The ball is shaking…')).toBeTruthy();
  expect(screen.queryByText('Catch Mew!')).toBeNull();
});

test('result phase shows the caught message and Continue closes', () => {
  const onClose = jest.fn();
  render(<CatchMewModal {...base} phase="result" caught onClose={onClose} />);
  expect(screen.getByText('Gotcha! Mew was caught!')).toBeTruthy();
  fireEvent.press(screen.getByText('Continue'));
  expect(onClose).toHaveBeenCalled();
});

test('result phase shows the escaped message on a failed throw', () => {
  render(<CatchMewModal {...base} phase="result" caught={false} />);
  expect(screen.getByText('Oh no! Mew escaped!')).toBeTruthy();
});
