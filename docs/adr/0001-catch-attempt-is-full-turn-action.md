# ADR 0001: Catch Attempt costs a full turn action

## Status
Accepted

## Context
The game has two types of post-action events for special Pokemon:
- **Legendaries** are auto-collected for free after any action, when Type Bonus requirements are met (mirrors Splendor noble tiles).
- **Mew (Mythical)** requires a Catch Attempt using a Pokeball with a probabilistic outcome (40–100% depending on tier).

The question was whether a Catch Attempt should also be a free post-action trigger or a dedicated turn action.

## Decision
A Catch Attempt costs a player their entire turn — it is the fourth (and conditional) action option, not a free bonus.

## Alternatives considered
**Free action after main action:** Player grabs tokens or trains a card, then immediately throws a Pokeball on the same turn. Simpler, but deflates the strategic weight of the Pokeball mechanic — a failed catch costs nothing, so there's no real tension around when to attempt.

## Consequences
- A failed Catch Attempt wastes a full turn, making Pokeball tier choice (Great Ball vs Ultra Ball vs waiting) genuinely strategic.
- The Mew race becomes a real opportunity cost: attempting Mew means forgoing token-gathering, Training, or Scouting that turn.
- Implementation: the turn action picker shows "Catch Attempt" as a fifth option only when the player holds 2+ Legendaries and at least 1 Pokeball.
