# Findings — Two New Features

## Canonical rules (CONTEXT.md)
- **Legendary**: 5 special Pokémon, **"auto-collected (not purchased)"** when accumulated
  Type Bonuses meet requirements. 3 TP each. Splendor "nobles" analog.
- Scouted cards: visible to holder only, hidden from opponents.
- Mew: needs 2 Legendaries to attempt; MasterBall = 100% catch rate.

## Current real-app behavior (src/store/useGameStore.ts `trainCard`, lines ~244-331)
- Legendaries **auto-claimed inside `trainCard`** via `claimLegendaries(newTypeBonuses, available)`.
- Grabs **ALL** eligible at once (no pick-one).
- First legendary ever claimed → bonus **MasterBall** (`board.firstLegendaryClaimed` gate).
  Each card train also grants a tier ball (Poke/Great/Ultra by tier).
- Claim is **bundled into the train action** → `actionTakenThisTurn: true` (consumes turn).
- `gameRules.claimLegendaries` filters available by `canClaimLegendary` selector.
- Types: `PlayerState` already holds energyTokens, typeBonuses, trainedCards,
  scoutedCards, legendaries, mythical, pokeballs. `BoardState.availableLegendaries`,
  `firstLegendaryClaimed`. Legendary.trainerPoints fixed at 3.

## Prototype's NEW design (design_prototype, logic script)
- Train **no longer auto-claims**; computes `legendaryCheck(you)` minus `legOffered`.
- If newly eligible (and not game-over) → opens **prompt** (`legendaryPrompt`, `legSel`).
- Prompt: shows ALL eligible, **pick ONE**, "Claim X" or "Maybe later".
- Decline → adds all to `legOffered` (won't auto-reprompt); manual re-open via **♛ button**
  (`openLegendaryPrompt`) — claim later, still that turn.
- Claim → animation (fly-in `ps-legfly` + ball pop), award `tp += leg.tp`,
  **+1 plain Poké Ball** (NOT MasterBall), push to team. Does **NOT** set `acted`
  (claim is free, doesn't consume turn). "Last valid step in the turn."
- AI (`simAiTurn`) **auto-claims** any eligible (keeps old behavior for opponents).

### DECISIONS (grilling session 1)
- D1: Auto-collect + pick-one. Mandatory (no decline). 1 eligible → auto; 2+ → pick one;
  **max one Legendary claimed per turn**, rest on later turns.
- D13: Evaluate eligibility **at end of every turn** (not just after Train). Move claim
  logic out of `trainCard` into turn-end flow. Legendary TP counts before final-round eval.
- D5: **Keep MasterBall-for-first-legendary only.** No per-claim Poké Ball. Drop prototype's
  "+1 Poké Ball" — animation must show "+1 MasterBall" on first claim, nothing after.

### Divergences prototype vs current rules (MUST RESOLVE)
1. auto-collect (CONTEXT.md/code) → opt-in claim (prototype).
2. claim-all (code) → pick-one-per-prompt (prototype).
3. claim bundled+consumes turn (code) → free/deferrable separate step (prototype).
4. MasterBall-for-first (code) → plain Pokeball, no MasterBall concept (prototype).

## Opponent inspection
- Prototype: tap TopBar opponent avatar (`op.onTap` → `openInspect(i)`), read-only modal.
- Surfaces: TP, type-bonus counts, energy tokens (color+count), pokeballs, scouted-hand
  SIZE only (face-down backs, "contents hidden"), legendaries collected.
- Non-committal; dismiss via ✕ or overlay tap.
- Real app: all this data is already in `game.players[i]` (PlayerState). Only scouted
  CONTENTS must stay hidden (size is fine — matches CONTEXT.md visibility rule).
- Real-app TopBar lives in src/components/board/ (opponents row). Need onPress wiring.

## Animation reuse (discovered)
- `CatchMewModal.tsx`: Reanimated idiom — `useSharedValue` + `withSequence`/`withTiming`
  + `useAnimatedStyle` (wiggle). Pattern for the **centered claim celebration** (D11).
- `board/AIMoveFly.tsx`: EXISTING fly-from-slot→dock clone (`from: Rect`, `to:{x,y}`,
  shrink+fade, `FLY_MS=520`). `GameBoardScreen` computes dock target `{x:z(14),y:winH-z(58)}`,
  measures source via `measureInWindow`, registers card nodes via `onLayout`, guards late
  callbacks by turnNumber/mount. → fly-to-team is cheap to add LATER if wanted (optional).
- Dock (`board/Dock.tsx`) shows TYPE BONUS / ENERGY / BALLS / HAND only — **no owned-
  Legendaries widget**, so "team" target = dock corner (same as AI-fly).

## Architecture anchors (graph god nodes)
- `useGameStore` (Zustand single GameState), `PlayerState`, `currentPlayer()` selector,
  `useTheme()`, `PokemonCard`, components/board/* (Dock, SupplyColumn, LegendariesColumn...).
- Animations: Reanimated 3 (worklets) per CLAUDE.md.
- One existing ADR: 0001-catch-attempt-is-full-turn-action.md (precedent for turn-cost ADRs).
