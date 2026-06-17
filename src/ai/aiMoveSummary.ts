import { EnergyType, EvolutionTier } from '../types/game';

// Outcome of an AI move, resolved at dispatch time, used to build the
// move-summary toast that plays after the action animates on the board.
export type AIMoveOutcome =
  | { kind: 'takeTokens'; tokens: Partial<Record<EnergyType, number>> }
  | { kind: 'trainCard'; cardName: string }
  | { kind: 'scoutFaceUp'; cardName: string }
  | { kind: 'scoutFromDeck'; tier: EvolutionTier }
  | { kind: 'catchMew'; caught: boolean }
  | { kind: 'pass' };

const DECK_LABELS: Record<EvolutionTier, string> = { 1: 'Basic', 2: 'Stage 1', 3: 'Stage 2' };

// "Rival took 3 Energy", "Rival trained Arcanine", "Rival passed".
export function formatAIMove(rivalName: string, outcome: AIMoveOutcome): string {
  switch (outcome.kind) {
    case 'takeTokens': {
      const total = Object.values(outcome.tokens).reduce<number>((acc, n) => acc + (n ?? 0), 0);
      return `${rivalName} took ${total} Energy`;
    }
    case 'trainCard':
      // Legendary claims resolve at end of turn, not on train, so they are
      // reported by a separate end-of-turn toast (see GameBoardScreen).
      return `${rivalName} trained ${outcome.cardName}`;
    case 'scoutFaceUp':
      return `${rivalName} scouted ${outcome.cardName}`;
    case 'scoutFromDeck':
      return `${rivalName} scouted from the ${DECK_LABELS[outcome.tier]} deck`;
    case 'catchMew':
      return outcome.caught ? `${rivalName} caught Mew! +5 TP` : `${rivalName}'s Poké Ball missed Mew`;
    case 'pass':
      return `${rivalName} passed`;
  }
}
