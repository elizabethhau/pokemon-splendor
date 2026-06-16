# Task Plan — Two New UI Features → Real App

## Goal
Plan implementation (in the real Expo/React Native app under `src/`) of two features
prototyped in `design_prototype/Pokemon Splendor.dc.html`:
1. **Opponent board inspection** — read-only, non-committal view of an opponent's board.
2. **Legendary/Noble eligibility prompt + claim animation** — opt-in claim flow.

Output of this planning session: a settled design (this file + findings.md), ready to
break into issues / implement.

## Status: COMPLETE — issues #39–#43 published (GitHub + docs/issues.md)

## Open Decision Tree (resolve top-down)
- [x] D0. RESOLVED: implement in real app `src/`. **Next: break into issues in docs/issues.md**
      (tracer-bullet slices). Implementation later.
- [x] D1. **RESOLVED: Auto-collect + pick-one.** Legendaries still mandatory/auto (never
      declinable). 1 eligible → auto-claim + animation. 2+ eligible → prompt pick-one;
      max ONE Legendary per turn; the rest claimed on later turns. (Revises prototype's
      full opt-in. No permanent decline.)
- [x] D2. RESOLVED: pick-one-at-a-time, but all eventually claimed (one per turn).
- [x] D3. RESOLVED (trivial): claim is free, resolved at end-of-turn after the action;
      adds no extra action cost.
- [x] D4. N/A (no decline).
- [x] D6. RESOLVED: AI picks **deterministic lowest Pokédex #**, one per turn, no UI.
- [x] D14. RESOLVED: **Drop the ♛ mid-turn button.** Single code path = end-of-turn resolve.
- [x] D5. RESOLVED: **Keep MasterBall-for-first only** (no per-claim Poké Ball); animation
      shows "+1 MasterBall" on first claim, nothing after.
- [x] D7. RESOLVED: **No final-round special case** — one Legendary per turn always.
- [x] D8. RESOLVED: **Any opponent** (human or AI) inspectable; scouted contents hidden.
- [x] D9. RESOLVED: surface TP, type-bonus counts, energy tokens, poké balls, scouted-hand
      SIZE (contents hidden), Legendaries, **+ scrollable trained-Pokémon sprite strip**
      (data from `PlayerState.trainedCards`; reuse sprite cache). Any opponent.
- [x] D10. RESOLVED: **Anytime the board is visible** during your turn, incl. mid token-
      selection. Pure overlay, no side effects, dismiss restores prior state. Inspect state
      is ephemeral (which player index); not part of GameState/undo.
- [x] D11. RESOLVED: **Centered celebration** (mirror `CatchMewModal` Reanimated idiom):
      sprite scale+rise, MasterBall pop (first claim only), "X joined your team!", then
      handoff. NOT fly-to-team (though `AIMoveFly` makes that cheap — left as optional polish).
- [x] D12. RESOLVED (by design):
      • Claim logic moves out of `trainCard` into a turn-end flow. Suggest splitting
        `advanceTurn` into `beginEndTurn()` (resolve action → eval eligibility → if 1 auto-
        claim+advance; if 2+ set `pendingLegendaryChoice` and STOP) and
        `chooseLegendary(leg)` (claim selected → continue advance). Keeps it synchronous/
        store-driven/testable; avoids async advanceTurn.
      • New GameState field `pendingLegendaryChoice: Legendary[] | null` (serialisable,
        store-driven per docs/testing.md). Keep `firstLegendaryClaimed` gate (MasterBall).
      • **Inspect state is ephemeral** (inspected player index) → component `useState`, NOT
        GameState; no undo/persistence.
      • Claim is post-action/end-of-turn → past undo boundary → not undoable (consistent
        with current undo clearing on turn commit).
- [x] D13. RESOLVED: **End of every turn** (Splendor-authentic). Move claim check OUT of
      `trainCard` into the turn-end flow (`advanceTurn`/endTurn). Up to one per turn,
      prompt if 2+. Legendary TP counts before final-round trigger eval. Implication:
      end-of-turn may need to PAUSE for the pick prompt before advancing (async).
- [ ] D14. Keep mid-turn manual ♛ "claim now" button, or rely solely on end-of-turn? (UI)

## Phases
- Phase 1: Lock design via grilling → findings.md  [COMPLETE]
- Phase 2: Break into docs/issues.md (to-issues, tracer-bullet slices)  [COMPLETE]
  → Published #39 ADR/CONTEXT (HITL), #40 store, #41 pick-one prompt (HITL),
    #42 animation, #43 inspection. Deps: #39→#40→{#41,#42}; #43 independent.
- Phase 3: (later) implement per /implement-feature + /tdd (start at #39, then #40)

## Settled design summary (for issue authoring)
### Feature A — Legendary/Noble claim (rules change)
- Auto-collect kept, but **max one Legendary per turn**; eligibility evaluated **at end of
  every turn**. 1 eligible → auto-claim; 2+ → **pick-one prompt** (human) / lowest-Pokédex
  (AI). No decline. Move claim out of `trainCard` → `beginEndTurn()`/`chooseLegendary()`.
- New GameState `pendingLegendaryChoice: Legendary[] | null`. Keep `firstLegendaryClaimed`
  → MasterBall on first claim only (no per-claim ball).
- **Centered celebration** animation (CatchMewModal idiom). Drop prototype's ♛ button.
- Docs: update CONTEXT.md "auto-collected" wording + new ADR (precedent 0001).
### Feature B — Opponent board inspection (read-only)
- Tap any opponent TopBar avatar → modal: TP, type-bonus counts, energy tokens, poké balls,
  scouted-hand SIZE (contents hidden), Legendaries, **+ scrollable trained-Pokémon strip**.
- Anytime board visible (incl mid-selection). Ephemeral component state; no GameState/undo.
- Data all in `PlayerState`; reuse sprite cache.

## Notes
See findings.md for current-code vs prototype divergences.
