# Lessons Learned

Findings from the staff engineer review of the initial implementation. Bugs fixed in-place; this file captures what to watch for going forward.

---

## Bugs Fixed

### 1. `catchMew` ignored `mew.legendariesRequired`

**File:** `src/store/useGameStore.ts`

The eligibility threshold was hardcoded to `2` instead of reading `game.board.mew.legendariesRequired`. The field exists in both the type and the data file, so a change to the JSON would have been silently ignored.

**Fix:** `player.legendaries.length < game.board.mew.legendariesRequired`

**Rule:** If a value is stored in state, read it from state — don't re-hardcode it in the action.

---

### 2. `discardTokens` had no action guards

**File:** `src/store/useGameStore.ts`

Unlike every other action, `discardTokens` didn't guard against `pendingHandoff` or `gameOver`. Tokens could be silently moved back to supply after the game ended or during a pass-and-play handoff.

**Fix:** Added `pendingHandoff` and `gameOver` guards, consistent with all other actions.

---

### 3. Dead variable `totalTaking` in `takeTokens`

**File:** `src/store/useGameStore.ts`

`totalTaking` was computed but never read. Leftover from an earlier draft.

---

### 4. `buildDecks` used `string` instead of `DeckMode`

**File:** `src/store/useGameStore.ts`

The parameter type was too loose. The TypeScript compiler couldn't catch callers passing an invalid deck mode string. Changed to `DeckMode` so the type system enforces valid values.

---

### 5. `newScouted.splice(...)` mutated a copied array (style)

**File:** `src/store/useGameStore.ts`

`splice` mutates the array it's called on. Even though `newScouted` was a copy (safe), it was inconsistent with the immutable filter/map pattern used everywhere else in the store. Changed to `.filter((_, i) => i !== scoutedIdx)` for consistency.

---

## Known Issue (resolved in Third Review)

### `discardTokens` always restores to `'playing'`, not previous phase

See Bug #10 in the Third Review section below.

---

## Design Improvements

### DRY scout logic via `applyDittoGrant` helper

`scoutFaceUp` and `scoutFromDeck` shared ~25 lines of identical Ditto-grant and phase-transition logic. Extracted into `applyDittoGrant(player, dittoInSupply)` to ensure both paths stay consistent when the Ditto logic changes (e.g., supply cap, future Ditto mechanics).

---

## Testing Gaps Filled

| Gap | File | Why it matters |
|-----|------|----------------|
| `discardTokens` rejects `pendingHandoff`/`gameOver` | `takeTokens.test.ts` | Guards are only valuable if tested |
| 3-player final round lasts the full lap | `turnLoop.test.ts` | 2-player tests don't exercise the `next !== triggerIndex` multi-lap logic |
| `catchMew` respects `mew.legendariesRequired` | `catchMew.test.ts` | The whole point of the fix is testability — verify it actually reads the field |

---

# Lessons Learned — Second Review (Post-Core Cleanup)

Findings from the staff engineer review of the refactored implementation. All items below were fixed.

---

## Bugs Fixed

### 6. `advanceTurn` allowed silent pass with no action taken

**File:** `src/store/useGameStore.ts`

Nothing prevented a player from calling `advanceTurn` without having taken any action (no tokens, no card, no scout). The `discarding` guard existed but there was no "action taken" gate.

**Fix:** Added `actionTakenThisTurn: boolean` to `GameState`. Every real action sets it `true`; `advanceTurn` checks it and resets it. `discardTokens` (cleanup, not an action) does not set it.

**Rule:** Model the game's turn contract in state, not just in documentation. If the rule is "one action per turn," enforce it in code.

---

### 7. Token type casts bypassed the type system

**File:** `src/store/useGameStore.ts`

`trainCard` and `discardTokens` cast token maps to `Record<string, number>` to iterate them, losing type safety on key access. The casts existed because `Object.entries()` always returns `[string, ...]`, but the fix is to cast the entries, not the object.

**Fix:** `Object.entries(card.cost) as [EnergyType, number][]` and `Object.entries(tokens) as [TokenType, number][]`. Combined with the new `TokenType = EnergyType | 'Ditto'` alias, all token access is now type-safe with no `as Record<string, number>` escape hatches.

**Rule:** Cast at the `Object.entries()` call site, not on the object. Casting the object silently kills all downstream type safety.

---

