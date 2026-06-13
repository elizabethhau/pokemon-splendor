# Graph Report - pokemon-splendor  (2026-06-12)

## Corpus Check
- 52 files · ~24,404 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 303 nodes · 723 edges · 9 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `72c219e9`
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
1. `useTheme()` - 23 edges
2. `useGameStore` - 22 edges
3. `PokemonCard` - 21 edges
4. `EnergyType` - 16 edges
5. `TokenType` - 13 edges
6. `GameConfig` - 13 edges
7. `TYPE_COLORS` - 11 edges
8. `Legendary` - 11 edges
9. `currentPlayer()` - 11 edges
10. `PlayerState` - 10 edges

## Surprising Connections (you probably didn't know these)
- `HomeScreen()` --calls--> `useTheme()`  [EXTRACTED]
  screens/HomeScreen.tsx → theme/ThemeContext.tsx
- `GameSetupScreen()` --calls--> `useGameStore`  [EXTRACTED]
  screens/GameSetupScreen.tsx → store/useGameStore.ts
- `GameBoardScreen()` --calls--> `useGameStore`  [EXTRACTED]
  screens/GameBoardScreen.tsx → store/useGameStore.ts
- `GameBoardScreen()` --calls--> `useTheme()`  [EXTRACTED]
  screens/GameBoardScreen.tsx → theme/ThemeContext.tsx
- `GameBoardScreen()` --calls--> `useToast()`  [EXTRACTED]
  screens/GameBoardScreen.tsx → components/Toast.tsx

## Communities (9 total, 0 thin omitted)

### Community 0 - "Game Constants & Setup"
Cohesion: 0.07
Nodes (44): BoardCard(), TIER_LABELS, DeckRail(), TierRowData, BALL_ORDER, Dock(), ENERGY_TYPES, LegendariesColumn() (+36 more)

### Community 1 - "Game Selectors & Logic"
Cohesion: 0.05
Nodes (44): action, BULBASAUR, card, CHARMANDER, discard, EEVEE, EXPENSIVE, game (+36 more)

### Community 2 - "Navigation & Screen Routing"
Cohesion: 0.11
Nodes (32): getGreedyMove(), bestScoutableTier3(), ENERGY_TYPES, focusType(), getHeuristicMove(), BALL_ORDER, bestAffordableCard(), bestTokenSelection() (+24 more)

### Community 3 - "Settings Screen & Store"
Cohesion: 0.07
Nodes (24): RootStackParamList, Stack, GameOverScreen(), Props, styles, AI_NAMES, GameSetupScreen(), Props (+16 more)

### Community 4 - "Token Economy & Card Tests"
Cohesion: 0.09
Nodes (24): getAIDiscard(), s, ToastContext, useToast(), s, TokenDiscardModal(), BASE_CATCH_RATES, applyScout() (+16 more)

### Community 5 - "Deck Building & Balancing"
Cohesion: 0.12
Nodes (16): BreakdownRow, CardDetailModal(), computeBreakdown(), Props, s, TIER_NAMES, HomeScreen(), Props (+8 more)

### Community 6 - "Legendary & Mew Catch Tests"
Cohesion: 0.1
Nodes (18): ARTICUNO, caught, { game }, MEW, MEWTWO, TWO_PLAYER, ZAPDOS, cards (+10 more)

### Community 7 - "Turn Loop Tests"
Cohesion: 0.18
Nodes (12): keysA, mockGetItem, mockSetItem, loadStoredThemeId(), persistThemeId(), ThemeContext, ThemeContextValue, GradientStops (+4 more)

### Community 8 - "Scout Card Tests"
Cohesion: 0.22
Nodes (7): BULBASAUR, FOUR_PLAYER, { game }, ONE_PLAYER, THREE_PLAYER, TWO_PLAYER, TWO_PLAYER_PNP

## Knowledge Gaps
- **139 isolated node(s):** `CardCost`, `LegendaryRequirements`, `Stack`, `Props`, `AI_NAMES` (+134 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PokemonCard` connect `Game Selectors & Logic` to `Game Constants & Setup`, `Navigation & Screen Routing`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`, `Scout Card Tests`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `useGameStore` connect `Settings Screen & Store` to `Game Constants & Setup`, `Game Selectors & Logic`, `Navigation & Screen Routing`, `Token Economy & Card Tests`, `Legendary & Mew Catch Tests`, `Scout Card Tests`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Game Constants & Setup` to `Navigation & Screen Routing`, `Settings Screen & Store`, `Deck Building & Balancing`, `Turn Loop Tests`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `CardCost`, `LegendaryRequirements`, `Stack` to the rest of the system?**
  _139 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Constants & Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Game Selectors & Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Navigation & Screen Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._