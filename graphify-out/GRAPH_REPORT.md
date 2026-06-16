# Graph Report - pokemon-splendor  (2026-06-16)

## Corpus Check
- 67 files · ~30,158 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 380 nodes · 908 edges · 11 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e0388010`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Game Constants & Setup|Game Constants & Setup]]
- [[_COMMUNITY_Game Selectors & Logic|Game Selectors & Logic]]
- [[_COMMUNITY_Navigation & Screen Routing|Navigation & Screen Routing]]
- [[_COMMUNITY_Settings Screen & Store|Settings Screen & Store]]
- [[_COMMUNITY_Token Economy & Card Tests|Token Economy & Card Tests]]
- [[_COMMUNITY_Deck Building & Balancing|Deck Building & Balancing]]
- [[_COMMUNITY_Legendary & Mew Catch Tests|Legendary & Mew Catch Tests]]
- [[_COMMUNITY_Turn Loop Tests|Turn Loop Tests]]
- [[_COMMUNITY_Scout Card Tests|Scout Card Tests]]
- [[_COMMUNITY_Sprite Cache & URI|Sprite Cache & URI]]
- [[_COMMUNITY_Community 10|Community 10]]

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 34 edges
2. `PokemonCard` - 25 edges
3. `useGameStore` - 25 edges
4. `EnergyType` - 18 edges
5. `GameConfig` - 17 edges
6. `PlayerState` - 16 edges
7. `TokenType` - 15 edges
8. `currentPlayer()` - 13 edges
9. `TYPE_COLORS` - 12 edges
10. `Legendary` - 12 edges

## Surprising Connections (you probably didn't know these)
- `HomeScreen()` --calls--> `useTheme()`  [EXTRACTED]
  screens/HomeScreen.tsx → theme/ThemeContext.tsx
- `GameSetupScreen()` --calls--> `useTheme()`  [EXTRACTED]
  screens/GameSetupScreen.tsx → theme/ThemeContext.tsx
- `GameSetupScreen()` --calls--> `useGameStore`  [EXTRACTED]
  screens/GameSetupScreen.tsx → store/useGameStore.ts
- `GameBoardScreen()` --calls--> `useGameStore`  [EXTRACTED]
  screens/GameBoardScreen.tsx → store/useGameStore.ts
- `GameBoardScreen()` --calls--> `useTheme()`  [EXTRACTED]
  screens/GameBoardScreen.tsx → theme/ThemeContext.tsx

## Communities (11 total, 0 thin omitted)

### Community 0 - "Game Constants & Setup"
Cohesion: 0.06
Nodes (52): AIMoveOutcome, DECK_LABELS, formatAIMove(), Rect, BoardCard(), TIER_LABELS, DeckRail(), TierRowData (+44 more)

### Community 1 - "Game Selectors & Logic"
Cohesion: 0.06
Nodes (38): useBoardScale(), s, ToastContext, useToast(), s, TokenDiscardModal(), BASE_CATCH_RATES, applyScout() (+30 more)

### Community 2 - "Navigation & Screen Routing"
Cohesion: 0.08
Nodes (40): getGreedyMove(), bestScoutableTier3(), ENERGY_TYPES, focusType(), getHeuristicMove(), BALL_ORDER, bestAffordableCard(), bestTokenSelection() (+32 more)

### Community 3 - "Settings Screen & Store"
Cohesion: 0.05
Nodes (32): canClaimLegendary(), ARTICUNO, caught, { game }, MEW, MEWTWO, TWO_PLAYER, ZAPDOS (+24 more)

### Community 4 - "Token Economy & Card Tests"
Cohesion: 0.08
Nodes (22): BreakdownRow, CardDetailModal(), computeBreakdown(), Props, s, TIER_NAMES, LIGHT_TYPES, Props (+14 more)

### Community 5 - "Deck Building & Balancing"
Cohesion: 0.07
Nodes (27): Props, s, SettingsScreen(), useGameStore, givePlayerTokens(), putCardInFace(), CHARMANDER, MOLTRES (+19 more)

### Community 6 - "Legendary & Mew Catch Tests"
Cohesion: 0.09
Nodes (25): buildGameConfig(), SetupDifficulty, SetupMode, AI_NAMES, Difficulty, GameSetupScreen(), Mode, Props (+17 more)

### Community 7 - "Turn Loop Tests"
Cohesion: 0.09
Nodes (14): RootStackParamList, Stack, GameOverScreen(), Props, styles, HomeScreen(), Props, s (+6 more)

### Community 8 - "Scout Card Tests"
Cohesion: 0.22
Nodes (7): BULBASAUR, FOUR_PLAYER, { game }, ONE_PLAYER, THREE_PLAYER, TWO_PLAYER, TWO_PLAYER_PNP

### Community 9 - "Sprite Cache & URI"
Cohesion: 0.25
Nodes (5): affordable, c, onCardPress, onClose, unaffordable

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (7): CatchBall, BALLS, base, onClose, onPickBall, onThrow, { rerender }

## Knowledge Gaps
- **173 isolated node(s):** `CardCost`, `LegendaryRequirements`, `Stack`, `Props`, `SegOption` (+168 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PokemonCard` connect `Token Economy & Card Tests` to `Game Constants & Setup`, `Game Selectors & Logic`, `Navigation & Screen Routing`, `Settings Screen & Store`, `Deck Building & Balancing`, `Scout Card Tests`, `Sprite Cache & URI`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `useGameStore` connect `Deck Building & Balancing` to `Game Constants & Setup`, `Game Selectors & Logic`, `Navigation & Screen Routing`, `Settings Screen & Store`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`, `Scout Card Tests`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Game Constants & Setup` to `Game Selectors & Logic`, `Navigation & Screen Routing`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `CardCost`, `LegendaryRequirements`, `Stack` to the rest of the system?**
  _173 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Constants & Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Game Selectors & Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Navigation & Screen Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._