### 8. `CardCost` included `'Ditto'` as a possible key

**File:** `src/types/game.ts`

`CardCost` was typed as `Partial<Record<EnergyType | 'Ditto', number>>`. Cards in Splendor-style games have costs in energy types; Ditto is a payment mechanism only. The wider type was misleading and caused the `Record<string, number>` cast in `trainCard` (see #7 above).

**Fix:** `CardCost = Partial<Record<EnergyType, number>>`. Ditto is now only in `TokenType`, not in cost definitions.

---

### 9. Spreading `Partial<T>` as a function parameter does not override like an inline computed property

**File:** `src/store/gameRules.ts`

`applyScout` accepted a `boardPatch: Partial<BoardState>` and spread it into the returned board:

```typescript
board: { ...game.board, ...boardPatch, energySupply: ... }
```

The intent was that `boardPatch = { [faceKey]: newFace, [deckKey]: newDeck }` would override those two keys. In practice the override did not apply — the board came back unchanged — causing the scout test to fail.

The root cause wasn't fully diagnosed (likely a ts-jest / Babel interaction with optional-typed spreads), but the fix is unambiguous: **construct the full `BoardState` before passing it**. The helper now receives a complete `BoardState`, not a partial patch.

```typescript
// Before (broken):
set({ game: applyScout(game, idx, card, { [faceKey]: newFace, [deckKey]: newDeck }) });

// After (correct):
const updatedBoard = { ...game.board, [faceKey]: newFace, [deckKey]: newDeck };
set({ game: applyScout(game, idx, card, updatedBoard) });
```

**Rule:** Prefer passing complete objects to helper functions over partial patches. Partial patches are fragile — the recipient has to know which fields to override and the spread order matters. Constructing the full object at the call site makes the intent explicit and avoids subtle spread-ordering bugs.

---

## Design Improvements

### Game logic extracted to `gameRules.ts`

All pure helper functions (`totalTokens`, `claimLegendaries`, `shuffle`, `buildDecks`, `makePlayer`, `applyDittoGrant`, `applyScout`) moved out of the store into `src/store/gameRules.ts`. The store is now a thin layer that calls these functions and updates state. Pure functions are testable in isolation and easier to reason about.

### `aiFlags` removed from `GameConfig`

The field existed but was never read outside of `makePlayer`, and AI is not implemented. Dead configuration is a maintenance hazard — readers assume any field in a config struct is meaningful. Removed entirely; `PlayerState.isAI` is kept for when AI is implemented.

### Sound preference persistence moved to `App.tsx`

Importing `AsyncStorage` into the store would have required all store-importing tests to mock it. Persistence belongs at the app boundary, not in state management. `App.tsx` now loads and saves `soundEnabled` via AsyncStorage; the store remains a pure, sync, mockable state container.

### Selectors added for domain queries

`canAfford`, `canClaimLegendary`, `canCatchMew` added to `selectors.ts`. Previously these were only computed inline inside store actions. UI components checking button enable/disable state would have had to duplicate the logic.

---

## Testing Gaps Filled

| Gap | File | Why it matters |
|-----|------|----------------|
| `advanceTurn` throws when no action was taken | `gameStore.test.ts` | The whole point of the enforcement is that it's enforced |
| `initGame` rejects 0 or 5+ players | `gameStore.test.ts` | Boundary validation is only useful if tested at the boundary |
| `scoutFaceUp` throws if card not face-up | `scoutCard.test.ts` | The guard existed but was untested; bugs in the findIndex path would have been invisible |
| Scout 3 → train 1 → scout 4th succeeds | `scoutCard.test.ts` | The cap is per-hand, not per-game; training must clear the slot |
| 4-player final round wraps correctly | `turnLoop.test.ts` | 2- and 3-player tests don't exercise all wrap-around cases |
| Second player blocked after Mew caught | `catchMew.test.ts` | Mew is a global singleton; concurrent attempts needed an explicit test |
| Multi-legendary in one `trainCard` gives exactly 1 MasterBall | `legendaryCollection.test.ts` | The once-per-game MasterBall rule had no test for the multi-claim edge case |

---

# Lessons Learned — Third Review (Bug Fixes + Constants)

Findings from the staff engineer review of the second implementation. All items below were fixed.

---

## Bugs Fixed

### 10. `discardTokens` always snapped phase back to `'playing'`

**File:** `src/store/useGameStore.ts`

If a player entered `'discarding'` during `'finalRound'` (took tokens that pushed them over 10 during the final round), `discardTokens` would restore phase to `'playing'` instead of `'finalRound'`. The `advanceTurn` check `if (phase === 'finalRound' && next === finalRoundTriggerPlayerIndex)` would never fire again, making `gameOver` unreachable — the game would loop forever.

The same pattern existed in `applyScout` (the Ditto grant from scouting could also push a player over 10 during final round).

**Fix:** Use `finalRoundTriggerPlayerIndex !== null` as the discriminator to determine which phase to restore to:

```ts
const restoredPhase = game.finalRoundTriggerPlayerIndex !== null ? PHASE.FINAL_ROUND : PHASE.PLAYING;
const newPhase = totalTokens(newTokens) <= MAX_TOKENS ? restoredPhase : PHASE.DISCARDING;
```

`finalRoundTriggerPlayerIndex` is already set when the final round starts and never cleared until `gameOver`, making it a reliable proxy for "were we in final round before discarding?"

**Rule:** When a phase transition overwrites a prior phase value, you must be able to recover the prior phase. Either store it explicitly (`priorPhase`) or use an existing invariant that encodes the same information.

---

### 11. `discardTokens` was callable outside `'discarding'` phase

**File:** `src/store/useGameStore.ts`

`discardTokens` had guards for `pendingHandoff` and `gameOver` but not for the case where `phase !== 'discarding'`. A player in `'playing'` or `'finalRound'` phase could call `discardTokens` to return tokens to the supply for free, without spending their turn action (`actionTakenThisTurn` is never set by `discardTokens`).

**Fix:** Added `if (game.phase !== PHASE.DISCARDING) throw new Error('No discard required')` after the `gameOver` check. The `gameOver` check is kept first so it produces a clear error message.

**Rule:** Every store action should validate that the game is in a state where the action is legal, not just that it won't crash.

---

## Design Improvements

### Constants extracted to `src/constants.ts`

Magic numbers and strings (`10`, `4`, `3`, `7`, `5`, `20`, `0.40`, `'playing'`, etc.) were scattered across `useGameStore.ts` and `gameRules.ts`. Extracted to a single file with named constants: `MAX_TOKENS`, `FACE_UP_COUNT`, `SCOUT_HAND_LIMIT`, `MIN/MAX_PLAYERS`, `INITIAL_ENERGY_SUPPLY`, `INITIAL_DITTO_SUPPLY`, `MIN_SUPPLY_FOR_TAKE_TWO`, `TP_TRIGGER_THRESHOLD`, `MEWTWO_POKEDEX_NUMBER`, `MEWTWO_CATCH_BONUS`, `BASE_CATCH_RATES`, and the `PHASE` object.

`PHASE` uses `as const` so its values retain their literal types and remain assignable to `GamePhase` without casting.

### `GamePhase` type alias added to `src/types/game.ts`

The `'playing' | 'discarding' | 'finalRound' | 'gameOver'` union was inlined directly in `GameState`. Extracted to `export type GamePhase` so it can be used in function signatures and local variable annotations without repeating the union.

### `applyDittoGrant` inlined into `applyScout`

`applyDittoGrant` was a named helper called exactly once, inside `applyScout`. The extra function boundary added indirection (a returned object, a destructuring) for 4 lines of arithmetic. Per the project's simplicity principle — no abstraction for single-use code — it was inlined.

### `tierFaceKey` / `tierDeckKey` helpers in `gameRules.ts`

The pattern `(['tier1Face', 'tier2Face', 'tier3Face'] as const)[tier - 1]` appeared 6 times across three actions in `useGameStore.ts` (`trainCard`, `scoutFaceUp`, `scoutFromDeck`). Extracted to two small exported helpers. Eliminates the transcription risk if tier count ever changes and makes each call site a readable one-liner.

---

## Testing Gaps Filled

| Gap | File | Why it matters |
|-----|------|----------------|
| `discardTokens` during `finalRound` restores `finalRound`, not `'playing'` | `turnLoop.test.ts` | The critical endgame bug was reachable and untested; without the test the fix can regress silently |
| `discardTokens` throws when called outside `'discarding'` phase | `takeTokens.test.ts` | Guards are only valuable if tested — this one was missing entirely |
