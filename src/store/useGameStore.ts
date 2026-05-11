import { create } from 'zustand';
import { DeckMode, EnergyType, EvolutionTier, GameConfig, GameState, PlayerState, PokemonCard, Legendary, Mythical, PokeballTier, BoardState } from '../types/game';
import first151Data from '../data/first-151.json';
import legData from '../data/legendaries.json';
import mewData from '../data/mew.json';
import { trainerPoints } from './selectors';

type TokenSelection = Partial<Record<EnergyType, number>>;
type DiscardSelection = Partial<Record<EnergyType | 'Ditto', number>>;

interface GameStore {
  soundEnabled: boolean;
  toggleSound: () => void;

  game: GameState | null;
  initGame: (config: GameConfig) => void;
  advanceTurn: () => void;
  takeTokens: (tokens: TokenSelection) => void;
  discardTokens: (tokens: DiscardSelection) => void;
  trainCard: (card: PokemonCard) => void;
  scoutFaceUp: (card: PokemonCard) => void;
  scoutFromDeck: (tier: EvolutionTier) => void;
  catchMew: (ball: PokeballTier, rng?: () => number) => boolean;
  acknowledgeHandoff: () => void;
}

function totalTokens(energyTokens: Partial<Record<string, number>>): number {
  return Object.values(energyTokens).reduce<number>((s, n) => s + (n ?? 0), 0);
}

