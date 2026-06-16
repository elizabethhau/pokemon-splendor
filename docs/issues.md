# Pokemon Splendor — Issue Tracker

Progress tracker for all implementation issues. Check off each item when the corresponding GitHub issue is closed.

GitHub repo: https://github.com/elizabethhau/pokemon-splendor/issues

---

## Phase 1 — Core Game

| #                                                               | Issue                          | Blocked by | Status |
| --------------------------------------------------------------- | ------------------------------ | ---------- | ------ |
| [#1](https://github.com/elizabethhau/pokemon-splendor/issues/1) | Project Scaffold               | —          | [x]    |
| [#2](https://github.com/elizabethhau/pokemon-splendor/issues/2) | Game Data Layer                | #1         | [x]    |
| [#3](https://github.com/elizabethhau/pokemon-splendor/issues/3) | Core Game State Model          | #2         | [x]    |
| [#4](https://github.com/elizabethhau/pokemon-splendor/issues/4) | Take Tokens Action — E2E       | #3         | [x]    |
| [#5](https://github.com/elizabethhau/pokemon-splendor/issues/5) | Train Action — E2E             | #4         | [x]    |
| [#6](https://github.com/elizabethhau/pokemon-splendor/issues/6) | Scout Action — E2E             | #5         | [x]    |
| [#7](https://github.com/elizabethhau/pokemon-splendor/issues/7) | Full Turn Loop + Pass-and-Play | #6         | [x]    |
| [#8](https://github.com/elizabethhau/pokemon-splendor/issues/8) | Legendary Auto-Collection      | #7         | [x]    |
| [#9](https://github.com/elizabethhau/pokemon-splendor/issues/9) | Pokeball Mechanic + Mew        | #8         | [x]    |

## Phase 1 — AI

| #                                                                 | Issue                 | Blocked by | Status |
| ----------------------------------------------------------------- | --------------------- | ---------- | ------ |
| [#10](https://github.com/elizabethhau/pokemon-splendor/issues/10) | Greedy AI Opponent    | #7         | [x]    |
| [#11](https://github.com/elizabethhau/pokemon-splendor/issues/11) | Heuristic AI Opponent | #10        | [x]    |

## Phase 1 — Supporting Features

| #                                                                 | Issue               | Blocked by | Status |
| ----------------------------------------------------------------- | ------------------- | ---------- | ------ |
| [#12](https://github.com/elizabethhau/pokemon-splendor/issues/12) | SFX Integration     | #7         | [ ]    |
| [#13](https://github.com/elizabethhau/pokemon-splendor/issues/13) | Stats + Persistence | #7         | [ ]    |
| [#14](https://github.com/elizabethhau/pokemon-splendor/issues/14) | Pokedex Screen      | #13        | [ ]    |
| [#15](https://github.com/elizabethhau/pokemon-splendor/issues/15) | Rulebook Screen     | #1         | [ ]    |
| [#16](https://github.com/elizabethhau/pokemon-splendor/issues/16) | Balanced Deck Mode  | #5         | [ ]    |

## Phase 1 — UI

| #                                                                 | Issue                               | Blocked by | Status |
| ----------------------------------------------------------------- | ----------------------------------- | ---------- | ------ |
| [#18](https://github.com/elizabethhau/pokemon-splendor/issues/18) | Game Board UI (Playable End-to-End) | #9         | [x]    |

## Phase 1 — Polish

| #                                                                 | Issue            | Blocked by | Status |
| ----------------------------------------------------------------- | ---------------- | ---------- | ------ |
| [#17](https://github.com/elizabethhau/pokemon-splendor/issues/17) | Animation Polish | #18        | [ ]    |

## Phase 2 — Prototype Redesign

Rebuild to match `design_prototype/` (see decisions in the redesign plan). HITL = needs design review before merge.

| #                                                                 | Issue                                                        | Blocked by | Status                                                                             |
| ----------------------------------------------------------------- | ------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------- |
| [#23](https://github.com/elizabethhau/pokemon-splendor/issues/23) | Foundation: landscape, fonts, themes, Home + Settings (HITL) | —          | [x]                                                                                |
| [#24](https://github.com/elizabethhau/pokemon-splendor/issues/24) | Setup screen + multi-AI rivals                               | #23        | [x]                                                                                |
| [#25](https://github.com/elizabethhau/pokemon-splendor/issues/25) | Board screen rebuild + toasts (HITL)                         | #23        | [x]                                                                                |
| [#26](https://github.com/elizabethhau/pokemon-splendor/issues/26) | Modal package: scouted hand, Catch Mew, discard              | #25        | [x]                                                                                |
| [#27](https://github.com/elizabethhau/pokemon-splendor/issues/27) | Undo system + confirm gates + deferred refill                | #25        | [x]                                                                                |
| [#28](https://github.com/elizabethhau/pokemon-splendor/issues/28) | On-board AI turn presentation                                | #24, #25   | [x]                                                                                |
| [#29](https://github.com/elizabethhau/pokemon-splendor/issues/29) | Game Over + Handoff screens                                  | #23        | [ ]                                                                                |
| [#30](https://github.com/elizabethhau/pokemon-splendor/issues/30) | Pokédex, How to Play, Stats screens                          | #23        | [ ]                                                                                |

## Phase 3 — New Features (post-redesign)

Two features added to `design_prototype/` (see `task_plan.md` / `findings.md` for the settled design). HITL = needs design/decision review before merge.

| #                                                                 | Issue                                                       | Blocked by | PR  | Status |
| ----------------------------------------------------------------- | ----------------------------------------------------------- | ---------- | --- | ------ |
| [#39](https://github.com/elizabethhau/pokemon-splendor/issues/39) | Legendary claim rule change: ADR + CONTEXT.md (HITL)        | —          | —   | [ ]    |
| [#40](https://github.com/elizabethhau/pokemon-splendor/issues/40) | Legendary claim: move to end-of-turn, one-per-turn (store)  | #39        | —   | [ ]    |
| [#41](https://github.com/elizabethhau/pokemon-splendor/issues/41) | Legendary claim: pick-one prompt for multiple (HITL)        | #40        | —   | [ ]    |
| [#42](https://github.com/elizabethhau/pokemon-splendor/issues/42) | Legendary claim celebration animation                       | #40        | —   | [ ]    |
| [#43](https://github.com/elizabethhau/pokemon-splendor/issues/43) | Opponent board inspection (read-only)                       | —          | —   | [ ]    |

---

## Dependency Graph

```
#1 Scaffold
└── #2 Game Data Layer
    └── #3 Core Game State
        └── #4 Take Tokens
            └── #5 Train
                ├── #6 Scout
                │   └── #7 Turn Loop + P&P
                │       ├── #8 Legendary
                │       │   └── #9 Pokeball + Mew
                │       │       └── #17 Animations
                │       ├── #10 Greedy AI
                │       │   └── #11 Heuristic AI
                │       ├── #12 SFX
                │       └── #13 Stats
                │           └── #14 Pokedex
                └── #16 Balanced Deck
#9 → #18 Game Board UI
    └── #17 Animations
#1 → #15 Rulebook (parallel track)

#23 Redesign Foundation (HITL)
├── #24 Setup + Multi-AI ──┐
├── #25 Board Rebuild (HITL)
│   ├── #26 Modal Package  │
│   ├── #27 Undo System    │
│   └── #28 AI Presentation ←┘
├── #29 Game Over + Handoff
└── #30 Pokédex / How to Play / Stats

#39 Legendary rule ADR + CONTEXT (HITL)
└── #40 Legendary claim store (end-of-turn, one-per-turn)
    ├── #41 Pick-one prompt (HITL)
    └── #42 Claim celebration animation
#43 Opponent board inspection (parallel track)
```
