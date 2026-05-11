export type EnergyType = 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Psychic';

export type EvolutionTier = 1 | 2 | 3;

export type CardCost = Partial<Record<EnergyType | 'Ditto', number>>;

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

export interface GameConfig {
  playerNames: string[];
  aiFlags: boolean[];
  deckMode: DeckMode;
  passAndPlay: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  isAI: boolean;
  energyTokens: Partial<Record<EnergyType | 'Ditto', number>>;
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
  energySupply: Partial<Record<EnergyType | 'Ditto', number>>;
  availableLegendaries: Legendary[];
  firstLegendaryClaimed: boolean;
  mew: Mythical | null;
}

export interface GameState {
  config: GameConfig;
  players: PlayerState[];
  board: BoardState;
  currentPlayerIndex: number;
  phase: 'playing' | 'discarding' | 'finalRound' | 'gameOver';
  finalRoundTriggerPlayerIndex: number | null;
  pendingHandoff: boolean;
  turnNumber: number;
}
