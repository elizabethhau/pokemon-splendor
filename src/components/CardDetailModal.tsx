import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { PlayerState, PokemonCard } from '../types/game';
import { canAfford } from '../store/selectors';
import { costRows } from '../store/costRows';
import { TYPE_COLORS, SCOUT_HAND_LIMIT } from '../constants';
import { useTheme } from '../theme/ThemeContext';
import ArtworkImage from './board/ArtworkImage';
import { onTypeColor } from './board/util';

const TIER_NAMES = { 1: 'Basic', 2: 'Stage 1', 3: 'Stage 2' } as const;
const OK_GREEN = '#46B25A';

interface Props {
  card: PokemonCard | null;
  source: 'face' | 'scouted' | null;
  player: PlayerState | null;
  actionTakenThisTurn: boolean;
  dittoInSupply: boolean;
  scale: number;
  onClose: () => void;
  onTrain: (card: PokemonCard) => void;
  onScout: (card: PokemonCard) => void;
}

// Rendered as an in-screen overlay (not an RN Modal) so toasts stack above it.
export default function CardDetailModal({
  card, source, player, actionTakenThisTurn, dittoInSupply, scale, onClose, onTrain, onScout,
}: Props) {
  const { theme } = useTheme();
  if (!card || !player) return null;

  const z = (n: number) => n * scale;
  const color = TYPE_COLORS[card.energyType];
  const affordable = canAfford(player, card);
  const canTrain = affordable && !actionTakenThisTurn;
  const canScout = source === 'face' &&
    !actionTakenThisTurn &&
    player.scoutedCards.length < SCOUT_HAND_LIMIT;
  const rows = costRows(player, card);
  const usesDitto = affordable && rows.some(r => !r.ok);

  const trainLabel = actionTakenThisTurn ? 'Acted this turn' : affordable ? 'Train' : "Can't afford";
  const scoutLabel = source === 'scouted'
    ? 'In your hand'
    : dittoInSupply ? 'Scout (+Ditto)' : 'Scout';
  const bonusText = card.typeBonus
    ? `Grants +1 ${card.typeBonus} bonus · ${card.trainerPoints} TP`
    : `No type bonus · ${card.trainerPoints} TP`;

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
          flexDirection: 'row', gap: z(18), width: z(560),
          backgroundColor: theme.modalBg, borderRadius: z(20), padding: z(20),
          shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 60, shadowOffset: { width: 0, height: 24 },
          elevation: 24,
        }}
      >
        <View style={{
          width: z(170), borderRadius: z(15), backgroundColor: color,
          alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
            backgroundColor: 'rgba(255,255,255,0.22)',
          }} />
          <ArtworkImage dex={card.pokedexNumber} style={{ width: z(150), height: z(150) }} />
          <View style={{
            position: 'absolute', top: z(10), left: z(10),
            paddingVertical: z(3), paddingHorizontal: z(9), borderRadius: z(8),
            backgroundColor: 'rgba(0,0,0,0.28)',
          }}>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: z(11), color: '#fff' }}>
              {TIER_NAMES[card.evolutionTier]}
            </Text>
          </View>
          {card.trainerPoints > 0 && (
            <View style={{
              position: 'absolute', bottom: z(10), right: z(10),
              width: z(34), height: z(34), borderRadius: z(17), backgroundColor: '#fff',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(16), color }}>{card.trainerPoints}</Text>
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(24), color: theme.modalText }}>
              {card.name}
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

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(7), marginTop: z(4), marginBottom: z(14) }}>
            <View style={{ paddingVertical: z(3), paddingHorizontal: z(10), borderRadius: z(7), backgroundColor: color }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(11), color: onTypeColor(card.energyType) }}>
                {card.energyType}
              </Text>
            </View>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(11), color: theme.inkDim }}>{bonusText}</Text>
          </View>

          <Text style={{
            fontFamily: 'Poppins_700Bold', fontSize: z(10), color: theme.inkDim,
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: z(7),
          }}>
            Training cost
          </Text>
          <View style={{ gap: z(6), marginBottom: z(14) }}>
            {rows.map(row => (
              <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', gap: z(9) }}>
                <View style={{
                  width: z(24), height: z(24), borderRadius: z(12),
                  backgroundColor: row.type ? TYPE_COLORS[row.type] : TYPE_COLORS.Ditto,
                  borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{
                    fontFamily: 'Fredoka_700Bold', fontSize: z(11),
                    color: onTypeColor(row.type ?? 'Ditto'),
                  }}>
                    {row.need}
                  </Text>
                </View>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(12), color: theme.modalText }}>
                  {row.label}
                </Text>
                <Text style={{
                  marginLeft: 'auto', fontFamily: 'Poppins_600SemiBold', fontSize: z(12),
                  color: row.ok ? OK_GREEN : theme.inkDim,
                }}>
                  {row.status}
                </Text>
              </View>
            ))}
            {usesDitto && (
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(11), color: theme.inkDim, fontStyle: 'italic' }}>
                Shortfall covered by your Ditto (wild)
              </Text>
            )}
          </View>

          <View style={{ marginTop: 'auto', flexDirection: 'row', gap: z(9) }}>
            {source === 'face' && (
              <TouchableOpacity
                onPress={() => onScout(card)}
                disabled={!canScout}
                style={{
                  flex: 1, padding: z(12), borderRadius: z(11),
                  borderWidth: 1.5, borderColor: theme.ring2, opacity: canScout ? 1 : 0.45,
                }}
              >
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(13), color: theme.modalText, textAlign: 'center' }}>
                  {scoutLabel}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => onTrain(card)}
              disabled={!canTrain}
              style={{
                flex: 1.4, padding: z(12), borderRadius: z(11),
                backgroundColor: canTrain ? theme.accent : theme.ring2,
                borderWidth: 1, borderColor: theme.accentBorder,
                opacity: canTrain ? 1 : 0.55,
              }}
            >
              <Text style={{
                fontFamily: 'Fredoka_700Bold', fontSize: z(13), textAlign: 'center',
                color: canTrain ? theme.accentText : theme.inkDim,
              }}>
                {trainLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Pressable>
  );
}
