# Graph Report - .  (2026-05-11)

## Corpus Check
- Corpus is ~9,422 words - fits in a single context window. You may not need a graph.

## Summary
- 142 nodes · 234 edges · 10 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

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
1. `PokemonCard` - 10 edges
2. `useGameStore` - 10 edges
3. `GameConfig` - 9 edges
4. `Legendary` - 8 edges
5. `Mythical` - 6 edges
6. `EnergyType` - 5 edges
7. `PlayerState` - 5 edges
8. `GameState` - 4 edges
9. `PHASE` - 3 edges
10. `TokenType` - 3 edges

## Surprising Connections (you probably didn't know these)
- `SettingsScreen()` --calls--> `useGameStore`  [EXTRACTED]
  screens/SettingsScreen.tsx → store/useGameStore.ts

## Communities (10 total, 0 thin omitted)

### Community 0 - "Game Constants & Setup"
Cohesion: 0.16
Nodes (22): BASE_CATCH_RATES, PHASE, applyScout(), buildDecks(), claimLegendaries(), makePlayer(), shuffle(), tierDeckKey() (+14 more)

### Community 1 - "Game Selectors & Logic"
Cohesion: 0.14
Nodes (17): canAfford(), canCatchMew(), canClaimLegendary(), currentPlayer(), trainerPoints(), { game }, names, player (+9 more)

### Community 2 - "Navigation & Screen Routing"
Cohesion: 0.11
Nodes (8): RootStackParamList, Stack, styles, Props, styles, styles, styles, styles

### Community 3 - "Settings Screen & Store"
Cohesion: 0.12
Nodes (14): SettingsScreen(), styles, useGameStore, CHARMANDER, MOLTRES, SQUIRTLE, TWO_PLAYER, ZAPDOS (+6 more)

### Community 4 - "Token Economy & Card Tests"
Cohesion: 0.15
Nodes (9): BULBASAUR, deckBefore, EEVEE, faceBefore, { game }, IVYSAUR, SCOUTED_ONLY, TWO_PLAYER (+1 more)

### Community 5 - "Deck Building & Balancing"
Cohesion: 0.17
Nodes (11): cards, counts, eevee, legs, m, nonEevee, nums, reqValues (+3 more)

### Community 6 - "Legendary & Mew Catch Tests"
Cohesion: 0.22
Nodes (7): ARTICUNO, caught, { game }, MEW, MEWTWO, TWO_PLAYER, ZAPDOS

### Community 7 - "Turn Loop Tests"
Cohesion: 0.22
Nodes (6): BULBASAUR, FOUR_PLAYER, { game }, THREE_PLAYER, TWO_PLAYER, TWO_PLAYER_PNP

### Community 8 - "Scout Card Tests"
Cohesion: 0.25
Nodes (6): BULBASAUR, { game }, maxCost, NOT_ON_BOARD, TWO_PLAYER, PokemonCard

### Community 9 - "Sprite Cache & URI"
Cohesion: 0.5
Nodes (3): mockGetItem, mockSetItem, getSpriteUri()

## Knowledge Gaps
- **71 isolated node(s):** `CardCost`, `LegendaryRequirements`, `Stack`, `styles`, `styles` (+66 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useGameStore` connect `Settings Screen & Store` to `Game Constants & Setup`, `Game Selectors & Logic`, `Token Economy & Card Tests`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`, `Scout Card Tests`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `PokemonCard` connect `Scout Card Tests` to `Game Constants & Setup`, `Game Selectors & Logic`, `Settings Screen & Store`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Turn Loop Tests`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `GameConfig` connect `Settings Screen & Store` to `Game Constants & Setup`, `Game Selectors & Logic`, `Token Economy & Card Tests`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`, `Scout Card Tests`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `CardCost`, `LegendaryRequirements`, `Stack` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Selectors & Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Navigation & Screen Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Settings Screen & Store` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._