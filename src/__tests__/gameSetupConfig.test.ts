import { buildGameConfig } from '../screens/gameSetupConfig';

describe('buildGameConfig — solo vs AI', () => {
  it('2 players: 1 human + 1 rival named "Rival"', () => {
    const c = buildGameConfig('solo', 2, 'normal', ['Ash']);
    expect(c.playerNames).toEqual(['Ash', 'Rival']);
    expect(c.aiPlayerIndices).toEqual([1]);
    expect(c.passAndPlay).toBe(false);
    expect(c.deckMode).toBe('first151');
  });

  it('4 players: 1 human + 3 numbered rivals on seats 1..3', () => {
    const c = buildGameConfig('solo', 4, 'normal', ['Ash']);
    expect(c.playerNames).toEqual(['Ash', 'Rival 1', 'Rival 2', 'Rival 3']);
    expect(c.aiPlayerIndices).toEqual([1, 2, 3]);
  });

  it('blank human name falls back to "You"; whitespace is trimmed', () => {
    expect(buildGameConfig('solo', 2, 'normal', ['   ']).playerNames[0]).toBe('You');
    expect(buildGameConfig('solo', 2, 'normal', [' Ash ']).playerNames[0]).toBe('Ash');
    expect(buildGameConfig('solo', 2, 'normal', []).playerNames[0]).toBe('You');
  });

  it('maps Easy → greedy and Normal → heuristic', () => {
    expect(buildGameConfig('solo', 2, 'easy', ['Ash']).aiDifficulty).toBe('greedy');
    expect(buildGameConfig('solo', 2, 'normal', ['Ash']).aiDifficulty).toBe('heuristic');
  });
});

describe('buildGameConfig — pass & play', () => {
  it('uses every entered name, no AI, handoff enabled', () => {
    const c = buildGameConfig('pass', 3, 'normal', ['A', 'B', 'C', 'D']);
    expect(c.playerNames).toEqual(['A', 'B', 'C']);
    expect(c.aiPlayerIndices).toBeUndefined();
    expect(c.aiDifficulty).toBeUndefined();
    expect(c.passAndPlay).toBe(true);
  });

  it('blank names fall back to "Player N"; whitespace is trimmed', () => {
    const c = buildGameConfig('pass', 3, 'normal', ['  ', ' Bob ', '']);
    expect(c.playerNames).toEqual(['Player 1', 'Bob', 'Player 3']);
  });

  it('difficulty is dropped even when set in the UI', () => {
    expect(buildGameConfig('pass', 2, 'easy', ['A', 'B']).aiDifficulty).toBeUndefined();
  });
});
