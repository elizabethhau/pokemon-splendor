# Lessons Learned — Core Game Implementation (Issues #1–#9)

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

## Known Issue (not fixed — out of scope)

### `discardTokens` always restores to `'playing'`, not previous phase

**File:** `src/store/useGameStore.ts`

If a player enters `'discarding'` from `'finalRound'` (takes tokens that push them over 10 during the final round), `discardTokens` restores phase to `'playing'` instead of `'finalRound'`. This means `advanceTurn` would not detect that the game was already in final round and could fail to trigger `gameOver` at the right time.

**Root cause:** `'discarding'` overwrites the previous phase with no memory of what it was. Fix requires tracking `priorPhase` in `GameState` or making `'discarding'` a separate flag rather than a phase value.

**When to fix:** Before shipping if playtesting confirms the scenario is reachable (e.g., player in final round takes 3 tokens over 10). Low priority in Phase 1 since most players won't accumulate 10+ tokens in final round.

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
