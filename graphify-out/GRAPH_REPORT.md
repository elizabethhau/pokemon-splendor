# Graph Report - pokemon-splendor  (2026-06-16)

## Corpus Check
- 67 files · ~30,188 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 384 nodes · 914 edges · 17 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f5dbf941`
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
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 34 edges
2. `PokemonCard` - 25 edges
3. `useGameStore` - 25 edges
4. `EnergyType` - 18 edges
5. `GameConfig` - 17 edges
6. `PlayerState` - 17 edges
7. `TokenType` - 15 edges
8. `currentPlayer()` - 13 edges
9. `TYPE_COLORS` - 12 edges
10. `Legendary` - 12 edges

## Surprising Connections (you probably didn't know these)
- `HomeScreen()` --calls--> `useTheme()`  [EXTRACTED]
  screens/HomeScreen.tsx → theme/ThemeContext.tsx
- `ConfirmModal()` --calls--> `useTheme()`  [EXTRACTED]
  components/ConfirmModal.tsx → theme/ThemeContext.tsx
- `SupplyColumn()` --calls--> `useTheme()`  [EXTRACTED]
  components/board/SupplyColumn.tsx → theme/ThemeContext.tsx
- `GameSetupScreen()` --calls--> `useTheme()`  [EXTRACTED]
  screens/GameSetupScreen.tsx → theme/ThemeContext.tsx
- `GameSetupScreen()` --calls--> `useGameStore`  [EXTRACTED]
  screens/GameSetupScreen.tsx → store/useGameStore.ts

## Communities (17 total, 0 thin omitted)

### Community 0 - "Game Constants & Setup"
Cohesion: 0.05
Nodes (43): Props, CostRow, canAfford(), canClaimLegendary(), ENERGY_TYPES, cards, counts, eevee (+35 more)

### Community 1 - "Game Selectors & Logic"
Cohesion: 0.07
Nodes (38): BoardCard(), TIER_LABELS, DeckRail(), TierRowData, BALL_ORDER, Dock(), ENERGY_TYPES, LegendariesColumn() (+30 more)

### Community 2 - "Navigation & Screen Routing"
Cohesion: 0.06
Nodes (31): AIMoveOutcome, DECK_LABELS, formatAIMove(), Rect, AnimatedTouchable, SupplyColumn(), TOKEN_ORDER, TokenChip() (+23 more)

### Community 3 - "Settings Screen & Store"
Cohesion: 0.1
Nodes (33): getGreedyMove(), bestScoutableTier3(), ENERGY_TYPES, focusType(), getHeuristicMove(), BALL_ORDER, bestAffordableCard(), bestTokenSelection() (+25 more)

### Community 4 - "Token Economy & Card Tests"
Cohesion: 0.08
Nodes (27): buildGameConfig(), SetupDifficulty, SetupMode, AI_NAMES, Difficulty, GameSetupScreen(), Mode, Props (+19 more)

### Community 5 - "Deck Building & Balancing"
Cohesion: 0.09
Nodes (24): useBoardScale(), s, ToastContext, useToast(), s, TokenDiscardModal(), applyScout(), buildDecks() (+16 more)

### Community 6 - "Legendary & Mew Catch Tests"
Cohesion: 0.09
Nodes (14): RootStackParamList, Stack, GameOverScreen(), Props, styles, HomeScreen(), Props, s (+6 more)

### Community 7 - "Turn Loop Tests"
Cohesion: 0.21
Nodes (10): SettingsScreen(), useGameStore, givePlayerTokens(), putCardInFace(), BULBASAUR, { game }, maxCost, NOT_ON_BOARD (+2 more)

### Community 8 - "Scout Card Tests"
Cohesion: 0.17
Nodes (10): BULBASAUR, deckBefore, EEVEE, faceBefore, { game }, IVYSAUR, NOT_AVAILABLE, SCOUTED_ONLY (+2 more)

### Community 9 - "Sprite Cache & URI"
Cohesion: 0.2
Nodes (6): ARTICUNO, CHARMANDER, MOLTRES, SQUIRTLE, TWO_PLAYER, ZAPDOS

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (7): BULBASAUR, FOUR_PLAYER, { game }, ONE_PLAYER, THREE_PLAYER, TWO_PLAYER, TWO_PLAYER_PNP

### Community 11 - "Community 11"
Cohesion: 0.22
Nodes (7): ARTICUNO, caught, { game }, MEW, MEWTWO, TWO_PLAYER, ZAPDOS

### Community 12 - "Community 12"
Cohesion: 0.25
Nodes (7): CatchBall, BALLS, base, onClose, onPickBall, onThrow, { rerender }

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (5): { game }, { takeTokens }, total, totalAfter, TWO_PLAYER

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (3): EEVEE, TWO_PLAYER, VENUSAUR

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (3): discardTokens, TWO_PLAYER, GameConfig

### Community 16 - "Community 16"
Cohesion: 0.4
Nodes (3): game, onInspectOpponent, TWO_PLAYER

## Knowledge Gaps
- **174 isolated node(s):** `CardCost`, `LegendaryRequirements`, `Stack`, `Props`, `SegOption` (+169 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PokemonCard` connect `Game Constants & Setup` to `Game Selectors & Logic`, `Navigation & Screen Routing`, `Settings Screen & Store`, `Deck Building & Balancing`, `Turn Loop Tests`, `Scout Card Tests`, `Sprite Cache & URI`, `Community 10`, `Community 14`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `useGameStore` connect `Turn Loop Tests` to `Game Constants & Setup`, `Navigation & Screen Routing`, `Settings Screen & Store`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`, `Scout Card Tests`, `Sprite Cache & URI`, `Community 10`, `Community 11`, `Community 13`, `Community 14`, `Community 15`, `Community 16`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Game Selectors & Logic` to `Game Constants & Setup`, `Navigation & Screen Routing`, `Settings Screen & Store`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `CardCost`, `LegendaryRequirements`, `Stack` to the rest of the system?**
  _174 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Constants & Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Game Selectors & Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Navigation & Screen Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._