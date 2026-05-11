import { create } from 'zustand';
import { EnergyType, EvolutionTier, GameConfig, GamePhase, GameState, PokemonCard, Legendary, Mythical, PokeballTier, TokenType } from '../types/game';
import legData from '../data/legendaries.json';
import mewData from '../data/mew.json';
import { trainerPoints } from './selectors';
import { totalTokens, claimLegendaries, buildDecks, makePlayer, applyScout, tierFaceKey, tierDeckKey } from './gameRules';
import {
  BASE_CATCH_RATES, FACE_UP_COUNT, INITIAL_DITTO_SUPPLY, INITIAL_ENERGY_SUPPLY,
  MAX_PLAYERS, MAX_TOKENS, MEWTWO_CATCH_BONUS, MEWTWO_POKEDEX_NUMBER, MIN_PLAYERS,
  MIN_SUPPLY_FOR_TAKE_TWO, PHASE, SCOUT_HAND_LIMIT, TP_TRIGGER_THRESHOLD,
} from '../constants';

type TokenSelection = Partial<Record<EnergyType, number>>;
type DiscardSelection = Partial<Record<TokenType, number>>;

interface GameStore {
  soundEnabled: boolean;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;

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

export const useGameStore = create<GameStore>((set, get) => ({
  soundEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setSoundEnabled: (enabled: boolean) => set({ soundEnabled: enabled }),

  game: null,

  initGame: (config: GameConfig) => {
    if (config.playerNames.length < MIN_PLAYERS) throw new Error('Game requires at least 1 player');
    if (config.playerNames.length > MAX_PLAYERS) throw new Error('Game supports a maximum of 4 players');

    const players = config.playerNames.map((name, i) => makePlayer(name, i));
    const { tier1, tier2, tier3 } = buildDecks(config.deckMode);

    set({
      game: {
        config,
        players,
        board: {
          tier1Deck: tier1.slice(FACE_UP_COUNT),
          tier2Deck: tier2.slice(FACE_UP_COUNT),
          tier3Deck: tier3.slice(FACE_UP_COUNT),
          tier1Face: tier1.slice(0, FACE_UP_COUNT),
          tier2Face: tier2.slice(0, FACE_UP_COUNT),
          tier3Face: tier3.slice(0, FACE_UP_COUNT),
          energySupply: {
            Fire: INITIAL_ENERGY_SUPPLY,
            Water: INITIAL_ENERGY_SUPPLY,
            Grass: INITIAL_ENERGY_SUPPLY,
            Electric: INITIAL_ENERGY_SUPPLY,
            Psychic: INITIAL_ENERGY_SUPPLY,
            Ditto: INITIAL_DITTO_SUPPLY,
          },
          availableLegendaries: legData.legendaries as Legendary[],
          firstLegendaryClaimed: false,
          mew: mewData.mythical as Mythical,
        },
        currentPlayerIndex: 0,
        phase: PHASE.PLAYING,
        finalRoundTriggerPlayerIndex: null,
        pendingHandoff: false,
        turnNumber: 1,
        actionTakenThisTurn: false,
      },
    });
  },

  advanceTurn: () => {
    const { game } = get();
    if (!game) return;
    if (game.phase === PHASE.DISCARDING) throw new Error('Must discard tokens to ≤10 before ending turn');
    if (game.phase === PHASE.GAME_OVER) throw new Error('Game is over');
    if (!game.actionTakenThisTurn) throw new Error('Must take an action before ending turn');

    const prevPlayer = game.players[game.currentPlayerIndex];
    const prevTP = trainerPoints(prevPlayer);
    const next = (game.currentPlayerIndex + 1) % game.players.length;
    const nextTurn = game.turnNumber + 1;

    let phase: GamePhase = game.phase;
    let finalRoundTriggerPlayerIndex = game.finalRoundTriggerPlayerIndex;

    if (phase === PHASE.PLAYING && prevTP >= TP_TRIGGER_THRESHOLD) {
      phase = PHASE.FINAL_ROUND;
      finalRoundTriggerPlayerIndex = game.currentPlayerIndex;
    }

    if (phase === PHASE.FINAL_ROUND && next === finalRoundTriggerPlayerIndex) {
      phase = PHASE.GAME_OVER;
    }

    const pendingHandoff = game.config.passAndPlay && phase !== PHASE.GAME_OVER;

    set({
      game: {
        ...game,
        currentPlayerIndex: next,
        turnNumber: nextTurn,
        phase,
        finalRoundTriggerPlayerIndex,
        pendingHandoff,
        actionTakenThisTurn: false,
      },
    });
  },

  takeTokens: (tokens: TokenSelection) => {
    const { game } = get();
    if (!game) return;
    if (game.pendingHandoff) throw new Error('Acknowledge handoff before acting');
    if (game.phase === PHASE.DISCARDING) throw new Error('Must discard tokens first');
    if (game.phase === PHASE.GAME_OVER) throw new Error('Game is over');

    const entries = Object.entries(tokens) as [EnergyType, number][];
    const supply = game.board.energySupply;

    const isThreeDiff = entries.length === 3 && entries.every(([, n]) => n === 1);
    const isTwoSame = entries.length === 1 && entries[0][1] === 2;
    if (!isThreeDiff && !isTwoSame) {
      throw new Error('Invalid token selection: must take 3 different types or 2 of the same type');
    }

    for (const [type, count] of entries) {
      const available = supply[type] ?? 0;
      if (available < count) throw new Error(`Not enough ${type} tokens in supply`);
      if (isTwoSame && available < MIN_SUPPLY_FOR_TAKE_TWO) throw new Error(`Need ≥4 ${type} tokens in supply to take 2`);
    }

    const idx = game.currentPlayerIndex;
    const player = game.players[idx];
    const newTokens = { ...player.energyTokens };
    const newSupply = { ...supply };
    for (const [type, count] of entries) {
      newTokens[type] = (newTokens[type] ?? 0) + count;
      newSupply[type] = (newSupply[type] ?? 0) - count;
    }

    const newPhase = totalTokens(newTokens) > MAX_TOKENS ? PHASE.DISCARDING : game.phase;
    set({
      game: {
        ...game,
        players: game.players.map((p, i) => i === idx ? { ...p, energyTokens: newTokens } : p),
        board: { ...game.board, energySupply: newSupply },
        phase: newPhase,
        actionTakenThisTurn: true,
      },
    });
  },

  discardTokens: (tokens: DiscardSelection) => {
    const { game } = get();
    if (!game) return;
    if (game.pendingHandoff) throw new Error('Acknowledge handoff before acting');
    if (game.phase === PHASE.GAME_OVER) throw new Error('Game is over');
    if (game.phase !== PHASE.DISCARDING) throw new Error('No discard required');

    const idx = game.currentPlayerIndex;
    const player = game.players[idx];
    const newTokens = { ...player.energyTokens } as Partial<Record<TokenType, number>>;
    const newSupply = { ...game.board.energySupply } as Partial<Record<TokenType, number>>;

    for (const [type, count] of Object.entries(tokens) as [TokenType, number][]) {
      const held = newTokens[type] ?? 0;
      if (held < count) throw new Error(`Player does not hold ${count} ${type} tokens to discard`);
      newTokens[type] = held - count;
      newSupply[type] = (newSupply[type] ?? 0) + count;
    }

    // Restore the phase we were in before entering 'discarding'
    const restoredPhase: GamePhase = game.finalRoundTriggerPlayerIndex !== null ? PHASE.FINAL_ROUND : PHASE.PLAYING;
    const newPhase = totalTokens(newTokens) <= MAX_TOKENS ? restoredPhase : PHASE.DISCARDING;
    set({
      game: {
        ...game,
        players: game.players.map((p, i) => i === idx ? { ...p, energyTokens: newTokens } : p),
        board: { ...game.board, energySupply: newSupply },
        phase: newPhase,
      },
    });
  },

  trainCard: (card: PokemonCard) => {
    const { game } = get();
    if (!game) return;
    if (game.pendingHandoff) throw new Error('Acknowledge handoff before acting');
    if (game.phase === PHASE.DISCARDING) throw new Error('Must discard tokens first');
    if (game.phase === PHASE.GAME_OVER) throw new Error('Game is over');

    const idx = game.currentPlayerIndex;
    const player = game.players[idx];
    const board = game.board;

    const faceKey = tierFaceKey(card.evolutionTier);
    const deckKey = tierDeckKey(card.evolutionTier);
    const pokeballTier = (['Pokeball', 'GreatBall', 'UltraBall'] as const)[card.evolutionTier - 1] as PokeballTier;

    const faceIdx = board[faceKey].findIndex(c => c.pokedexNumber === card.pokedexNumber);
    const scoutedIdx = player.scoutedCards.findIndex(c => c.pokedexNumber === card.pokedexNumber);

    if (faceIdx === -1 && scoutedIdx === -1) {
      throw new Error(`Card ${card.name} is not available to train`);
    }

    // Payment: type bonuses reduce cost; remaining paid from energy tokens; Ditto covers the rest
    const energyAfter = { ...player.energyTokens } as Partial<Record<TokenType, number>>;
    const supplyAfter = { ...board.energySupply } as Partial<Record<TokenType, number>>;
    let dittoNeeded = 0;

    for (const [type, rawCost] of Object.entries(card.cost) as [EnergyType, number][]) {
      const bonus = player.typeBonuses[type] ?? 0;
      const effective = Math.max(0, rawCost - bonus);
      const tokensPay = Math.min(effective, energyAfter[type] ?? 0);
      energyAfter[type] = (energyAfter[type] ?? 0) - tokensPay;
      supplyAfter[type] = (supplyAfter[type] ?? 0) + tokensPay;
      dittoNeeded += effective - tokensPay;
    }

    if (dittoNeeded > (energyAfter.Ditto ?? 0)) {
      throw new Error(`Cannot afford ${card.name}`);
    }
    energyAfter.Ditto = (energyAfter.Ditto ?? 0) - dittoNeeded;
    supplyAfter.Ditto = (supplyAfter.Ditto ?? 0) + dittoNeeded;

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

    const newTypeBonuses = { ...player.typeBonuses };
    if (card.typeBonus !== null) {
      newTypeBonuses[card.typeBonus] = (newTypeBonuses[card.typeBonus] ?? 0) + 1;
    }

    const claimed = claimLegendaries(newTypeBonuses, board.availableLegendaries);
    const newAvailableLegendaries = board.availableLegendaries.filter(
      l => !claimed.some(c => c.pokedexNumber === l.pokedexNumber)
    );

    const newPokeballs = { ...player.pokeballs };
    newPokeballs[pokeballTier] = (newPokeballs[pokeballTier] ?? 0) + 1;
    const isFirstLegendary = claimed.length > 0 && !board.firstLegendaryClaimed;
    if (isFirstLegendary) {
      newPokeballs['MasterBall'] = (newPokeballs['MasterBall'] ?? 0) + 1;
    }

    set({
      game: {
        ...game,
        actionTakenThisTurn: true,
        players: game.players.map((p, i) => i === idx ? {
          ...player,
          energyTokens: energyAfter,
          typeBonuses: newTypeBonuses,
          trainedCards: [...player.trainedCards, card],
          scoutedCards: newScouted,
          legendaries: [...player.legendaries, ...claimed],
          pokeballs: newPokeballs,
        } : p),
        board: {
          ...board,
          [faceKey]: faceIdx !== -1 ? newFace : board[faceKey],
          [deckKey]: faceIdx !== -1 ? newDeck : board[deckKey],
          energySupply: supplyAfter,
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
    if (game.phase === PHASE.DISCARDING) throw new Error('Must discard tokens first');
    if (game.phase === PHASE.GAME_OVER) throw new Error('Game is over');

    const idx = game.currentPlayerIndex;
    if (game.players[idx].scoutedCards.length >= SCOUT_HAND_LIMIT) {
      throw new Error('Cannot scout: already holding 3 scouted cards');
    }

    const faceKey = tierFaceKey(card.evolutionTier);
    const deckKey = tierDeckKey(card.evolutionTier);
    const faceIdx = game.board[faceKey].findIndex(c => c.pokedexNumber === card.pokedexNumber);
    if (faceIdx === -1) throw new Error(`${card.name} is not face-up on the board`);

    const deck = game.board[deckKey];
    const newFace = deck.length > 0
      ? game.board[faceKey].map((c, i) => i === faceIdx ? deck[0] : c)
      : game.board[faceKey].filter((_, i) => i !== faceIdx);
    const newDeck = deck.length > 0 ? deck.slice(1) : deck;

    const updatedBoard = { ...game.board, [faceKey]: newFace, [deckKey]: newDeck };
    set({ game: applyScout(game, idx, card, updatedBoard) });
  },

  scoutFromDeck: (tier: EvolutionTier) => {
    const { game } = get();
    if (!game) return;
    if (game.pendingHandoff) throw new Error('Acknowledge handoff before acting');
    if (game.phase === PHASE.DISCARDING) throw new Error('Must discard tokens first');
    if (game.phase === PHASE.GAME_OVER) throw new Error('Game is over');

    const idx = game.currentPlayerIndex;
    if (game.players[idx].scoutedCards.length >= SCOUT_HAND_LIMIT) {
      throw new Error('Cannot scout: already holding 3 scouted cards');
    }

    const deckKey = tierDeckKey(tier);
    const deck = game.board[deckKey];
    if (deck.length === 0) throw new Error(`Tier ${tier} deck is empty`);

    const updatedBoard = { ...game.board, [deckKey]: deck.slice(1) };
    set({ game: applyScout(game, idx, deck[0], updatedBoard) });
  },

  catchMew: (ball: PokeballTier, rng: () => number = Math.random) => {
    const { game } = get();
    if (!game) return false;
    if (game.pendingHandoff) throw new Error('Acknowledge handoff before acting');
    if (game.phase === PHASE.DISCARDING) throw new Error('Must discard tokens first');
    if (game.phase === PHASE.GAME_OVER) throw new Error('Game is over');

    const idx = game.currentPlayerIndex;
    const player = game.players[idx];

    if (!game.board.mew) throw new Error('Mew is not on the board');
    if (player.legendaries.length < game.board.mew.legendariesRequired)
      throw new Error(`Need ≥${game.board.mew.legendariesRequired} Legendaries to attempt a catch`);
    if ((player.pokeballs[ball] ?? 0) < 1) throw new Error(`No ${ball} available`);

    const hasMewtwo = player.legendaries.some(l => l.pokedexNumber === MEWTWO_POKEDEX_NUMBER);
    const threshold = Math.min(1, BASE_CATCH_RATES[ball] + (hasMewtwo ? MEWTWO_CATCH_BONUS : 0));

    const newPokeballs = { ...player.pokeballs, [ball]: (player.pokeballs[ball] ?? 0) - 1 };
    const caught = rng() < threshold;

    set({
      game: {
        ...game,
        actionTakenThisTurn: true,
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
