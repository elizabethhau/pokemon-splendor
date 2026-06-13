# Graph Report - pokemon-splendor  (2026-06-13)

## Corpus Check
- 53 files · ~24,905 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 313 nodes · 755 edges · 9 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5d269422`
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
5. `GameConfig` - 14 edges
6. `TokenType` - 13 edges
7. `currentPlayer()` - 13 edges
8. `TYPE_COLORS` - 11 edges
9. `Legendary` - 11 edges
10. `PlayerState` - 10 edges

## Surprising Connections (you probably didn't know these)
- `ConfirmModal()` --calls--> `useTheme()`  [EXTRACTED]
  components/ConfirmModal.tsx → theme/ThemeContext.tsx
- `DeckRail()` --calls--> `useTheme()`  [EXTRACTED]
  components/board/DeckRail.tsx → theme/ThemeContext.tsx
- `GameSetupScreen()` --calls--> `useTheme()`  [EXTRACTED]
  screens/GameSetupScreen.tsx → theme/ThemeContext.tsx
- `GameBoardScreen()` --calls--> `useGameStore`  [EXTRACTED]
  screens/GameBoardScreen.tsx → store/useGameStore.ts
- `GameBoardScreen()` --calls--> `useTheme()`  [EXTRACTED]
  screens/GameBoardScreen.tsx → theme/ThemeContext.tsx

## Communities (9 total, 0 thin omitted)

### Community 0 - "Game Constants & Setup"
Cohesion: 0.06
Nodes (36): RootStackParamList, Stack, GameOverScreen(), Props, styles, AI_NAMES, Difficulty, GameSetupScreen() (+28 more)

### Community 1 - "Game Selectors & Logic"
Cohesion: 0.05
Nodes (41): CostRow, { game }, names, player, TWO_PLAYER, givePlayerTokens(), putCardInFace(), CHARMANDER (+33 more)

### Community 2 - "Navigation & Screen Routing"
Cohesion: 0.09
Nodes (34): BoardCard(), TIER_LABELS, BALL_ORDER, Dock(), ENERGY_TYPES, LegendariesColumn(), SupplyColumn(), TOKEN_ORDER (+26 more)

### Community 3 - "Settings Screen & Store"
Cohesion: 0.09
Nodes (32): getGreedyMove(), bestScoutableTier3(), ENERGY_TYPES, focusType(), getHeuristicMove(), BALL_ORDER, bestAffordableCard(), bestTokenSelection() (+24 more)

### Community 4 - "Token Economy & Card Tests"
Cohesion: 0.06
Nodes (32): canAfford(), canClaimLegendary(), ENERGY_TYPES, getWinners(), ARTICUNO, caught, { game }, MEW (+24 more)

### Community 5 - "Deck Building & Balancing"
Cohesion: 0.11
Nodes (17): useBoardScale(), ConfirmModal(), ConfirmRequest, s, ToastContext, useToast(), s, TokenDiscardModal() (+9 more)

### Community 6 - "Legendary & Mew Catch Tests"
Cohesion: 0.11
Nodes (21): DeckRail(), TierRowData, BASE_CATCH_RATES, applyScout(), buildDecks(), claimLegendaries(), ENERGY_TYPES, makePlayer() (+13 more)

### Community 7 - "Turn Loop Tests"
Cohesion: 0.21
Nodes (8): LIGHT_TYPES, Props, styles, TIER_COLORS, mockGetItem, mockSetItem, getArtworkUri(), getSpriteUri()

### Community 8 - "Scout Card Tests"
Cohesion: 0.22
Nodes (7): BULBASAUR, FOUR_PLAYER, { game }, ONE_PLAYER, THREE_PLAYER, TWO_PLAYER, TWO_PLAYER_PNP

## Knowledge Gaps
- **144 isolated node(s):** `CardCost`, `LegendaryRequirements`, `Stack`, `Props`, `Mode` (+139 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PokemonCard` connect `Game Selectors & Logic` to `Navigation & Screen Routing`, `Settings Screen & Store`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`, `Scout Card Tests`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `useGameStore` connect `Game Constants & Setup` to `Game Selectors & Logic`, `Settings Screen & Store`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`, `Scout Card Tests`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Navigation & Screen Routing` to `Game Constants & Setup`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **What connects `CardCost`, `LegendaryRequirements`, `Stack` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Constants & Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Game Selectors & Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Navigation & Screen Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._