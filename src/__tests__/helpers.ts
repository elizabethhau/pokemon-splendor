import { useGameStore } from '../store/useGameStore';
import { PokemonCard } from '../types/game';

export function givePlayerTokens(tokens: Partial<Record<string, number>>, playerIndex = 0) {
  useGameStore.setState((s) => ({
    game: {
      ...s.game!,
      players: s.game!.players.map((p, i) =>
        i === playerIndex ? { ...p, energyTokens: tokens } : p
      ),
    },
  }));
}

export function putCardInFace(card: PokemonCard) {
  const faceKey = (['tier1Face', 'tier2Face', 'tier3Face'] as const)[card.evolutionTier - 1];
  useGameStore.setState((s) => {
    const rest = s.game!.board[faceKey].filter(c => c.pokedexNumber !== card.pokedexNumber).slice(0, 3);
    return {
      game: { ...s.game!, board: { ...s.game!.board, [faceKey]: [card, ...rest] } },
    };
  });
}
