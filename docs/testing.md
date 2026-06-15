# Testing

Two kinds of tests live in `src/__tests__/`:

- **Logic / engine tests** (`*.test.ts`) — the bulk of the suite. Pure functions and the Zustand store (selectors, token rules, turn loop, AI, catch/scout/train). No rendering.
- **Component tests** (`*.test.tsx`) — React Native Testing Library (RNTL) render tests for UI components, currently the board modals.

## Running

```bash
npm test                       # full suite
npm run test:watch             # watch mode
npx jest CatchMewModal         # one file / pattern
npx tsc --noEmit               # type-check (separate from jest)
```

Node 20 is required (`source ~/.nvm/nvm.sh && nvm use 20`).

## Stack

- **Preset:** `jest-expo` (handles RN/Expo Babel transforms and `transformIgnorePatterns`).
- **Component tests:** `@testing-library/react-native` 13 + `react-test-renderer` 19 (matches React 19). RNTL 13 auto-extends Jest with its matchers (`toBeDisabled`, `toBeEnabled`, …) — no extra import needed.
- **`testMatch`:** `**/__tests__/**/*.test.ts` and `*.test.tsx`.

## Global setup — `jest.setup.js`

Registered via `jest.setupFilesAfterEnv`. It mocks two native modules at the boundary so components render synchronously in Node:

- **`react-native-reanimated`** → no-op JS (shared values, `useAnimatedStyle`, `withTiming/withRepeat/withSequence`, `cancelAnimation`). The Babel worklet transform only invokes these when called, so a plain mock is enough for render/interaction tests. Needed by `CatchMewModal` (the Mew wiggle).
- **`@react-native-async-storage/async-storage`** → the package's in-memory jest mock. Used by `ThemeProvider`/persistence if a component pulls them in.

These mocks are harmless to the logic tests (which don't touch either module).

## Component-test conventions

Mock at the **boundaries**, not the component under test. Assert on visible copy and callbacks, not on layout geometry or network.

| Dependency | How it's handled | Why |
|------------|------------------|-----|
| `ArtworkImage` | `jest.mock(...)` → renders `null` | Sprites load async from the PokeAPI CDN; irrelevant to behavior |
| `useBoardScale` | `jest.mock(...)` → returns `1` | Derives from device size + safe-area insets; pin it so `z(n)` is 1:1 |
| `useTheme` | no provider needed | `ThemeContext` defaults to theme A, so unwrapped components render themed |
| `useToast` | no provider needed | Context defaults to a no-op |
| Game store | drive the real store | `initGame(config)` for a valid `GameState`, then `setState` to set `phase`/tokens; inject `jest.fn()` for actions (`discardTokens`, `advanceTurn`) to assert calls without engine side effects |

### Patterns

- **Find by what the user sees:** `getByText('Ready to train')`, `getByText('2 over the limit')`, `getByText(/under the limit/)`.
- **Disabled state:** assert with `toBeDisabled()` / `toBeEnabled()`. `fireEvent.press` does not invoke handlers on disabled elements, so a disabled button's `onPress` spy stays uncalled.
- **Interaction:** `fireEvent.press(getByText(label))` bubbles to the nearest pressable ancestor — e.g. pressing a card's name text triggers the wrapping `BoardCard`'s `onPress`.

### Example: store-driven modal

```ts
function setupDiscarding(tokens) {
  useGameStore.getState().initGame(TWO_PLAYER);
  const g = useGameStore.getState().game!;
  const players = g.players.map((p, i) =>
    i === g.currentPlayerIndex ? { ...p, energyTokens: tokens } : p);
  const discardTokens = jest.fn();
  useGameStore.setState({ game: { ...g, phase: 'discarding', players }, discardTokens, advanceTurn: jest.fn() });
  return discardTokens; // assert toHaveBeenCalledWith(...) after interaction
}
```

## On TDD

The board-modal component tests were added **after** the components existed (characterization / regression guards), because the project had no RN render harness at the time. Now that the harness exists, **new modal/UI work should go test-first.** Engine and pure-logic changes already follow TDD.
