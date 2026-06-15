# Graph Report - pokemon-splendor  (2026-06-14)

## Corpus Check
- 61 files · ~27,778 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 343 nodes · 835 edges · 11 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cdfca93c`
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
1. `useTheme()` - 32 edges
2. `PokemonCard` - 23 edges
3. `useGameStore` - 23 edges
4. `EnergyType` - 17 edges
5. `GameConfig` - 15 edges
6. `TokenType` - 13 edges
7. `currentPlayer()` - 13 edges
8. `TYPE_COLORS` - 11 edges
9. `Legendary` - 11 edges
10. `PlayerState` - 11 edges

## Surprising Connections (you probably didn't know these)
- `HomeScreen()` --calls--> `useTheme()`  [EXTRACTED]
  screens/HomeScreen.tsx → theme/ThemeContext.tsx
- `ScoutedHandModal()` --calls--> `useTheme()`  [EXTRACTED]
  components/ScoutedHandModal.tsx → theme/ThemeContext.tsx
- `CatchMewModal()` --calls--> `useTheme()`  [EXTRACTED]
  components/CatchMewModal.tsx → theme/ThemeContext.tsx
- `TopBar()` --calls--> `useTheme()`  [EXTRACTED]
  components/board/TopBar.tsx → theme/ThemeContext.tsx
- `GameBoardScreen()` --calls--> `currentPlayer()`  [EXTRACTED]
  screens/GameBoardScreen.tsx → store/selectors.ts

## Communities (11 total, 0 thin omitted)

### Community 0 - "Game Constants & Setup"
Cohesion: 0.07
Nodes (34): AIMoveOutcome, DECK_LABELS, formatAIMove(), DeckRail(), TierRowData, LegendariesColumn(), AnimatedTouchable, SupplyColumn() (+26 more)

### Community 1 - "Game Selectors & Logic"
Cohesion: 0.07
Nodes (31): Rect, BoardCard(), TIER_LABELS, onTypeColor(), BreakdownRow, CardDetailModal(), computeBreakdown(), Props (+23 more)

### Community 2 - "Navigation & Screen Routing"
Cohesion: 0.1
Nodes (34): getGreedyMove(), bestScoutableTier3(), ENERGY_TYPES, focusType(), getHeuristicMove(), BALL_ORDER, bestAffordableCard(), bestTokenSelection() (+26 more)

### Community 3 - "Settings Screen & Store"
Cohesion: 0.07
Nodes (30): buildGameConfig(), SetupDifficulty, SetupMode, AI_NAMES, Difficulty, Mode, Props, s (+22 more)

### Community 4 - "Token Economy & Card Tests"
Cohesion: 0.07
Nodes (23): RootStackParamList, Stack, HomeScreen(), Props, s, TYPE_DOTS, styles, styles (+15 more)

### Community 5 - "Deck Building & Balancing"
Cohesion: 0.08
Nodes (23): givePlayerTokens(), putCardInFace(), CHARMANDER, MOLTRES, SQUIRTLE, TWO_PLAYER, ZAPDOS, BULBASAUR (+15 more)

### Community 6 - "Legendary & Mew Catch Tests"
Cohesion: 0.1
Nodes (21): BALL_ORDER, Dock(), ENERGY_TYPES, TopBar(), AI_AVATAR_DEX, BALL_TOP_COLORS, SEAT_AVATAR_DEX, BALL_LABELS (+13 more)

### Community 7 - "Turn Loop Tests"
Cohesion: 0.11
Nodes (23): PHASE, applyScout(), buildDecks(), claimLegendaries(), ENERGY_TYPES, makePlayer(), shuffle(), tierDeckKey() (+15 more)

### Community 8 - "Scout Card Tests"
Cohesion: 0.17
Nodes (10): canClaimLegendary(), alice, ARTICUNO, bob, CARD, CARD_5TP, FREE, MEW (+2 more)

### Community 9 - "Sprite Cache & URI"
Cohesion: 0.18
Nodes (10): cards, counts, eevee, legs, m, nonEevee, nums, reqValues (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (7): BULBASAUR, FOUR_PLAYER, { game }, ONE_PLAYER, THREE_PLAYER, TWO_PLAYER, TWO_PLAYER_PNP

## Knowledge Gaps
- **151 isolated node(s):** `CardCost`, `LegendaryRequirements`, `Stack`, `Props`, `SegOption` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PokemonCard` connect `Game Selectors & Logic` to `Game Constants & Setup`, `Navigation & Screen Routing`, `Settings Screen & Store`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`, `Scout Card Tests`, `Sprite Cache & URI`, `Community 10`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `useGameStore` connect `Game Constants & Setup` to `Navigation & Screen Routing`, `Settings Screen & Store`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`, `Community 10`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Game Constants & Setup` to `Game Selectors & Logic`, `Settings Screen & Store`, `Token Economy & Card Tests`, `Legendary & Mew Catch Tests`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `CardCost`, `LegendaryRequirements`, `Stack` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Constants & Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Game Selectors & Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Navigation & Screen Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._