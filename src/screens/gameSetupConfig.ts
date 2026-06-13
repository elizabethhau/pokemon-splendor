import { AIDifficulty, GameConfig } from '../types/game';

export type SetupMode = 'solo' | 'pass';
export type SetupDifficulty = 'easy' | 'normal';

// Builds the GameConfig the setup screen feeds to initGame. Solo = 1 human +
// (players-1) AI rivals; Pass & Play = `players` humans. Kept pure so the
// mapping (difficulty, rival naming, AI seat indices) is unit-testable.
export function buildGameConfig(
  mode: SetupMode,
  players: number,
  difficulty: SetupDifficulty,
  names: string[],
): GameConfig {
  const aiDifficulty: AIDifficulty = difficulty === 'easy' ? 'greedy' : 'heuristic';

  if (mode === 'solo') {
    const humanName = (names[0] ?? '').trim() || 'You';
    const rivalCount = players - 1;
    const rivalNames = Array.from({ length: rivalCount }, (_, k) =>
      rivalCount === 1 ? 'Rival' : `Rival ${k + 1}`
    );
    return {
      playerNames: [humanName, ...rivalNames],
      deckMode: 'first151',
      passAndPlay: false,
      aiPlayerIndices: rivalNames.map((_, k) => k + 1), // seats 1..players-1 are AI
      aiDifficulty,
    };
  }

  return {
    playerNames: names.slice(0, players).map((n, i) => (n ?? '').trim() || `Player ${i + 1}`),
    deckMode: 'first151',
    passAndPlay: true,
    aiPlayerIndices: undefined,
    aiDifficulty: undefined,
  };
}
