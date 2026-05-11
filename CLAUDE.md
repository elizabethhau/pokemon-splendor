# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Principles

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Project

Pokemon Splendor — a mobile card game app inspired by Splendor's engine (gem economy, card tiers, noble tiles) reskinned with Pokemon theming.

## Architecture

Expo managed workflow (SDK 54), TypeScript, React Native.

- **State:** Zustand (`src/store/useGameStore.ts`) — single serialisable `GameState` object
- **Navigation:** React Navigation native stack (`src/navigation/AppNavigator.tsx`) — `RootStackParamList` is the source of truth for screen types
- **Animations:** React Native Reanimated 3 — use worklets, not JS-thread callbacks
- **Sound:** expo-av, wired to game events
- **Persistence:** AsyncStorage (stats, Pokedex, deck config)
- **Pokemon data:** `src/data/first-151.json` and `src/data/balanced.json` — Legendaries and Mew defined separately; sprites fetched from PokeAPI CDN and cached

Key domain vocabulary is in `CONTEXT.md`. Design decisions in `docs/design.md`. ADRs in `docs/adr/`.

## Development Commands

```bash
# Requires Node 20 — run first if on a different version:
source ~/.nvm/nvm.sh && nvm use 20

# Start dev server
npx expo start

# Type check
npx tsc --noEmit

# Run on Android (device or emulator)
npx expo run:android
```
