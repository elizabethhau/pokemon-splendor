# Graph Report - pokemon-splendor  (2026-06-14)

## Corpus Check
- 64 files · ~28,659 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 362 nodes · 863 edges · 20 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e1d5dae2`
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
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 32 edges
2. `PokemonCard` - 24 edges
3. `useGameStore` - 24 edges
4. `EnergyType` - 17 edges
5. `GameConfig` - 16 edges
6. `TokenType` - 14 edges
7. `currentPlayer()` - 13 edges
8. `PlayerState` - 12 edges
9. `TYPE_COLORS` - 11 edges
10. `Legendary` - 11 edges

## Surprising Connections (you probably didn't know these)
- `HomeScreen()` --calls--> `useTheme()`  [EXTRACTED]
  screens/HomeScreen.tsx → theme/ThemeContext.tsx
- `ScoutedHandModal()` --calls--> `useTheme()`  [EXTRACTED]
  components/ScoutedHandModal.tsx → theme/ThemeContext.tsx
- `DeckRail()` --calls--> `useTheme()`  [EXTRACTED]
  components/board/DeckRail.tsx → theme/ThemeContext.tsx
- `GameSetupScreen()` --calls--> `useTheme()`  [EXTRACTED]
  screens/GameSetupScreen.tsx → theme/ThemeContext.tsx
- `GameBoardScreen()` --calls--> `useGameStore`  [EXTRACTED]
  screens/GameBoardScreen.tsx → store/useGameStore.ts

## Communities (20 total, 0 thin omitted)

### Community 0 - "Game Constants & Setup"
Cohesion: 0.09
Nodes (28): AIMoveOutcome, DECK_LABELS, formatAIMove(), Rect, DeckRail(), TierRowData, BALL_LABELS, BALL_ORDER (+20 more)

### Community 1 - "Game Selectors & Logic"
Cohesion: 0.1
Nodes (35): getGreedyMove(), bestScoutableTier3(), ENERGY_TYPES, focusType(), getHeuristicMove(), BALL_ORDER, bestAffordableCard(), bestTokenSelection() (+27 more)

### Community 2 - "Navigation & Screen Routing"
Cohesion: 0.09
Nodes (26): buildGameConfig(), SetupDifficulty, SetupMode, AI_NAMES, Difficulty, Mode, Props, s (+18 more)

### Community 3 - "Settings Screen & Store"
Cohesion: 0.11
Nodes (25): BoardCard(), TIER_LABELS, BALL_ORDER, Dock(), ENERGY_TYPES, LegendariesColumn(), AnimatedTouchable, SupplyColumn() (+17 more)

### Community 4 - "Token Economy & Card Tests"
Cohesion: 0.1
Nodes (20): BreakdownRow, CardDetailModal(), computeBreakdown(), Props, s, TIER_NAMES, Props, ScoutedHandModal() (+12 more)

### Community 5 - "Deck Building & Balancing"
Cohesion: 0.09
Nodes (14): RootStackParamList, Stack, GameOverScreen(), Props, styles, HomeScreen(), Props, s (+6 more)

### Community 6 - "Legendary & Mew Catch Tests"
Cohesion: 0.11
Nodes (11): LIGHT_TYPES, Props, styles, TIER_COLORS, LIGHT_TYPES, Props, styles, mockGetItem (+3 more)

### Community 7 - "Turn Loop Tests"
Cohesion: 0.1
Nodes (18): ARTICUNO, caught, { game }, MEW, MEWTWO, TWO_PLAYER, ZAPDOS, cards (+10 more)

### Community 8 - "Scout Card Tests"
Cohesion: 0.15
Nodes (12): givePlayerTokens(), putCardInFace(), BULBASAUR, deckBefore, EEVEE, faceBefore, { game }, IVYSAUR (+4 more)

### Community 9 - "Sprite Cache & URI"
Cohesion: 0.17
Nodes (10): canClaimLegendary(), alice, ARTICUNO, bob, CARD, CARD_5TP, FREE, MEW (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (8): useBoardScale(), s, ToastContext, useToast(), s, TokenDiscardModal(), applyScout(), totalTokens()

### Community 11 - "Community 11"
Cohesion: 0.2
Nodes (8): BASE_CATCH_RATES, claimLegendaries(), tierDeckKey(), tierFaceKey(), DiscardSelection, GameStore, TokenSelection, GamePhase

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (7): BULBASAUR, FOUR_PLAYER, { game }, ONE_PLAYER, THREE_PLAYER, TWO_PLAYER, TWO_PLAYER_PNP

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (7): CatchBall, BALLS, base, onClose, onPickBall, onThrow, { rerender }

### Community 14 - "Community 14"
Cohesion: 0.25
Nodes (6): CHARMANDER, MOLTRES, SQUIRTLE, TWO_PLAYER, ZAPDOS, Legendary

### Community 15 - "Community 15"
Cohesion: 0.25
Nodes (6): GameSetupScreen(), SettingsScreen(), useGameStore, EEVEE, TWO_PLAYER, VENUSAUR

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (4): discardTokens, TWO_PLAYER, TWO_PLAYER, GameConfig

### Community 17 - "Community 17"
Cohesion: 0.33
Nodes (5): BULBASAUR, { game }, maxCost, NOT_ON_BOARD, TWO_PLAYER

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (5): { game }, { takeTokens }, total, totalAfter, TWO_PLAYER

### Community 19 - "Community 19"
Cohesion: 0.4
Nodes (4): { game }, names, player, TWO_PLAYER

## Knowledge Gaps
- **164 isolated node(s):** `CardCost`, `LegendaryRequirements`, `Stack`, `Props`, `SegOption` (+159 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PokemonCard` connect `Token Economy & Card Tests` to `Game Constants & Setup`, `Game Selectors & Logic`, `Settings Screen & Store`, `Legendary & Mew Catch Tests`, `Turn Loop Tests`, `Scout Card Tests`, `Sprite Cache & URI`, `Community 11`, `Community 12`, `Community 14`, `Community 15`, `Community 17`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `useGameStore` connect `Community 15` to `Game Constants & Setup`, `Game Selectors & Logic`, `Navigation & Screen Routing`, `Deck Building & Balancing`, `Turn Loop Tests`, `Scout Card Tests`, `Community 10`, `Community 11`, `Community 12`, `Community 14`, `Community 16`, `Community 17`, `Community 18`, `Community 19`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `useTheme()` connect `Settings Screen & Store` to `Game Constants & Setup`, `Game Selectors & Logic`, `Navigation & Screen Routing`, `Token Economy & Card Tests`, `Deck Building & Balancing`, `Community 10`, `Community 15`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `CardCost`, `LegendaryRequirements`, `Stack` to the rest of the system?**
  _164 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Constants & Setup` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Game Selectors & Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Navigation & Screen Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._