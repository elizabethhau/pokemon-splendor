export type EnergyType = 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Psychic';
export type TokenType = EnergyType | 'Ditto';

export type EvolutionTier = 1 | 2 | 3;

// Cards never cost Ditto — Ditto tokens are a wild-card payment mechanism only
export type CardCost = Partial<Record<EnergyType, number>>;

export interface PokemonCard {
  pokedexNumber: number;
  name: string;
  energyType: EnergyType;
  evolutionTier: EvolutionTier;
  cost: CardCost;
  trainerPoints: number;
  typeBonus: EnergyType | null; // null for Eevee only
}

export type LegendaryRequirements = Partial<Record<EnergyType, number>>;

export interface Legendary {
  pokedexNumber: number;
  name: string;
  trainerPoints: 3;
  requirements: LegendaryRequirements;
}

export interface Mythical {
  pokedexNumber: 151;
  name: 'Mew';
  trainerPoints: 5;
  legendariesRequired: number;
}

export type PokeballTier = 'Pokeball' | 'GreatBall' | 'UltraBall' | 'MasterBall';

export type DeckMode = 'first151' | 'balanced';

export type AIDifficulty = 'greedy' | 'heuristic';

export interface GameConfig {
  playerNames: string[];
  deckMode: DeckMode;
  passAndPlay: boolean;
  aiPlayerIndices?: number[];
  aiDifficulty?: AIDifficulty;
}

export type GameAction =
  | { type: 'takeTokens'; tokens: Partial<Record<EnergyType, number>> }
  | { type: 'trainCard'; card: PokemonCard }
  | { type: 'scoutFaceUp'; card: PokemonCard }
  | { type: 'scoutFromDeck'; tier: EvolutionTier }
  | { type: 'catchMew'; ball: PokeballTier };

export interface PlayerState {
  id: string;
  name: string;
  isAI: boolean;
  energyTokens: Partial<Record<TokenType, number>>;
  typeBonuses: Partial<Record<EnergyType, number>>;
  trainedCards: PokemonCard[];
  scoutedCards: PokemonCard[];
  legendaries: Legendary[];
  mythical: Mythical | null;
  pokeballs: Partial<Record<PokeballTier, number>>;
}

export interface BoardState {
  tier1Deck: PokemonCard[];
  tier2Deck: PokemonCard[];
  tier3Deck: PokemonCard[];
  tier1Face: PokemonCard[];
  tier2Face: PokemonCard[];
  tier3Face: PokemonCard[];
  energySupply: Record<TokenType, number>;
  availableLegendaries: Legendary[];
  firstLegendaryClaimed: boolean;
  mew: Mythical | null;
}

export type GamePhase = 'playing' | 'discarding' | 'finalRound' | 'gameOver';

export interface GameState {
  config: GameConfig;
  players: PlayerState[];
  board: BoardState;
  currentPlayerIndex: number;
  phase: GamePhase;
  finalRoundTriggerPlayerIndex: number | null;
  pendingHandoff: boolean;
  turnNumber: number;
  actionTakenThisTurn: boolean;
}
