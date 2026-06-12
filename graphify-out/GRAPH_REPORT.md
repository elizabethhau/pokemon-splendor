# Graph Report - pokemon-splendor  (2026-06-12)

## Corpus Check
- 50 files · ~23,249 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 297 nodes · 705 edges · 10 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b055198b`
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

## God Nodes (most connected - your core abstractions)
1. `PokemonCard` - 21 edges
2. `useTheme()` - 21 edges
3. `useGameStore` - 21 edges
4. `EnergyType` - 16 edges
5. `TokenType` - 13 edges
6. `GameConfig` - 12 edges
7. `TYPE_COLORS` - 11 edges
8. `Legendary` - 11 edges
9. `currentPlayer()` - 11 edges
10. `PlayerState` - 10 edges

## Surprising Connections (you probably didn't know these)
- `DeckRail()` --calls--> `useTheme()`  [EXTRACTED]
  components/board/DeckRail.tsx → theme/ThemeContext.tsx
- `GameSetupScreen()` --calls--> `useGameStore`  [EXTRACTED]
  screens/GameSetupScreen.tsx → store/useGameStore.ts
- `GameBoardScreen()` --calls--> `useGameStore`  [EXTRACTED]
  screens/GameBoardScreen.tsx → store/useGameStore.ts
- `GameBoardScreen()` --calls--> `currentPlayer()`  [EXTRACTED]
  screens/GameBoardScreen.tsx → store/selectors.ts
- `GameBoardScreen()` --calls--> `hasLegalMove()`  [EXTRACTED]
  screens/GameBoardScreen.tsx → store/selectors.ts

## Communities (10 total, 0 thin omitted)

### Community 0 - "Game Constants & Setup"
Cohesion: 0.07
Nodes (38): BoardCard(), TIER_LABELS, BALL_ORDER, Dock(), ENERGY_TYPES, LegendariesColumn(), SupplyColumn(), TOKEN_ORDER (+30 more)

### Community 1 - "Game Selectors & Logic"
Cohesion: 0.05
Nodes (39): givePlayerTokens(), putCardInFace(), CHARMANDER, MOLTRES, SQUIRTLE, TWO_PLAYER, ZAPDOS, EEVEE (+31 more)

### Community 2 - "Navigation & Screen Routing"
Cohesion: 0.08
Nodes (33): DeckRail(), TierRowData, BASE_CATCH_RATES, CostRow, buildDecks(), claimLegendaries(), ENERGY_TYPES, makePlayer() (+25 more)

### Community 3 - "Settings Screen & Store"
Cohesion: 0.1
Nodes (33): getGreedyMove(), bestScoutableTier3(), ENERGY_TYPES, focusType(), getHeuristicMove(), BALL_ORDER, bestAffordableCard(), bestTokenSelection() (+25 more)

### Community 4 - "Token Economy & Card Tests"
Cohesion: 0.09
Nodes (20): TokenDiscardModal(), RootStackParamList, Stack, GameOverScreen(), Props, styles, AI_NAMES, GameSetupScreen() (+12 more)

### Community 5 - "Deck Building & Balancing"
Cohesion: 0.1
Nodes (19): BreakdownRow, CardDetailModal(), computeBreakdown(), Props, s, TIER_NAMES, LIGHT_TYPES, Props (+11 more)

### Community 6 - "Legendary & Mew Catch Tests"
Cohesion: 0.18
Nodes (12): keysA, mockGetItem, mockSetItem, loadStoredThemeId(), persistThemeId(), ThemeContext, ThemeContextValue, GradientStops (+4 more)

### Community 7 - "Turn Loop Tests"
Cohesion: 0.17
Nodes (10): canClaimLegendary(), alice, ARTICUNO, bob, CARD, CARD_5TP, FREE, MEW (+2 more)

### Community 8 - "Scout Card Tests"
Cohesion: 0.18
Nodes (10): cards, counts, eevee, legs, m, nonEevee, nums, reqValues (+2 more)

### Community 9 - "Sprite Cache & URI"
Cohesion: 0.4
Nodes (4): { game }, names, player, TWO_PLAYER

## Knowledge Gaps
- **138 isolated node(s):** `CardCost`, `LegendaryRequirements`, `Stack`, `Props`, `AI_NAMES` (+133 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PokemonCard` connect `Game Selectors & Logic` to `Game Constants & Setup`, `Navigation & Screen Routing`, `Settings Screen & Store`, `Deck Building & Balancing`, `Turn Loop Tests`, `Scout Card Tests`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `useGameStore` connect `Token Economy & Card Tests` to `Game Constants & Setup`, `Game Selectors & Logic`, `Navigation & Screen Routing`, `Settings Screen & Store`, `Sprite Cache & URI`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Game Constants & Setup` to `Navigation & Screen Routing`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `CardCost`, `LegendaryRequirements`, `Stack` to the rest of the system?**
  _138 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Constants & Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Game Selectors & Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Navigation & Screen Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._