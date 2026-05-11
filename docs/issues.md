# Pokemon Splendor — Issue Tracker

Progress tracker for all implementation issues. Check off each item when the corresponding GitHub issue is closed.

GitHub repo: https://github.com/elizabethhau/pokemon-splendor/issues

---

## Phase 1 — Core Game

| # | Issue | Blocked by | Status |
|---|-------|-----------|--------|
| [#1](https://github.com/elizabethhau/pokemon-splendor/issues/1) | Project Scaffold | — | [x] |
| [#2](https://github.com/elizabethhau/pokemon-splendor/issues/2) | Game Data Layer | #1 | [x] |
| [#3](https://github.com/elizabethhau/pokemon-splendor/issues/3) | Core Game State Model | #2 | [x] |
| [#4](https://github.com/elizabethhau/pokemon-splendor/issues/4) | Take Tokens Action — E2E | #3 | [x] |
| [#5](https://github.com/elizabethhau/pokemon-splendor/issues/5) | Train Action — E2E | #4 | [x] |
| [#6](https://github.com/elizabethhau/pokemon-splendor/issues/6) | Scout Action — E2E | #5 | [x] |
| [#7](https://github.com/elizabethhau/pokemon-splendor/issues/7) | Full Turn Loop + Pass-and-Play | #6 | [x] |
| [#8](https://github.com/elizabethhau/pokemon-splendor/issues/8) | Legendary Auto-Collection | #7 | [x] |
| [#9](https://github.com/elizabethhau/pokemon-splendor/issues/9) | Pokeball Mechanic + Mew | #8 | [x] |

## Phase 1 — AI

| # | Issue | Blocked by | Status |
|---|-------|-----------|--------|
| [#10](https://github.com/elizabethhau/pokemon-splendor/issues/10) | Greedy AI Opponent | #7 | [ ] |
| [#11](https://github.com/elizabethhau/pokemon-splendor/issues/11) | Heuristic AI Opponent | #10 | [ ] |

## Phase 1 — Supporting Features

| # | Issue | Blocked by | Status |
|---|-------|-----------|--------|
| [#12](https://github.com/elizabethhau/pokemon-splendor/issues/12) | SFX Integration | #7 | [ ] |
| [#13](https://github.com/elizabethhau/pokemon-splendor/issues/13) | Stats + Persistence | #7 | [ ] |
| [#14](https://github.com/elizabethhau/pokemon-splendor/issues/14) | Pokedex Screen | #13 | [ ] |
| [#15](https://github.com/elizabethhau/pokemon-splendor/issues/15) | Rulebook Screen | #1 | [ ] |
| [#16](https://github.com/elizabethhau/pokemon-splendor/issues/16) | Balanced Deck Mode | #5 | [ ] |

## Phase 1 — Polish

| # | Issue | Blocked by | Status |
|---|-------|-----------|--------|
| [#17](https://github.com/elizabethhau/pokemon-splendor/issues/17) | Animation Polish | #9 | [ ] |

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
#1 → #15 Rulebook (parallel track)
```
