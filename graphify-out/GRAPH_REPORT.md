# Graph Report - pokemon-splendor  (2026-06-12)

## Corpus Check
- 38 files · ~21,444 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 251 nodes · 543 edges · 10 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e926a1aa`
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
1. `useGameStore` - 21 edges
2. `PokemonCard` - 17 edges
3. `GameConfig` - 12 edges
4. `EnergyType` - 11 edges
5. `currentPlayer()` - 11 edges
6. `Legendary` - 10 edges
7. `getHeuristicMove()` - 9 edges
8. `canCatchMew()` - 9 edges
9. `TokenType` - 8 edges
10. `PlayerState` - 8 edges

## Surprising Connections (you probably didn't know these)
- `GameSetupScreen()` --calls--> `useGameStore`  [EXTRACTED]
  screens/GameSetupScreen.tsx → store/useGameStore.ts
- `GameBoardScreen()` --calls--> `useGameStore`  [EXTRACTED]
  screens/GameBoardScreen.tsx → store/useGameStore.ts
- `SettingsScreen()` --calls--> `useGameStore`  [EXTRACTED]
  screens/SettingsScreen.tsx → store/useGameStore.ts
- `HomeScreen()` --calls--> `useTheme()`  [EXTRACTED]
  screens/HomeScreen.tsx → theme/ThemeContext.tsx
- `TokenDiscardModal()` --calls--> `useGameStore`  [EXTRACTED]
  components/TokenDiscardModal.tsx → store/useGameStore.ts

## Communities (10 total, 0 thin omitted)

### Community 0 - "Game Constants & Setup"
Cohesion: 0.06
Nodes (32): givePlayerTokens(), putCardInFace(), CHARMANDER, MOLTRES, SQUIRTLE, TWO_PLAYER, ZAPDOS, EEVEE (+24 more)

### Community 1 - "Game Selectors & Logic"
Cohesion: 0.11
Nodes (27): getGreedyMove(), bestScoutableTier3(), ENERGY_TYPES, focusType(), getHeuristicMove(), BALL_ORDER, bestAffordableCard(), bestTokenSelection() (+19 more)

### Community 2 - "Navigation & Screen Routing"
Cohesion: 0.09
Nodes (22): BreakdownRow, CardDetailModal(), computeBreakdown(), Props, s, LIGHT_TYPES, Props, styles (+14 more)

### Community 3 - "Settings Screen & Store"
Cohesion: 0.14
Nodes (25): getAIDiscard(), s, TokenDiscardModal(), PHASE, applyScout(), buildDecks(), claimLegendaries(), ENERGY_TYPES (+17 more)

### Community 4 - "Token Economy & Card Tests"
Cohesion: 0.1
Nodes (17): RootStackParamList, Stack, GameOverScreen(), Props, styles, AI_NAMES, GameSetupScreen(), Props (+9 more)

### Community 5 - "Deck Building & Balancing"
Cohesion: 0.14
Nodes (17): HomeScreen(), Props, s, SettingsScreen(), keysA, mockGetItem, mockSetItem, loadStoredThemeId() (+9 more)

### Community 6 - "Legendary & Mew Catch Tests"
Cohesion: 0.1
Nodes (18): ARTICUNO, caught, { game }, MEW, MEWTWO, TWO_PLAYER, ZAPDOS, cards (+10 more)

### Community 7 - "Turn Loop Tests"
Cohesion: 0.11
Nodes (15): action, BULBASAUR, card, CHARMANDER, discard, EEVEE, EXPENSIVE, game (+7 more)

### Community 8 - "Scout Card Tests"
Cohesion: 0.17
Nodes (10): canClaimLegendary(), alice, ARTICUNO, bob, CARD, CARD_5TP, FREE, MEW (+2 more)

### Community 9 - "Sprite Cache & URI"
Cohesion: 0.22
Nodes (7): BULBASAUR, FOUR_PLAYER, { game }, ONE_PLAYER, THREE_PLAYER, TWO_PLAYER, TWO_PLAYER_PNP

## Knowledge Gaps
- **125 isolated node(s):** `CardCost`, `LegendaryRequirements`, `Stack`, `Props`, `AI_NAMES` (+120 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useGameStore` connect `Token Economy & Card Tests` to `Game Constants & Setup`, `Game Selectors & Logic`, `Settings Screen & Store`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`, `Sprite Cache & URI`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `PokemonCard` connect `Game Constants & Setup` to `Game Selectors & Logic`, `Navigation & Screen Routing`, `Settings Screen & Store`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`, `Scout Card Tests`, `Sprite Cache & URI`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `Legendary` connect `Settings Screen & Store` to `Game Constants & Setup`, `Game Selectors & Logic`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`, `Scout Card Tests`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `CardCost`, `LegendaryRequirements`, `Stack` to the rest of the system?**
  _125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Constants & Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Game Selectors & Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Navigation & Screen Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._