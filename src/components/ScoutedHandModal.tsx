import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { PlayerState, PokemonCard } from '../types/game';
import { canAfford } from '../store/selectors';
import { SCOUT_HAND_LIMIT } from '../constants';
import { useTheme } from '../theme/ThemeContext';
import BoardCard from './board/BoardCard';

const OK_GREEN = '#46B25A';
// Board cards render at 78 canvas units; the tray shows them larger.
const HAND_CARD_SCALE = 1.3;

interface Props {
  visible: boolean;
  player: PlayerState | null;
  scale: number;
  onClose: () => void;
  onCardPress: (card: PokemonCard) => void;
}

// In-screen overlay (not an RN Modal) so toasts stack above it, matching CardDetailModal.
export default function ScoutedHandModal({ visible, player, scale, onClose, onCardPress }: Props) {
  const { theme } = useTheme();
  const z = (n: number) => n * scale;
  if (!visible || !player) return null;

  const scouted = player.scoutedCards;

  return (
    <Pressable
      onPress={onClose}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: theme.overlay, alignItems: 'center', justifyContent: 'center', zIndex: 20,
      }}
    >
      <Pressable
        onPress={() => {}}
        style={{
          width: z(600), backgroundColor: theme.modalBg, borderRadius: z(20),
          paddingVertical: z(20), paddingHorizontal: z(22),
          shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 60, shadowOffset: { width: 0, height: 24 },
          elevation: 24,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: z(3) }}>
          <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(22), color: theme.modalText }}>
            Your Hand
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: z(28), height: z(28), borderRadius: z(8), backgroundColor: theme.surface,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: z(15), color: theme.inkDim }}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(12), color: theme.inkDim, marginBottom: z(16) }}>
          Scouted cards — only you can see these. Tap one to review and train it. ({scouted.length}/{SCOUT_HAND_LIMIT})
        </Text>

        {scouted.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: z(16), justifyContent: 'center', paddingVertical: z(4) }}>
            {scouted.map(card => {
              const afford = canAfford(player, card);
              return (
                <View key={card.pokedexNumber} style={{ alignItems: 'center', gap: z(8) }}>
                  <BoardCard card={card} scale={scale * HAND_CARD_SCALE} onPress={() => onCardPress(card)} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(5) }}>
                    <View style={{
                      width: z(7), height: z(7), borderRadius: z(3.5),
                      backgroundColor: afford ? OK_GREEN : theme.inkDim,
                    }} />
                    <Text style={{
                      fontFamily: 'Poppins_600SemiBold', fontSize: z(10.5),
                      color: afford ? OK_GREEN : theme.inkDim,
                    }}>
                      {afford ? 'Ready to train' : 'Need more energy'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={{ paddingTop: z(26), paddingBottom: z(30), alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(15), color: theme.modalText, marginBottom: z(5) }}>
              No scouted cards yet
            </Text>
            <Text style={{
              fontFamily: 'Poppins_400Regular', fontSize: z(12), lineHeight: z(18),
              color: theme.inkDim, textAlign: 'center', maxWidth: z(390),
            }}>
              Tap Scout on a face-up card or a deck stack to reserve a card here (up to {SCOUT_HAND_LIMIT}).
              Scouting also earns a wild Ditto token while supply remains.
            </Text>
          </View>
        )}
      </Pressable>
    </Pressable>
  );
}
