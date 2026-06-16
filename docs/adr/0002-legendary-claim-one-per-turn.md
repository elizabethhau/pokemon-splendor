# ADR 0002: Legendary claim is one-per-turn, evaluated at end of turn

## Status
Accepted

## Context
Legendaries are auto-collected (not purchased) when a player's accumulated Type Bonuses meet the Legendary's requirements — mirroring Splendor noble tiles. The open questions were *when* eligibility is evaluated and *how many* Legendaries a player may claim in a single turn.

The original implementation evaluated eligibility mid-turn, the instant a Train action pushed Type Bonuses over a threshold, and granted **every** eligible Legendary at once. This let a single turn collect multiple Legendaries (up to 3 TP each), producing swingy, hard-to-read end states and skipping any player choice when several were simultaneously eligible.

In Splendor, a player may receive at most one noble per turn, and a player chooses when more than one qualifies. We want the same cadence here.

## Decision
- Legendaries remain **auto-collected and mandatory** — a player who is eligible will claim one; it is not opt-in.
- A player claims **at most one Legendary per turn**.
- Eligibility is evaluated **at the end of every turn**, not mid-action.
- If exactly one newly eligible Legendary exists, it is **auto-claimed**.
- If two or more are eligible, the **player picks one**; the rest carry over and remain eligible on later turns. The **AI picks deterministically by lowest Pokédex number**.
- The **first Legendary a player ever claims grants a MasterBall** (`firstLegendaryClaimed`). There is no per-claim Poké Ball.
- There is **no final-round special case** — the rule applies uniformly, including the last round.

## Alternatives considered
**Mid-turn, claim-all (original behavior):** Evaluate the instant requirements are met and grant every eligible Legendary at once. Simpler, but allows multi-Legendary turns, removes the pick-one decision, and diverges from Splendor's one-noble-per-turn cadence.

**End-of-turn, still claim-all:** Defers evaluation but keeps multi-claim turns — fixes timing but not the swinginess or the missing choice.

## Consequences
- Legendary acquisition is paced: a player accumulating Type Bonuses quickly still claims them one turn at a time, keeping scores legible.
- A genuine decision appears when 2+ Legendaries are eligible at once — which to take first matters (e.g. denying an opponent, or sequencing toward Mew's "owning any 2 Legendaries" gate).
- Carry-over means an unclaimed-but-eligible Legendary stays available; it is not lost and is not auto-assigned to another player.
- AI behavior is deterministic (lowest Pokédex number) and therefore testable.
- The MasterBall-for-first-Legendary reward is unchanged from current behavior.
- Implementation note (tracked separately in #40): the claim check moves out of the Train action and into end-of-turn resolution, and gains a player-choice step when multiple are eligible.
