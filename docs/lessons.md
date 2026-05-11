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

---

# Lessons Learned — Fourth Review (One-Action Enforcement + Selector Cleanup)

Findings from the staff engineer review of the third implementation. All items below were fixed.

---

## Bugs Fixed

### 12. One action per turn was not enforced at the action level

**Files:** `src/store/useGameStore.ts` (all five action handlers)

`design.md` states: *"Each turn, a player takes exactly one of five actions."* The code enforced the minimum (at least one action before advancing via `actionTakenThisTurn`) but not the maximum. Nothing prevented a player from calling `takeTokens` and then `trainCard` in the same turn, or scouting three times before advancing.

**Fix:** Added `if (game.actionTakenThisTurn) throw new Error('Action already taken this turn')` to `takeTokens`, `trainCard`, `scoutFaceUp`, `scoutFromDeck`, and `catchMew`. `discardTokens` and `acknowledgeHandoff` are not actions and correctly do not set `actionTakenThisTurn`.

**Rule:** If the game contract says "exactly one," enforce it at both ends — minimum (can't skip) and maximum (can't double-dip). `actionTakenThisTurn` was only ever checking the minimum.

---

### 13. `trainCard.test.ts` Test 3 was a flaky test

**File:** `src/__tests__/trainCard.test.ts`

