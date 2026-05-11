# Pokemon Splendor — Design Document

Splendor's board game engine reskinned with Pokemon theming. Fan project; not for commercial distribution.

---

## Platform

- **Framework:** React Native + Expo
- **Distribution:** Sideloaded Android APK (not published to any app store — avoids Pokemon IP enforcement)
- **Future:** iOS support possible via Expo, but not a current target

---

## Multiplayer Scope

| Phase | Mode | Notes |
|-------|------|-------|
| Phase 1 | Solo vs AI | Core game loop, single device |
| Phase 1 | Pass-and-play | Multiple players, one device, take turns |
| Phase 2 | Local WiFi | P2P via WebSockets + `react-native-zeroconf`, no backend needed |
| Out of scope | Online multiplayer | Not planned |

**Design note:** State model should be network-ready from day one so Phase 2 doesn't require a rewrite. All game state lives in a single serializable object.

---

## Pokemon Data Source

- **Roster:** First 151 Kanto Pokemon only (Phase 1)
- **Future phases:** Region selection (Johto, Hoenn, etc.) — region is a filter on the data model, not a structural change
- **Data strategy:** Curated local JSON defining the roster + card assignments; sprites fetched from PokeAPI CDN on first load and cached locally
- **No runtime dependency** on PokeAPI for game logic — only for sprite assets

---

## Thematic Mapping

### Gem Colors → Pokemon Types

| Splendor gem | Pokemon type | Token color | Kanto Legendary |
|-------------|--------------|-------------|-----------------|
| Ruby | Fire | Red | Moltres |
| Sapphire | Water | Blue | Articuno |
| Emerald | Grass | Green | Dragonite (pseudo-legendary, mixed-type requirements) |
| Diamond | Electric | Yellow | Zapdos |
| Onyx | Psychic | Purple | Mewtwo |
| Gold (wild) | — | Gold/Rainbow | **Ditto** |

### Deck Modes (player-selectable at game setup)

**Two modes ship with Phase 1. Both use the same type mapping. Deck composition is user-modifiable via a settings screen (future).**

#### Mode 1: "First 151" (Full Kanto)
All 151 Kanto Pokemon in the game deck (~144 playable cards after removing Ditto, Legendaries, Mew).

Revised type mapping (Fix A) to improve balance over naive assignment:

| Game type | Pokemon types absorbed | Approx. count |
|-----------|----------------------|---------------|
| Fire | Fire + Fighting + Rock | ~29 |
| Water | Water + Ice only (no Ground/Rock) | ~29 |
| Grass | Grass + Bug + Poison + Dragon | ~37 |
| Electric | Electric + Normal + Flying + Ground | ~30 |
| Psychic | Psychic + Ghost + "mystical" Normals (Clefairy, Jigglypuff, Chansey lines) + Jynx | ~19 |

*"Mystical" Normal rationale: Clefairy, Jigglypuff, and Chansey have strong fairy/psychic lore and feel — moving them to Psychic is thematically defensible and meaningfully balances the buckets.*

#### Mode 2: "Balanced" (Curated 125)
~25 iconic Pokemon per type, hand-picked for clean evolution lines and recognizability. Uses the same type mapping as Mode 1. Specific roster TBD at implementation — prioritize iconic evolution lines (starters, Eevee-lutions, Pseudo-legendaries) and full 3-stage chains where possible.

Deck composition for both modes is stored in editable JSON config so players can swap Pokemon in/out later without a code change.

### Card Tiers → Evolution Stages

| Splendor tier | Pokemon equivalent | Examples |
|--------------|--------------------|---------|
| Level 1 | Basic Pokemon (no evolution or first in chain) | Charmander, Pikachu, Abra |
| Level 2 | Stage 1 evolutions | Charmeleon, Kadabra |
| Level 3 | Stage 2 evolutions (final forms of 3-stage lines) | Charizard, Alakazam |

Single-stage Pokemon with no evolutions (e.g., Scyther, Pinsir) are Level 1 cards.

### Legendaries → Noble Equivalents

Legendaries are **auto-collected** (not purchased) when a player's accumulated Type Bonuses (from any tier of Pokemon Card) meet the Legendary's specific requirements. Worth **3 Trainer Points (TP)** each.