function claimLegendaries(
  typeBonuses: Partial<Record<string, number>>,
  available: Legendary[],
): Legendary[] {
  return available.filter(leg =>
    Object.entries(leg.requirements).every(
      ([type, required]) => (typeBonuses[type] ?? 0) >= (required ?? 0)
    )
  );
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildDecks(deckMode: DeckMode) {
  // Phase 1: only first151 mode; balanced mode reuses same data until #16 ships
  const allCards = first151Data.cards as PokemonCard[];
  const tier1 = shuffle(allCards.filter(c => c.evolutionTier === 1));
  const tier2 = shuffle(allCards.filter(c => c.evolutionTier === 2));
  const tier3 = shuffle(allCards.filter(c => c.evolutionTier === 3));
  return { tier1, tier2, tier3 };
}

function makePlayer(name: string, isAI: boolean, index: number): PlayerState {
  return {
    id: `player-${index}`,
    name,
    isAI,
    energyTokens: {},
    typeBonuses: {},
    trainedCards: [],
    scoutedCards: [],
    legendaries: [],
    mythical: null,
    pokeballs: {},
  };
}

function applyDittoGrant(
  player: PlayerState,
  dittoInSupply: number,
): { newPlayer: PlayerState; newDittoSupply: number } {
  const dittoGain = dittoInSupply > 0 ? 1 : 0;
  return {
    newPlayer: {
      ...player,
      energyTokens: {
        ...player.energyTokens,
        Ditto: (player.energyTokens.Ditto ?? 0) + dittoGain,
      },
    },
    newDittoSupply: dittoInSupply - dittoGain,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  soundEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  game: null,

  initGame: (config: GameConfig) => {
    const players = config.playerNames.map((name, i) =>
      makePlayer(name, config.aiFlags[i] ?? false, i)
    );

    const { tier1, tier2, tier3 } = buildDecks(config.deckMode);

    set({
      game: {
        config,
        players,
        board: {
          tier1Deck: tier1.slice(4),
          tier2Deck: tier2.slice(4),
          tier3Deck: tier3.slice(4),
          tier1Face: tier1.slice(0, 4),
          tier2Face: tier2.slice(0, 4),
          tier3Face: tier3.slice(0, 4),
          energySupply: {
            Fire: 7, Water: 7, Grass: 7, Electric: 7, Psychic: 7, Ditto: 5,
          },
          availableLegendaries: legData.legendaries as Legendary[],
          firstLegendaryClaimed: false,
          mew: mewData.mythical as Mythical,
        },
        currentPlayerIndex: 0,
        phase: 'playing',
        finalRoundTriggerPlayerIndex: null,
        pendingHandoff: false,
        turnNumber: 1,
      },
    });
  },

  advanceTurn: () => {
    const { game } = get();
    if (!game) return;
    if (game.phase === 'discarding') throw new Error('Must discard tokens to ≤10 before ending turn');
    if (game.phase === 'gameOver') throw new Error('Game is over');

    const prevPlayer = game.players[game.currentPlayerIndex];
    const prevTP = trainerPoints(prevPlayer);
    const next = (game.currentPlayerIndex + 1) % game.players.length;
    const nextTurn = game.turnNumber + 1;

    let phase: GameState['phase'] = game.phase;
    let finalRoundTriggerPlayerIndex = game.finalRoundTriggerPlayerIndex;

    if (phase === 'playing' && prevTP >= 20) {
      phase = 'finalRound';
      finalRoundTriggerPlayerIndex = game.currentPlayerIndex;
    }

    if (phase === 'finalRound' && next === finalRoundTriggerPlayerIndex) {
      phase = 'gameOver';
    }

    const pendingHandoff = game.config.passAndPlay && phase !== 'gameOver';

    set({
      game: {
        ...game,
        currentPlayerIndex: next,
        turnNumber: nextTurn,
        phase,
        finalRoundTriggerPlayerIndex,
        pendingHandoff,
      },
    });
  },

  takeTokens: (tokens: TokenSelection) => {
    const { game } = get();
    if (!game) return;
    if (game.pendingHandoff) throw new Error('Acknowledge handoff before acting');
    if (game.phase === 'discarding') throw new Error('Must discard tokens first');
    if (game.phase === 'gameOver') throw new Error('Game is over');

    const entries = Object.entries(tokens) as [EnergyType, number][];
    const supply = game.board.energySupply;

    // Validate: 3 different (all values 1, 3 distinct types) or 2 same (one type, value 2)
    const isThreeDiff = entries.length === 3 && entries.every(([, n]) => n === 1);
    const isTwoSame = entries.length === 1 && entries[0][1] === 2;
    if (!isThreeDiff && !isTwoSame) {
      throw new Error('Invalid token selection: must take 3 different types or 2 of the same type');
    }

    // Validate supply
    for (const [type, count] of entries) {
      const available = supply[type] ?? 0;
      if (available < count) {
        throw new Error(`Not enough ${type} tokens in supply`);
      }
      if (isTwoSame && available < 4) {
        throw new Error(`Need ≥4 ${type} tokens in supply to take 2`);
      }
    }

    // Apply: update supply and current player's tokens
    const idx = game.currentPlayerIndex;
    const player = game.players[idx];
    const newTokens = { ...player.energyTokens };
    const newSupply = { ...supply };
    for (const [type, count] of entries) {
      newTokens[type] = (newTokens[type] ?? 0) + count;
      newSupply[type] = (newSupply[type] ?? 0) - count;
    }

    const newPlayers = game.players.map((p, i) =>
      i === idx ? { ...p, energyTokens: newTokens } : p
    );

    const newPhase = totalTokens(newTokens) > 10 ? 'discarding' : game.phase;
    set({ game: { ...game, players: newPlayers, board: { ...game.board, energySupply: newSupply }, phase: newPhase } });
  },

  discardTokens: (tokens: DiscardSelection) => {
    const { game } = get();
    if (!game) return;
    if (game.pendingHandoff) throw new Error('Acknowledge handoff before acting');
    if (game.phase === 'gameOver') throw new Error('Game is over');

    const idx = game.currentPlayerIndex;
    const player = game.players[idx];
    const newTokens = { ...player.energyTokens };
    const newSupply = { ...game.board.energySupply };

    for (const [type, count] of Object.entries(tokens) as [EnergyType | 'Ditto', number][]) {
      const held = (newTokens as Record<string, number>)[type] ?? 0;
      if (held < count) throw new Error(`Player does not hold ${count} ${type} tokens to discard`);
      (newTokens as Record<string, number>)[type] = held - count;
      newSupply[type] = (newSupply[type] ?? 0) + count;
    }

    const newPlayers = game.players.map((p, i) =>
      i === idx ? { ...p, energyTokens: newTokens } : p
    );

    const newPhase = game.phase === 'discarding' && totalTokens(newTokens) <= 10 ? 'playing' : game.phase;
    set({ game: { ...game, players: newPlayers, board: { ...game.board, energySupply: newSupply }, phase: newPhase } });
  },

  trainCard: (card: PokemonCard) => {
    const { game } = get();
    if (!game) return;
    if (game.pendingHandoff) throw new Error('Acknowledge handoff before acting');
    if (game.phase === 'discarding') throw new Error('Must discard tokens first');
    if (game.phase === 'gameOver') throw new Error('Game is over');

    const idx = game.currentPlayerIndex;
    const player = game.players[idx];
    const board = game.board;

    const faceKey = (['tier1Face', 'tier2Face', 'tier3Face'] as const)[card.evolutionTier - 1];
    const deckKey = (['tier1Deck', 'tier2Deck', 'tier3Deck'] as const)[card.evolutionTier - 1];
    const pokeballTier = (['Pokeball', 'GreatBall', 'UltraBall'] as const)[card.evolutionTier - 1] as PokeballTier;

    const faceIdx = board[faceKey].findIndex(c => c.pokedexNumber === card.pokedexNumber);
    const scoutedIdx = player.scoutedCards.findIndex(c => c.pokedexNumber === card.pokedexNumber);

    if (faceIdx === -1 && scoutedIdx === -1) {
      throw new Error(`Card ${card.name} is not available to train`);
    }

    // Compute payment: type bonuses first, then energy tokens, then Ditto
    const energyAfter = { ...player.energyTokens } as Record<string, number>;
    const supplyAfter = { ...board.energySupply } as Record<string, number>;
    let dittoNeeded = 0;

    for (const [type, rawCost] of Object.entries(card.cost) as [string, number][]) {
      const bonus = (player.typeBonuses as Record<string, number>)[type] ?? 0;
      const effective = Math.max(0, rawCost - bonus);
      const tokensPay = Math.min(effective, energyAfter[type] ?? 0);
      energyAfter[type] = (energyAfter[type] ?? 0) - tokensPay;
      supplyAfter[type] = (supplyAfter[type] ?? 0) + tokensPay;
      dittoNeeded += effective - tokensPay;
    }

    if (dittoNeeded > (energyAfter['Ditto'] ?? 0)) {
      throw new Error(`Cannot afford ${card.name}`);
    }
    energyAfter['Ditto'] = (energyAfter['Ditto'] ?? 0) - dittoNeeded;
    supplyAfter['Ditto'] = (supplyAfter['Ditto'] ?? 0) + dittoNeeded;

    // Update board: replace face-up slot from deck, or remove from scouted
    let newFace = [...board[faceKey]];
    let newDeck = [...board[deckKey]];
    let newScouted = [...player.scoutedCards];

    if (faceIdx !== -1) {
      if (newDeck.length > 0) {
        newFace = newFace.map((c, i) => i === faceIdx ? newDeck[0] : c);
        newDeck = newDeck.slice(1);
      } else {
        newFace = newFace.filter((_, i) => i !== faceIdx);
      }
    } else {
      newScouted = newScouted.filter((_, i) => i !== scoutedIdx);
    }

    // Update player: type bonus, Pokeball, trained cards
    const newTypeBonuses = { ...player.typeBonuses } as Record<string, number>;
    if (card.typeBonus !== null) {
      newTypeBonuses[card.typeBonus] = (newTypeBonuses[card.typeBonus] ?? 0) + 1;
    }

    // Legendary auto-collection check (runs on newTypeBonuses, after card bonus applied)
    const claimed = claimLegendaries(newTypeBonuses, board.availableLegendaries);
    const newAvailableLegendaries = board.availableLegendaries.filter(
      l => !claimed.some(c => c.pokedexNumber === l.pokedexNumber)
    );

    // First player to claim any Legendary earns a MasterBall (one-time per game)
    const newPokeballs = { ...player.pokeballs };
    newPokeballs[pokeballTier] = (newPokeballs[pokeballTier] ?? 0) + 1;
    const isFirstLegendary = claimed.length > 0 && !board.firstLegendaryClaimed;
    if (isFirstLegendary) {
      newPokeballs['MasterBall'] = (newPokeballs['MasterBall'] ?? 0) + 1;
    }

    const newPlayer: PlayerState = {
      ...player,
      energyTokens: energyAfter as PlayerState['energyTokens'],
      typeBonuses: newTypeBonuses as PlayerState['typeBonuses'],
      trainedCards: [...player.trainedCards, card],
      scoutedCards: newScouted,
      legendaries: [...player.legendaries, ...claimed],
      pokeballs: newPokeballs,
    };

    set({
      game: {
        ...game,
        players: game.players.map((p, i) => i === idx ? newPlayer : p),
        board: {
          ...board,
          [faceKey]: faceIdx !== -1 ? newFace : board[faceKey],
          [deckKey]: faceIdx !== -1 ? newDeck : board[deckKey],
          energySupply: supplyAfter as BoardState['energySupply'],
          availableLegendaries: newAvailableLegendaries,
          firstLegendaryClaimed: board.firstLegendaryClaimed || isFirstLegendary,
        },
      },
    });
  },

  scoutFaceUp: (card: PokemonCard) => {
    const { game } = get();
    if (!game) return;
    if (game.pendingHandoff) throw new Error('Acknowledge handoff before acting');
    if (game.phase === 'discarding') throw new Error('Must discard tokens first');
    if (game.phase === 'gameOver') throw new Error('Game is over');

    const idx = game.currentPlayerIndex;
    const player = game.players[idx];

    if (player.scoutedCards.length >= 3) {
      throw new Error('Cannot scout: already holding 3 scouted cards');
    }

    const faceKey = (['tier1Face', 'tier2Face', 'tier3Face'] as const)[card.evolutionTier - 1];
    const deckKey = (['tier1Deck', 'tier2Deck', 'tier3Deck'] as const)[card.evolutionTier - 1];
    const faceIdx = game.board[faceKey].findIndex(c => c.pokedexNumber === card.pokedexNumber);
    if (faceIdx === -1) throw new Error(`${card.name} is not face-up on the board`);

    const deck = game.board[deckKey];
    const newFace = deck.length > 0
      ? game.board[faceKey].map((c, i) => i === faceIdx ? deck[0] : c)
      : game.board[faceKey].filter((_, i) => i !== faceIdx);
    const newDeck = deck.length > 0 ? deck.slice(1) : deck;

    const playerWithScout = { ...player, scoutedCards: [...player.scoutedCards, card] };
    const { newPlayer, newDittoSupply } = applyDittoGrant(playerWithScout, game.board.energySupply.Ditto ?? 0);
    const newPhase = totalTokens(newPlayer.energyTokens) > 10 ? 'discarding' : game.phase;

    set({
      game: {
        ...game,
        phase: newPhase,
        players: game.players.map((p, i) => i === idx ? newPlayer : p),
        board: {
          ...game.board,
          [faceKey]: newFace,
          [deckKey]: newDeck,
          energySupply: { ...game.board.energySupply, Ditto: newDittoSupply },
        },
      },
    });
  },

  scoutFromDeck: (tier: EvolutionTier) => {
    const { game } = get();
    if (!game) return;
    if (game.pendingHandoff) throw new Error('Acknowledge handoff before acting');
    if (game.phase === 'discarding') throw new Error('Must discard tokens first');
    if (game.phase === 'gameOver') throw new Error('Game is over');

    const idx = game.currentPlayerIndex;
    const player = game.players[idx];

    if (player.scoutedCards.length >= 3) {
      throw new Error('Cannot scout: already holding 3 scouted cards');
    }

    const deckKey = (['tier1Deck', 'tier2Deck', 'tier3Deck'] as const)[tier - 1];
    const deck = game.board[deckKey];
    if (deck.length === 0) throw new Error(`Tier ${tier} deck is empty`);

    const card = deck[0];
    const playerWithScout = { ...player, scoutedCards: [...player.scoutedCards, card] };
    const { newPlayer, newDittoSupply } = applyDittoGrant(playerWithScout, game.board.energySupply.Ditto ?? 0);
    const newPhase = totalTokens(newPlayer.energyTokens) > 10 ? 'discarding' : game.phase;

    set({
      game: {
        ...game,
        phase: newPhase,
        players: game.players.map((p, i) => i === idx ? newPlayer : p),
        board: {
          ...game.board,
          [deckKey]: deck.slice(1),
          energySupply: { ...game.board.energySupply, Ditto: newDittoSupply },
        },
      },
    });
  },

  catchMew: (ball: PokeballTier, rng: () => number = Math.random) => {
    const { game } = get();
    if (!game) return false;
    if (game.pendingHandoff) throw new Error('Acknowledge handoff before acting');
    if (game.phase === 'discarding') throw new Error('Must discard tokens first');
    if (game.phase === 'gameOver') throw new Error('Game is over');

    const idx = game.currentPlayerIndex;
    const player = game.players[idx];

    if (!game.board.mew) throw new Error('Mew is not on the board');
    if (player.legendaries.length < game.board.mew.legendariesRequired)
      throw new Error(`Need ≥${game.board.mew.legendariesRequired} Legendaries to attempt a catch`);
    if ((player.pokeballs[ball] ?? 0) < 1) throw new Error(`No ${ball} available`);

    const BASE_RATES: Record<PokeballTier, number> = {
      Pokeball: 0.40,
      GreatBall: 0.65,
      UltraBall: 0.85,
      MasterBall: 1.00,
    };
    const hasMewtwo = player.legendaries.some(l => l.pokedexNumber === 150);
    const threshold = Math.min(1, BASE_RATES[ball] + (hasMewtwo ? 0.10 : 0));

    const newPokeballs = { ...player.pokeballs, [ball]: (player.pokeballs[ball] ?? 0) - 1 };
    const caught = rng() < threshold;

    set({
      game: {
        ...game,
        players: game.players.map((p, i) =>
          i === idx ? { ...p, pokeballs: newPokeballs, mythical: caught ? game.board.mew : p.mythical } : p
        ),
        board: { ...game.board, mew: caught ? null : game.board.mew },
      },
    });

    return caught;
  },

  acknowledgeHandoff: () => {
    const { game } = get();
    if (!game) return;
    set({ game: { ...game, pendingHandoff: false } });
  },
}));