Test 3 ("training a scouted card removes it from scoutedCards") injected BULBASAUR (#1) into the player's scouted hand, then called `trainCard(BULBASAUR)`. If the game's shuffle had put BULBASAUR into `tier1Face` (probability ≈ 4/70 ≈ 6%), `trainCard` would find `faceIdx !== -1` and take the face path instead, leaving the scouted copy unremoved — causing the test to fail.

This was a pre-existing flaky test, exposed by the one-action guard which changed test isolation in this run.

**Fix:** Replaced BULBASAUR with a card bearing pokedex number `9999` — a value that cannot appear in any shuffled deck, guaranteeing `faceIdx === -1` and forcing the scouted path every time.

**Rule:** Tests that exercise a specific code path (scouted vs face-up) must ensure that path is taken deterministically. Don't rely on real game data cards when what you need is "a card that isn't on the board."

---

## Design Improvements

### `canClaimLegendary` now delegates to `claimLegendaries`

**File:** `src/store/selectors.ts`

`canClaimLegendary(player, legendary)` and `claimLegendaries(typeBonuses, available)` implemented the same predicate independently. If the claim condition ever changed (e.g., a requirement threshold tweak), both would need updating in sync.

`canClaimLegendary` now delegates: `return claimLegendaries(player.typeBonuses, [legendary]).length > 0`. Single source of truth.

### `dittoAvailable` decrement pattern in `canAfford`

**File:** `src/store/selectors.ts:15`

The original `canAfford` accumulated a separate `dittoNeeded` counter across the loop and compared it against `dittoAvailable` at the end. Refactored to decrement `playerDitto` directly each iteration instead, which mirrors how `trainCard` treats payment and makes the Ditto draw-down explicit at the point of consumption. (See Fifth Review for the subsequent rename.)

---

## Testing Gaps Filled

| Gap | File | Why it matters |
|-----|------|----------------|
| Second action in same turn throws | `turnLoop.test.ts` | The "exactly one action" rule was untested at the max end |
| Tests that took multiple actions now use state injection or reset `actionTakenThisTurn` | `scoutCard.test.ts`, `trainCard.test.ts`, `legendaryCollection.test.ts`, `catchMew.test.ts` | Tests were inadvertently exercising illegal game states; fixing them makes the test scenarios match real game flow |

---

# Lessons Learned — Sixth Review

Findings from the staff engineer review of the fifth implementation. All bugs below were fixed.

---

## Bugs Fixed

### 14. `discardTokens({})` was a valid no-op — phase stuck in `DISCARDING`

**File:** `src/store/useGameStore.ts`

`discardTokens` accepted an empty selection (`{}`) or a zero-quantity selection (`{ Fire: 0 }`) without error. The loop did nothing, `totalTokens` stayed above `MAX_TOKENS`, and phase remained `DISCARDING` indefinitely. The UI should prevent this, but the action layer must enforce it independently — a player could exploit this to probe state without consuming their discard obligation.

**Fix:** Added a total-quantity guard before the loop:

```ts
const totalDiscard = Object.values(tokens).reduce<number>((s, n) => s + (n ?? 0), 0);
if (totalDiscard === 0) throw new Error('Must discard at least 1 token');
```

**Rule:** Every action should reject inputs that produce no state change and no error. Silent no-ops are the most common source of stuck UI states — they look like they worked.

---

### 15. `takeTokens` showed "Not enough" error instead of "Need ≥4" for the two-same path when supply < 2

**File:** `src/store/useGameStore.ts`

The supply checks for the two-same path ran in this order:

```ts
if (available < count) throw new Error(`Not enough ${type} tokens in supply`);
if (isTwoSame && available < MIN_SUPPLY_FOR_TAKE_TWO) throw new Error(`Need ≥4 ...`);
```

For supply = 0 or 1, `available < count` (count = 2) fired first, producing the generic "Not enough" message. The actual rule is "need ≥4 in supply" — a player trying to take two of a type with supply = 1 should see the specific rule, not a confusing "you don't have 2 of something you can't take anyway."

**Fix:** Swapped check order so the specific two-same rule fires first:

```ts
if (isTwoSame && available < MIN_SUPPLY_FOR_TAKE_TWO) throw new Error(`Need ≥${MIN_SUPPLY_FOR_TAKE_TWO} ...`);
if (available < count) throw new Error(`Not enough ${type} tokens in supply`);
```

**Rule:** When two guards protect the same invalid state, order them most-specific to least-specific. The caller deserves the error that explains the actual rule, not the first one that triggers.

---

### 16. `App.tsx` AsyncStorage load had no `.catch()` — saves permanently silenced on load failure

**File:** `App.tsx`

`AsyncStorage.getItem(SOUND_KEY)` had no `.catch()`. If storage failed (corruption, quota exceeded, device restrictions), `hydrated.current` was never set to `true`, and every subsequent `soundEnabled` change was silently dropped by the `if (!hydrated.current) return` guard in the save effect.

**Fix:** Added `.catch(() => { hydrated.current = true; })`. A failed load still unblocks saves — the default `soundEnabled = true` is used, and future changes persist correctly.

**Rule:** An async boundary that sets a gate flag (`hydrated.current`) must set that flag in both the success and failure paths. A gate stuck at `false` silences all downstream effects, often with no visible symptom until the user notices their settings weren't saved.

---

## Testing Gaps Filled

| Gap | File | Why it matters |
|-----|------|----------------|
| `discardTokens({})` throws | `takeTokens.test.ts` | A no-op that changes no state should be rejected, not silently accepted |
| `canAfford` edge cases: free card, bonus covers full cost, Ditto shortfall, insufficient Ditto | `selectors.test.ts` | `canAfford` mirrors `trainCard`'s payment loop — divergence causes actions that throw despite being "available" in the UI |
| `canClaimLegendary` and `canCatchMew` positive and negative cases | `selectors.test.ts` | These drive button enable/disable state; testing them directly decouples selector correctness from store action tests |

---

## Observations (no fix applied)

### Redundant type casts in `trainCard` and `discardTokens`

`{ ...player.energyTokens } as Partial<Record<TokenType, number>>` is redundant — the spread already produces that type. Same for `board.energySupply`. These casts were added defensively during the lesson #7 type-safety cleanup and are now unnecessary. They're harmless but should be removed in a future cleanup to keep the "only cast at `Object.entries()` call sites" rule clean.

### `PlayerState.isAI` is always `false`

`makePlayer` hardcodes `isAI: false` with no path to set it `true` (since `aiFlags` was removed from `GameConfig` in the second review). The field reads as meaningful but is dead until AI is implemented. Worth an in-code comment when AI work begins; no change now.

---

# Lessons Learned — Fifth Review (Ditto Naming Clarity)

---

## Naming Fixes

### `dittoAvailable` / `dittoInSupply` renamed for clarity

**Files:** `src/store/selectors.ts`, `src/store/gameRules.ts`

Two separate Ditto quantities existed in the codebase under similar-sounding names, making it easy to confuse them:

- `dittoAvailable` in `canAfford` — the **player's** Ditto tokens in hand, drawn down as each energy type's shortfall is covered
- `dittoInSupply` in `applyScout` — the **board's** Ditto pool, decremented when a scout grant is awarded

Both were renamed to make the distinction unambiguous:

| Before | After | Represents |
|--------|-------|------------|
| `dittoAvailable` | `playerDitto` | Tokens in the player's hand; decrements as card cost is paid |
| `dittoInSupply` | `boardDittoSupply` | Tokens on the board; decrements when a scout grants one to the player |

**Rule:** When two variables represent the same game concept (Ditto tokens) but from different perspectives (player vs. board), the name must make the perspective explicit. Generic names like `dittoAvailable` invite silent mix-ups — a reader can't tell at a glance whether "available" means "in my hand" or "in the supply."

---

# Lessons Learned — Sixth Review (Selector / Logic Consistency)

---

## Issues Flagged

### 1. `canAfford` and `trainCard` implement the same payment algorithm independently

**Files:** `src/store/selectors.ts:15`, `src/store/useGameStore.ts:226`

`canAfford` and the payment loop inside `trainCard` are the same algorithm written twice. Today they're identical. If either changes — a cost formula tweak, a wild-card rule adjustment — the UI can show a card as affordable while the action throws, with no compile-time signal.

The fix: have `trainCard` call `canAfford` as a pre-check and throw early, then run its mutation loop with no affordability re-check. Or have `canAfford` return the computed payment breakdown (how much of each type, how much Ditto) so `trainCard` consumes the result rather than re-computing it.

**Rule:** A UI predicate and the action it guards must share a single source of truth for their condition. Duplicating the check means the two can drift silently.

---

### 2. `buildDecks` accepts an unused typed parameter

**File:** `src/store/gameRules.ts:29`

```ts
export function buildDecks(deckMode: DeckMode) {
  // Phase 1: only first151 mode; balanced mode reuses same data until #16 ships
```

The `deckMode` parameter is typed as `DeckMode` but never read. The comment explains the intent, but TypeScript doesn't warn because the parameter is named (not `_deckMode`). A future reader or autocomplete won't distinguish this from an accidental omission.

Fix: prefix with `_` (`_deckMode: DeckMode`) to signal the unused-by-design intent, or remove the parameter entirely until the balanced deck mode ships.

---

### 3. `canClaimLegendary` is indirect and allocates unnecessarily

**File:** `src/store/selectors.ts:28`

```ts
export function canClaimLegendary(player: PlayerState, legendary: Legendary): boolean {
  return claimLegendaries(player.typeBonuses, [legendary]).length > 0;
}
```

This wraps `claimLegendaries` by creating a singleton array just to filter it and check if the result is non-empty. Both the allocation and the filter are wasted work. The direct version is shorter and doesn't pull in a `gameRules` import for what is purely a selector check:

```ts
export function canClaimLegendary(player: PlayerState, legendary: Legendary): boolean {
  return (Object.entries(legendary.requirements) as [EnergyType, number][]).every(
    ([type, required]) => (player.typeBonuses[type] ?? 0) >= required
  );
}
```

---

## Design Clarification

### `discardTokens` enforces "at least 1", not "discard to ≤10"

**File:** `src/store/useGameStore.ts` — `discardTokens`

`discardTokens` validates:
1. Phase is `DISCARDING`
2. Total discarded ≥ 1
3. Player holds each token they claim to discard

It does **not** throw if the post-discard total is still >10. If the player discards 1 from a hand of 12, they stay in `DISCARDING` phase and must call `discardTokens` again. The ≤10 ceiling is enforced indirectly: `advanceTurn` throws while `phase === DISCARDING`, so the player is blocked from progressing until they've discarded enough.

This is intentional — the action is callable multiple times in sequence, giving the UI flexibility to let the player discard one token at a time.

---

## Fixes Applied

### `canAfford` now guards `trainCard` (issue 1)

`trainCard` used to re-implement the affordability check in its mutation loop. It now calls `canAfford(player, card)` before the loop and throws early if false. The `if (dittoNeeded > energyAfter.Ditto)` check was removed — it was unreachable once `canAfford` passed. The mutation loop still runs to compute `dittoNeeded` for the Ditto deduction.

### `buildDecks` unused parameter prefixed `_` (issue 2)

`deckMode` → `_deckMode` to signal the parameter is intentionally ignored until balanced deck ships.

### `canClaimLegendary` inlined (issue 3)

Replaced `claimLegendaries(player.typeBonuses, [legendary]).length > 0` with a direct `.every()` on `legendary.requirements`. Removed the `claimLegendaries` import from `selectors.ts` — that import crossed a module boundary just to wrap a one-liner.

---

## Observations (no fix applied)

### Redundant casts still present

`src/store/useGameStore.ts` — `trainCard` and `discardTokens` still carry `as Partial<Record<TokenType, number>>` casts on spreads of already-typed fields. Flagged in fourth-review lessons; still harmless, still unresolved.