| Legendary | TP | Requirement |
|-----------|-----|-------------|
| Articuno | 3 | 4 Water + 3 Psychic Type Bonuses |
| Zapdos | 3 | 4 Electric + 3 Fire Type Bonuses |
| Moltres | 3 | 4 Fire + 3 Grass Type Bonuses |
| Mewtwo | 3 | 4 Psychic + 3 Water Type Bonuses |
| Dragonite | 3 | 3 Grass + 3 Electric + 2 Fire Type Bonuses |

Requirements are subject to revision after playtesting — stored in JSON config alongside card data.

### Mythical Tier — Mew (#151)

- **Only one Mythical card in Phase 1** (Kanto has only Mew)
- Worth **5 Trainer Points (TP)**
- Unlocks Catch Attempt once player owns **any 2 Legendaries**
- Multiple players can independently qualify; Mew is a single card — first successful catch wins it
- Catch outcome determined by **Pokeball tier mechanic** (see below)
- **Mewtwo bonus:** owning Mewtwo grants +10% to all Pokeball catch rates (Pokeball 50%, Great Ball 75%, Ultra Ball 95%, Master Ball 100%)

---

## Pokeball Tier Mechanic (Mythical Catch)

Pokeballs are a shadow economy earned passively through card purchases — no extra action required.

| Pokeball | Catch rate | How earned |
|----------|-----------|------------|
| Pokeball | 40% | Purchasing any Level 1 card |
| Great Ball | 65% | Purchasing any Level 2 card |
| Ultra Ball | 85% | Purchasing any Level 3 card |
| Master Ball | 100% (guaranteed) | One-time reward: first player to collect any Legendary |

- Players choose which ball to spend when making a Catch Attempt
- Spending a ball is a one-time use regardless of outcome — failed attempts always consume the ball
- Failed attempt: player must wait until their next turn to try again
- **No Pokeball inventory cap** (Phase 1 — add cap in settings if playtesting reveals hoarding issues; trivial to add without state model changes)

---

## Win Condition

**First to 20 Trainer Points (TP)** triggers the Final Round (all remaining players complete the current round; highest TP wins; fewest Pokemon Trained breaks ties).

Point sources:
- Level 1-3 Pokemon cards: 0–5 pts each (same distribution as Splendor)
- Legendary cards: 3 pts each (auto-collected)
- Mew: 5 pts (catch mechanic)

Three viable paths to 20:
1. **Card grinder:** Heavy card engine, 1-2 Legendaries
2. **Mew hunter:** Moderate cards + 1 Legendary + Mew
3. **Legendary collector:** Cards + 2-3 Legendaries (Dragonite mixed-type strat)

---

## Visual Style

**Pokemon TCG-inspired:**
- Card frames with type-color borders
- Type badges (Fire/Water/etc.) as visual gem indicators
- PokeAPI official sprites as card art
- Rarity borders to distinguish card tiers
- Token representation: colored circles with type icons

---

## Sound

- **SFX only** (no background music)
- Library: `expo-av`
- Key sound moments: token take, card purchase, card reserve, Legendary auto-collect fanfare, Pokeball throw + catch/fail outcome, Mew catch fanfare, game over
- Background music: Phase 2 consideration

---

## AI Opponent

Two difficulty levels for solo play:

| Level | Strategy |
|-------|----------|
| **Easy (Greedy)** | Takes the highest immediate-value legal move — buy the cheapest affordable card, otherwise grab the most tokens |
| **Normal (Heuristic)** | Scores moves by progress toward a target evolution line, tracks Legendary requirements, avoids handing opponent easy wins |

No MCTS/minimax — overkill for a casual mobile game and expensive on-device.

---

## Turn Structure

Each turn, a player takes **exactly one** of five actions:

