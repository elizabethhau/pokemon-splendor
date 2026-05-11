# Pokemon Splendor — Domain Language

Terms used consistently throughout the codebase and design docs. When in doubt, use these names exactly.

---

## Core Resources

**Energy Token** — the spendable currency collected on a player's turn (one per type color + Ditto). Maximum 10 held at end of turn; player must discard down to 10 (player's choice) if over the limit. Analogous to gem tokens in Splendor.

**Ditto Token** — the wild Energy Token that substitutes any type. One per player action slot; 5 in supply. Analogous to gold in Splendor.

**Type Bonus** — the permanent discount a player gains from owning a Pokemon card. Each owned card contributes one Type Bonus of its color. Bonuses accumulate and reduce future card costs. Analogous to gem bonuses in Splendor.

---

## Cards

**Pokemon Card** — a purchasable card representing a Pokemon. Has a cost (in Energy Tokens), a Type Bonus color, and a Prestige Point value. Analogous to development cards in Splendor.

**Evolution Tier** — the level of a Pokemon Card (Tier 1 / Tier 2 / Tier 3). Determines deck placement, cost range, and point range. Analogous to card levels in Splendor.

- **Tier 1** — Basic Pokemon (unevolved or first in chain). Single-stage Pokemon with no evolutions (e.g., Scyther, Pinsir) are Tier 1. Eevee is Tier 1 with **no Type Bonus** (0-bonus card) — its identity is potential, not a fixed type.
- **Tier 2** — Stage 1 evolutions (second form in a 3-stage line; OR final form in a 2-stage line). Within Tier 2, cost and Prestige Point value reflect in-universe power — e.g., Arcanine costs more and scores more than Charmeleon, both being Tier 2.
- **Tier 3** — Stage 2 evolutions (final form in a 3-stage line only)

**Scouted Card** — a Pokemon Card held in a player's hand (max 3), not yet trained. Visible to the holding player only; hidden from opponents. The act of moving a card to hand is called **Scouting**.

**Train** — the act of purchasing a face-up or Scouted Pokemon Card by paying its cost in Energy Tokens and/or Type Bonuses.

---

## Special Pokemon

**Legendary** — one of 5 special Pokemon (Articuno, Zapdos, Moltres, Mewtwo, Dragonite) that are auto-collected (not purchased) when a player's accumulated Type Bonuses (from any tier of Pokemon Card) meet the Legendary's requirements. Worth 3 Trainer Points (TP). Analogous to noble tiles in Splendor.

**Mythical** — Mew (#151). Worth 5 Trainer Points (TP). Requires owning any 2 Legendaries to become eligible for a Catch Attempt. Multiple players can independently qualify; Mew is unique — first successful catch removes it from the game. Owning Mewtwo grants +10% to all Pokeball catch rates. Only one Mythical exists in Phase 1.

---

## Pokeball Mechanic

**Pokeball** — a one-use catch item earned passively when purchasing a Pokemon Card. Tier of Pokeball matches card tier purchased.

**Catch Attempt** — the Mew-specific action of spending a Pokeball to try to acquire Mew. "Catch" is reserved exclusively for this mechanic. Never used to describe Scouting.

---

## Points

**Trainer Points (TP)** — the scoring currency. Earned from Pokemon Cards (0–5 TP each), Legendaries (3 TP each), and Mew (5 TP). First player to reach 20 TP triggers the Final Round. Displayed as "TP" in the UI.

---

## Game Phases

**Turn** — one player's complete action within a round.

**Round** — one full cycle where every player has taken one Turn.

**Final Round** — the Round triggered when any player reaches 20 Trainer Points (TP). All remaining players complete the Round before scoring.

---

## Deck

**Deck Mode** — the Pokemon roster used in a game session. Two modes: "First 151" (all Kanto Pokemon) and "Balanced" (~25 per type, curated).

**EnergyType** — the color/type grouping of a Pokemon Card: `Fire | Water | Grass | Electric | Psychic`. Determines which Energy Tokens pay for it and what Type Bonus it provides. Maps to the 5 gem colors in Splendor and the Pokemon TCG's energy type system. Used as the TypeScript type name throughout the codebase.
