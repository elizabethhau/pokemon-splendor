# Graph Report - pokemon-splendor  (2026-06-12)

## Corpus Check
- 35 files · ~19,984 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 236 nodes · 505 edges · 9 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7e99c592`
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
- `CardDetailModal()` --calls--> `canAfford()`  [EXTRACTED]
  components/CardDetailModal.tsx → store/selectors.ts
- `TokenDiscardModal()` --calls--> `currentPlayer()`  [EXTRACTED]
  components/TokenDiscardModal.tsx → store/selectors.ts

## Communities (9 total, 0 thin omitted)

### Community 0 - "Game Constants & Setup"
Cohesion: 0.07
Nodes (25): BreakdownRow, CardDetailModal(), computeBreakdown(), Props, s, LIGHT_TYPES, Props, styles (+17 more)

### Community 1 - "Game Selectors & Logic"
Cohesion: 0.06
Nodes (27): givePlayerTokens(), putCardInFace(), CHARMANDER, MOLTRES, SQUIRTLE, TWO_PLAYER, ZAPDOS, EEVEE (+19 more)

### Community 2 - "Navigation & Screen Routing"
Cohesion: 0.08
Nodes (21): TokenDiscardModal(), RootStackParamList, Stack, GameOverScreen(), Props, styles, AI_NAMES, GameSetupScreen() (+13 more)

### Community 3 - "Settings Screen & Store"
Cohesion: 0.16
Nodes (24): getGreedyMove(), bestScoutableTier3(), ENERGY_TYPES, focusType(), getHeuristicMove(), BALL_ORDER, bestAffordableCard(), bestTokenSelection() (+16 more)

### Community 4 - "Token Economy & Card Tests"
Cohesion: 0.15
Nodes (21): applyScout(), buildDecks(), claimLegendaries(), ENERGY_TYPES, makePlayer(), maxDifferentTakeable(), shuffle(), tierDeckKey() (+13 more)

### Community 5 - "Deck Building & Balancing"
Cohesion: 0.1
Nodes (18): ARTICUNO, caught, { game }, MEW, MEWTWO, TWO_PLAYER, ZAPDOS, cards (+10 more)

### Community 6 - "Legendary & Mew Catch Tests"
Cohesion: 0.11
Nodes (16): getAIDiscard(), action, BULBASAUR, card, CHARMANDER, discard, EEVEE, EXPENSIVE (+8 more)

### Community 7 - "Turn Loop Tests"
Cohesion: 0.12
Nodes (12): { game }, { takeTokens }, total, totalAfter, TWO_PLAYER, BULBASAUR, FOUR_PLAYER, { game } (+4 more)

### Community 8 - "Scout Card Tests"
Cohesion: 0.17
Nodes (10): canClaimLegendary(), alice, ARTICUNO, bob, CARD, CARD_5TP, FREE, MEW (+2 more)

## Knowledge Gaps
- **118 isolated node(s):** `CardCost`, `LegendaryRequirements`, `Stack`, `Props`, `AI_NAMES` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PokemonCard` connect `Game Selectors & Logic` to `Game Constants & Setup`, `Settings Screen & Store`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`, `Scout Card Tests`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `useGameStore` connect `Navigation & Screen Routing` to `Game Constants & Setup`, `Game Selectors & Logic`, `Settings Screen & Store`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `GameConfig` connect `Game Selectors & Logic` to `Navigation & Screen Routing`, `Settings Screen & Store`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `CardCost`, `LegendaryRequirements`, `Stack` to the rest of the system?**
  _118 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Constants & Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Game Selectors & Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Navigation & Screen Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._