1. **Take Energy Tokens** — take 3 tokens of different types, OR take 2 of the same type (only if ≥4 of that type remain)
2. **Train a Pokemon Card** — pay its cost in Energy Tokens + Type Bonuses; take a face-up card or a Scouted card from hand
3. **Scout a Pokemon Card** — move a face-up card (or top of any tier's deck, face-down) to hand (max 3 Scouted); gain 1 Ditto token if available. Face-up slot is refilled from the matching tier deck (slot left empty if deck is exhausted). Scouting player always sees their own Scouted card; opponents see only a face-down card back. Card detail modal checks active player identity before revealing contents.
4. **Catch Attempt** — spend one Pokeball to attempt catching Mew; only available when player holds 2+ Legendaries and 1+ Pokeball *(eligible players only)*

After the action (automatic, free):
- **Legendary check:** if Type Bonuses now meet any unclaimed Legendary's requirement, that Legendary is auto-collected (multiple possible in one check)
- **Token discard check:** if holding >10 Energy Tokens, must discard down to 10 (player's choice)

**Note:** Catching Mew is a full turn action — the risk of failure makes Pokeball timing genuinely strategic.

---

## Token Economy

- **Supply:** 7 of each type Energy Token + 5 Ditto tokens (unchanged from Splendor)
- **Hand limit:** Maximum 10 Energy Tokens at end of turn. If over, player must discard down to 10 (player's choice of which to discard). This is a mandatory post-action check.
- **Take 3 different rule:** Player may take 1 token of 3 different types, OR take 2 of the same type (only if ≥4 of that type are in supply before taking)

---

## UX Mechanics

- **Turn timer:** None (untimed — thinking game, timer changes the feel)
- **Move confirmation:** Confirm-before-commit on all actions (token selection, Train, Scout, Pokeball throw). Single confirm step before state is locked. Actions are final after confirmation — no undo.
- **Action vocabulary:** Scout (reserve a card), Train (purchase a card), Catch Attempt (Mew-only Pokeball mechanic). "Catch" is never used for Scouting.

---

## Tech Stack

| Concern | Library |
|---------|---------|
| Framework | React Native + Expo (managed workflow) |
| Language | TypeScript |
| State management | Zustand |
| Navigation | React Navigation (stack + modal) |
| Animations | React Native Reanimated 3 |
| Sound | expo-av |
| Local persistence | AsyncStorage (stats, Pokedex, deck config) |
| Sprite assets | PokeAPI CDN — lazy-fetched on first load, cached locally |
| Phase 2 networking | react-native-zeroconf (device discovery) + WebSockets (P2P state sync) |

---

## Pass-and-Play Handoff

- **Transition screen:** "Hand the phone to [Player Name] — tap when ready" interstitial between turns
- **Scouted card visibility:** Opponent's Scouted cards shown as face-down card backs (count visible, contents hidden)
- Player must physically hand device before tapping through — honor system on timing, but hidden information is enforced digitally

---

## Screen Architecture

React Navigation with stack + modal pattern (not Expo Router — game screens aren't URL-addressable concepts).

```
Home
├── New Game → Game Setup (player count, AI difficulty, solo vs pass-and-play)
│   └── Game Board                ← primary screen
│       ├── Card Detail (modal)
│       ├── Player Hand (modal/drawer)
│       └── Game Over → Game History/Stats
├── How to Play (Rulebook)        ← static, tabbed sections (Phase 1); interactive tutorial (Phase 2)
├── Game History / Stats
├── Pokedex
└── Settings (sound, theme)
```

### Rulebook Screen
Static scrollable display, tabbed by section: Overview, Turn Actions, Cards & Evolution, Legendaries, Mew & Pokeballs, Winning. Always available offline.

### Stats Screen
Tracked locally via AsyncStorage (no backend):
- Games played / won / lost (broken down by mode: solo vs AI, pass-and-play)
- Current win streak
- Mew catch attempts vs successes (catch rate %)
- Fastest win (fewest turns to reach 20 pts)

### Pokedex Screen
Persistent collection tracker across all sessions. Shows all 151 Kanto Pokemon:
- Greyed out / silhouette = never purchased in any session
- Full color = acquired at least once
- Tracks acquisition count and (optionally) first acquired date
- Stored locally via AsyncStorage alongside stats

---

## Phase 2 Additions (Planned, Not Designed)

1. **Local WiFi multiplayer:** P2P via WebSockets + Zeroconf device discovery. Host/join session flow. No server required.
2. **Legendary power-ups (Option C):** Each Legendary can be "encountered" once per game — spend a Ditto token + meet type requirement to gain a one-time special ability (e.g., Zapdos: take 4 Electric tokens; Articuno: freeze opponent's reserved card for one turn) plus 2 pts.
3. **Region expansion:** Johto, Hoenn, etc. as selectable deck sources. Region = data filter, no rule changes needed.
