import { useGameStore } from '../store/useGameStore';
import { AIDifficulty, GameConfig } from '../types/game';
import { getGreedyMove } from '../ai/greedy';
import { getHeuristicMove } from '../ai/heuristic';
import { getAIDiscard } from '../ai/utils';
import { currentPlayer } from '../store/selectors';
import { PHASE } from '../constants';

// Solo with N seats = 1 human + (N-1) AI rivals, as the setup screen builds it.
function soloConfig(seats: number, aiDifficulty: AIDifficulty): GameConfig {
  return {
    playerNames: ['You', ...Array.from({ length: seats - 1 }, (_, k) => `Rival ${k + 1}`)],
    deckMode: 'first151',
    passAndPlay: false,
    aiPlayerIndices: Array.from({ length: seats - 1 }, (_, k) => k + 1),
    aiDifficulty,
  };
}

// Mirror of GameBoardScreen's AI turn loop, run synchronously over every seat
// until the game ends. Returns how many turns were taken.
function playToCompletion(maxTurns = 2000): number {
  const store = useGameStore.getState();
  let turns = 0;

  while (useGameStore.getState().game!.phase !== PHASE.GAME_OVER && turns < maxTurns) {
    const g = useGameStore.getState().game!;
    const difficulty = g.config.aiDifficulty ?? 'greedy';
    const getMove = difficulty === 'heuristic' ? getHeuristicMove : getGreedyMove;

    store.dispatchAction(getMove(g));
    store.advanceTurn();

    // Over the token cap: discard down, then commit the turn.
    const afterAdvance = useGameStore.getState().game!;
    if (afterAdvance.phase === PHASE.DISCARDING) {
      store.discardTokens(getAIDiscard(currentPlayer(afterAdvance)));
      store.advanceTurn();
    }
    turns += 1;
  }
  return turns;
}

beforeEach(() => {
  useGameStore.setState({ game: null });
});

describe('Solo multi-AI setup', () => {
  it('Solo with 4 seats creates 1 human + 3 AI rivals', () => {
    useGameStore.getState().initGame(soloConfig(4, 'heuristic'));
    const players = useGameStore.getState().game!.players;

    expect(players.map(p => p.isAI)).toEqual([false, true, true, true]);
    expect(players[0].name).toBe('You');
    expect(players.slice(1).map(p => p.name)).toEqual(['Rival 1', 'Rival 2', 'Rival 3']);
    expect(useGameStore.getState().game!.config.aiDifficulty).toBe('heuristic');
  });

  it('drives consecutive AI turns through dispatchAction to a finished game (greedy)', () => {
    useGameStore.getState().initGame(soloConfig(4, 'greedy'));

    const turns = playToCompletion();

    expect(useGameStore.getState().game!.phase).toBe(PHASE.GAME_OVER);
    // Far more than one lap of the table — proves seats 1/2/3 took consecutive AI turns.
    expect(turns).toBeGreaterThan(4);
  });

  it('drives a finished game with the heuristic AI too', () => {
    useGameStore.getState().initGame(soloConfig(3, 'heuristic'));

    playToCompletion();

    expect(useGameStore.getState().game!.phase).toBe(PHASE.GAME_OVER);
  });
});
