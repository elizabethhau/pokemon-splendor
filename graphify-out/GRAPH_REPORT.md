# Graph Report - pokemon-splendor  (2026-06-13)

## Corpus Check
- 55 files · ~25,201 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 319 nodes · 768 edges · 9 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `04d68ba4`
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

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 25 edges
2. `useGameStore` - 23 edges
3. `PokemonCard` - 21 edges
4. `EnergyType` - 16 edges
5. `GameConfig` - 15 edges
6. `TokenType` - 13 edges
7. `currentPlayer()` - 13 edges
8. `TYPE_COLORS` - 11 edges
9. `Legendary` - 11 edges
10. `PlayerState` - 10 edges

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

## Communities (9 total, 0 thin omitted)

### Community 0 - "Game Constants & Setup"
Cohesion: 0.05
Nodes (44): Props, s, SettingsScreen(), useGameStore, givePlayerTokens(), putCardInFace(), CHARMANDER, MOLTRES (+36 more)

### Community 1 - "Game Selectors & Logic"
Cohesion: 0.07
Nodes (33): BoardCard(), TIER_LABELS, DeckRail(), TierRowData, BALL_ORDER, Dock(), ENERGY_TYPES, LegendariesColumn() (+25 more)

### Community 2 - "Navigation & Screen Routing"
Cohesion: 0.1
Nodes (33): getGreedyMove(), bestScoutableTier3(), ENERGY_TYPES, focusType(), getHeuristicMove(), BALL_ORDER, bestAffordableCard(), bestTokenSelection() (+25 more)

### Community 3 - "Settings Screen & Store"
Cohesion: 0.07
Nodes (33): CostRow, canAfford(), canClaimLegendary(), ENERGY_TYPES, cards, counts, eevee, legs (+25 more)

### Community 4 - "Token Economy & Card Tests"
Cohesion: 0.09
Nodes (25): buildGameConfig(), SetupDifficulty, SetupMode, AI_NAMES, Difficulty, GameSetupScreen(), Mode, Props (+17 more)

### Community 5 - "Deck Building & Balancing"
Cohesion: 0.1
Nodes (25): s, ToastContext, useToast(), s, TokenDiscardModal(), BASE_CATCH_RATES, PHASE, TYPE_COLORS (+17 more)

### Community 6 - "Legendary & Mew Catch Tests"
Cohesion: 0.1
Nodes (18): BreakdownRow, CardDetailModal(), computeBreakdown(), Props, s, TIER_NAMES, LIGHT_TYPES, Props (+10 more)

### Community 7 - "Turn Loop Tests"
Cohesion: 0.09
Nodes (14): RootStackParamList, Stack, GameOverScreen(), Props, styles, HomeScreen(), Props, s (+6 more)

### Community 8 - "Scout Card Tests"
Cohesion: 0.22
Nodes (7): ARTICUNO, caught, { game }, MEW, MEWTWO, TWO_PLAYER, ZAPDOS

## Knowledge Gaps
- **145 isolated node(s):** `CardCost`, `LegendaryRequirements`, `Stack`, `Props`, `SegOption` (+140 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PokemonCard` connect `Game Constants & Setup` to `Game Selectors & Logic`, `Navigation & Screen Routing`, `Settings Screen & Store`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `useGameStore` connect `Game Constants & Setup` to `Game Selectors & Logic`, `Navigation & Screen Routing`, `Settings Screen & Store`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Turn Loop Tests`, `Scout Card Tests`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Game Selectors & Logic` to `Game Constants & Setup`, `Navigation & Screen Routing`, `Settings Screen & Store`, `Token Economy & Card Tests`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `CardCost`, `LegendaryRequirements`, `Stack` to the rest of the system?**
  _145 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Constants & Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Game Selectors & Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Navigation & Screen Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._