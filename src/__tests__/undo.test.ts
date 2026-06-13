import { useGameStore } from '../store/useGameStore';
import { GameConfig } from '../types/game';
import { givePlayerTokens } from './helpers';

const TWO_PLAYER: GameConfig = {
  playerNames: ['Alice', 'Bob'],
  deckMode: 'first151', passAndPlay: false,
};

beforeEach(() => {
  useGameStore.setState({ game: null, undoSnapshot: null });
  useGameStore.getState().initGame(TWO_PLAYER);
});

test('undo after takeTokens restores player tokens and supply exactly', () => {
  const before = useGameStore.getState().game!;

  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  expect(useGameStore.getState().undoSnapshot).not.toBeNull();

  useGameStore.getState().undoAction();
  const after = useGameStore.getState().game!;

  expect(after).toEqual(before);
  expect(after.actionTakenThisTurn).toBe(false);
  expect(useGameStore.getState().undoSnapshot).toBeNull();
});

test('undoAction throws when there is nothing to undo', () => {
  expect(() => useGameStore.getState().undoAction()).toThrow('Nothing to undo');
});

test('starting a new game clears any stale snapshot from the previous game', () => {
  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  expect(useGameStore.getState().undoSnapshot).not.toBeNull();

  useGameStore.getState().initGame(TWO_PLAYER);
  expect(useGameStore.getState().undoSnapshot).toBeNull();
});

test('undo after trainCard restores board, tokens, bonuses, and pokeballs exactly', () => {
  const card = useGameStore.getState().game!.board.tier1Face[0];
  givePlayerTokens({ [card.energyType]: 5, Ditto: 5 });
  const before = useGameStore.getState().game!;

  useGameStore.getState().trainCard(card);
  expect(useGameStore.getState().game!.players[0].trainedCards).toHaveLength(1);

  useGameStore.getState().undoAction();
  expect(useGameStore.getState().game!).toEqual(before);
});

test('undo after scoutFaceUp restores the hand, face slot, and Ditto exactly', () => {
  const card = useGameStore.getState().game!.board.tier1Face[0];
  const before = useGameStore.getState().game!;

  useGameStore.getState().scoutFaceUp(card);
  expect(useGameStore.getState().game!.players[0].scoutedCards).toHaveLength(1);

  useGameStore.getState().undoAction();
  expect(useGameStore.getState().game!).toEqual(before);
});

test('ending the turn clears the snapshot — the action is committed', () => {
  useGameStore.getState().takeTokens({ Fire: 1, Water: 1, Grass: 1 });
  useGameStore.getState().advanceTurn();
  expect(useGameStore.getState().undoSnapshot).toBeNull();
  expect(() => useGameStore.getState().undoAction()).toThrow('Nothing to undo');
});

test('irreversible actions leave nothing to undo', () => {
  useGameStore.getState().scoutFromDeck(1);
  expect(useGameStore.getState().undoSnapshot).toBeNull();
});

test('training a face-up card leaves the slot empty until the turn commits', () => {
  const card = useGameStore.getState().game!.board.tier1Face[0];
  givePlayerTokens({ [card.energyType]: 5, Ditto: 5 });
  const deckBefore = useGameStore.getState().game!.board.tier1Deck.length;

  useGameStore.getState().trainCard(card);
  let board = useGameStore.getState().game!.board;
  expect(board.tier1Face).toHaveLength(3); // no refill yet — next card stays hidden
  expect(board.tier1Deck).toHaveLength(deckBefore);

  useGameStore.getState().advanceTurn();
  board = useGameStore.getState().game!.board;
  expect(board.tier1Face).toHaveLength(4);
  expect(board.tier1Deck).toHaveLength(deckBefore - 1);
});

test('taking past 10 tokens no longer forces an immediate discard — the take stays undoable', () => {
  givePlayerTokens({ Fire: 3, Water: 3, Grass: 3 });
  useGameStore.getState().takeTokens({ Electric: 1, Psychic: 1, Fire: 1 });

  expect(useGameStore.getState().game!.phase).toBe('playing');

  useGameStore.getState().undoAction();
  const player = useGameStore.getState().game!.players[0];
  expect(player.energyTokens.Electric).toBeUndefined();
  expect(player.energyTokens.Fire).toBe(3);
});

test('the >10-token discard triggers at End Turn; after discarding the turn advances', () => {
  givePlayerTokens({ Fire: 3, Water: 3, Grass: 3 });
  useGameStore.getState().takeTokens({ Electric: 1, Psychic: 1, Fire: 1 });

  useGameStore.getState().advanceTurn();
  let game = useGameStore.getState().game!;
  expect(game.phase).toBe('discarding');
  expect(game.currentPlayerIndex).toBe(0); // turn did not advance
  expect(game.turnNumber).toBe(1);

  useGameStore.getState().discardTokens({ Fire: 1, Water: 1 });
  expect(useGameStore.getState().game!.phase).toBe('playing');

  useGameStore.getState().advanceTurn();
  game = useGameStore.getState().game!;
  expect(game.currentPlayerIndex).toBe(1);
  expect(game.turnNumber).toBe(2);
});

test('face-up scout also defers the slot refill to turn commit', () => {
  const card = useGameStore.getState().game!.board.tier2Face[0];
  const deckBefore = useGameStore.getState().game!.board.tier2Deck.length;

  useGameStore.getState().scoutFaceUp(card);
  expect(useGameStore.getState().game!.board.tier2Face).toHaveLength(3);
  expect(useGameStore.getState().game!.board.tier2Deck).toHaveLength(deckBefore);

  useGameStore.getState().advanceTurn();
  expect(useGameStore.getState().game!.board.tier2Face).toHaveLength(4);
  expect(useGameStore.getState().game!.board.tier2Deck).toHaveLength(deckBefore - 1);
});
