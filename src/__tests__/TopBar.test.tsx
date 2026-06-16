import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import TopBar from '../components/board/TopBar';
import { useGameStore } from '../store/useGameStore';
import { GameConfig } from '../types/game';

jest.mock('../components/board/ArtworkImage', () => ({ __esModule: true, default: () => null }));
// Vector-icons loads a font async (the home icon) and warns about late setState in tests.
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

const TWO_PLAYER: GameConfig = { playerNames: ['Alice', 'Bob'], deckMode: 'first151', passAndPlay: false, aiPlayerIndices: [1] };

function setup() {
  useGameStore.getState().initGame(TWO_PLAYER);
  return useGameStore.getState().game!;
}

test('tapping an opponent fires onInspectOpponent with that player and avatar dex', () => {
  const game = setup();
  const onInspectOpponent = jest.fn();
  render(
    <TopBar game={game} scale={1} onMewPress={() => {}} onHome={() => {}} onInspectOpponent={onInspectOpponent} />,
  );

  // Alice is the current player; only the opponent (Bob) is shown in the opponent strip.
  expect(screen.queryByText('Alice')).toBeNull();
  fireEvent.press(screen.getByText('Bob'));

  expect(onInspectOpponent).toHaveBeenCalledTimes(1);
  expect(onInspectOpponent).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'Bob', isAI: true }),
    150, // AI_AVATAR_DEX[0]
  );
});
