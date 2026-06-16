# Progress Log

## Session 1 — 2026-06-15
- Merged updated Claude Design export into canonical `Pokemon Splendor.dc.html` (2 new features).
- Explored real app: types/game.ts, useGameStore.ts (trainCard auto-claim), CONTEXT.md rules,
  graph report. Captured divergences in findings.md.
- Set up planning files. Starting grill-me to lock design decisions (D0–D12).
- Key tension: CONTEXT.md "Legendaries auto-collected" vs prototype's opt-in claim prompt.
- GRILLING COMPLETE (D0–D14 resolved). Outcome: Legendary = auto-collect + pick-one,
  one-per-turn, end-of-turn eval, MasterBall-for-first kept, centered celebration anim,
  ♛ button dropped. Inspect = any opponent, scouted hidden, +trained-card strip, anytime.
- Discovered `AIMoveFly` (existing fly-to-dock) + `CatchMewModal` (Reanimated idiom).
- Phase 1 done. Phase 2 = break into docs/issues.md via to-issues. → launching to-issues.
- Phase 2 COMPLETE. Published 5 GitHub issues #39–#43 (labels: needs-triage + hitl/afk +
  doc/enhancement) and mirrored into docs/issues.md "Phase 3 — New Features" + dep graph.
  #39 ADR/CONTEXT (HITL), #40 store end-of-turn claim, #41 pick-one prompt (HITL),
  #42 celebration anim, #43 opponent inspection. Done.
