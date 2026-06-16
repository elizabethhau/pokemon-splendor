import React from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { EnergyType, PlayerState, PokeballTier, TokenType } from '../types/game';
import { TYPE_COLORS, SCOUT_HAND_LIMIT } from '../constants';
import { trainerPoints } from '../store/selectors';
import { useTheme } from '../theme/ThemeContext';
import ArtworkImage from './board/ArtworkImage';
import { BALL_TOP_COLORS, onTypeColor } from './board/util';

const ENERGY_TYPES: EnergyType[] = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic'];
const BALL_ORDER: PokeballTier[] = ['Pokeball', 'GreatBall', 'UltraBall', 'MasterBall'];

interface Props {
  visible: boolean;
  player: PlayerState | null;
  avatarDex: number;
  scale: number;
  onClose: () => void;
}

function BallGlyph({ ball, size }: { ball: PokeballTier; size: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: '#fff',
      borderWidth: 2, borderColor: '#1d2530', overflow: 'hidden',
    }}>
      <View style={{ height: '50%', backgroundColor: BALL_TOP_COLORS[ball] }} />
      <View style={{ position: 'absolute', top: '50%', left: -2, right: -2, height: 2, marginTop: -1, backgroundColor: '#1d2530' }} />
    </View>
  );
}

// Read-only, non-committal view of an opponent's board. Opening or closing it
// spends no action and touches no game state. Scouted-card *contents* stay
// hidden (only the count is public) — everything else is open information.
export default function OpponentInspectModal({ visible, player, avatarDex, scale, onClose }: Props) {
  const { theme } = useTheme();
  const z = (n: number) => n * scale;
  if (!visible || !player) return null;

  const tp = trainerPoints(player);
  const heldTokens = (Object.entries(player.energyTokens) as [TokenType, number][]).filter(([, n]) => n > 0);
  const heldBalls = BALL_ORDER.map(b => [b, player.pokeballs[b] ?? 0] as const).filter(([, n]) => n > 0);
  const scoutedCount = player.scoutedCards.length;
  const trained = player.trainedCards;

  const label = { fontFamily: 'Poppins_700Bold', fontSize: z(8), color: theme.inkDim, letterSpacing: 1 } as const;
  const none = <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(11), color: theme.inkDim }}>none</Text>;

  return (
    <Pressable
      onPress={onClose}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: theme.overlay, alignItems: 'center', justifyContent: 'center', zIndex: 24,
      }}
    >
      <Pressable
        onPress={() => {}}
        style={{
          width: z(452), maxHeight: z(390), backgroundColor: theme.modalBg, borderRadius: z(20),
          paddingVertical: z(20), paddingHorizontal: z(22),
          shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 60, shadowOffset: { width: 0, height: 24 },
          elevation: 24,
        }}
      >
        {/* header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(12) }}>
          <View style={{
            width: z(44), height: z(44), borderRadius: z(22), backgroundColor: '#4a5066',
            borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.25)',
            alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            <ArtworkImage dex={avatarDex} style={{ width: z(40), height: z(40) }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(19), color: theme.modalText }}>
              {player.name}
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(11), color: theme.inkDim }}>
              Opponent board · view only, no turn spent
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(26), color: theme.accentSolid, lineHeight: z(27) }}>{tp}</Text>
            <Text style={{ ...label, fontSize: z(8) }}>TP</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{ width: z(28), height: z(28), borderRadius: z(8), backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: z(15), color: theme.inkDim }}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 1, backgroundColor: theme.ring, marginVertical: z(14) }} />

        {/* Body scrolls vertically so a late-game board (many Legendaries) never
            overflows the short landscape modal; the header/✕ above stays fixed. */}
        <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }}>
        {/* type bonus */}
        <View style={{ gap: z(7) }}>
          <Text style={label}>TYPE BONUS</Text>
          <View style={{ flexDirection: 'row', gap: z(6) }}>
            {ENERGY_TYPES.map(type => {
              const count = player.typeBonuses[type] ?? 0;
              return (
                <View key={type} style={{
                  flex: 1, height: z(40), borderRadius: z(9), backgroundColor: TYPE_COLORS[type],
                  opacity: count > 0 ? 1 : 0.25, alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(16), color: onTypeColor(type) }}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* energy + balls */}
        <View style={{ flexDirection: 'row', gap: z(16), marginTop: z(14) }}>
          <View style={{ flex: 1, gap: z(7) }}>
            <Text style={label}>ENERGY</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: z(7), minHeight: z(22), alignItems: 'center' }}>
              {heldTokens.length === 0 ? none : heldTokens.map(([type, count]) => (
                <View key={type} style={{ flexDirection: 'row', alignItems: 'center', gap: z(3) }}>
                  <View style={{
                    width: z(22), height: z(22), borderRadius: z(11), backgroundColor: TYPE_COLORS[type],
                    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
                  }} />
                  <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(11), color: theme.modalText }}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ flex: 1, gap: z(7) }}>
            <Text style={label}>POKÉ BALLS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: z(9), minHeight: z(22), alignItems: 'center' }}>
              {heldBalls.length === 0 ? none : heldBalls.map(([ball, count]) => (
                <View key={ball} style={{ flexDirection: 'row', alignItems: 'center', gap: z(3) }}>
                  <BallGlyph ball={ball} size={z(19)} />
                  <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(11), color: theme.modalText }}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* scouted (size only) + legendaries */}
        <View style={{ flexDirection: 'row', gap: z(16), marginTop: z(14) }}>
          <View style={{ flex: 1, gap: z(7) }}>
            <Text style={label}>SCOUTED HAND</Text>
            <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(13), color: theme.modalText }}>
              {scoutedCount} / {SCOUT_HAND_LIMIT}
            </Text>
            <View style={{ flexDirection: 'row', gap: z(6), alignItems: 'center', minHeight: z(30) }}>
              {scoutedCount === 0 ? (
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(11), color: theme.inkDim }}>empty</Text>
              ) : (
                <>
                  {Array.from({ length: scoutedCount }).map((_, i) => (
                    <View key={i} style={{
                      width: z(22), height: z(30), borderRadius: z(5),
                      backgroundColor: '#2b3340', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
                    }} />
                  ))}
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(10), color: theme.inkDim, marginLeft: z(2) }}>
                    contents hidden
                  </Text>
                </>
              )}
            </View>
          </View>
          <View style={{ flex: 1, gap: z(7) }}>
            <Text style={label}>LEGENDARY · NOBLES</Text>
            <View style={{ gap: z(5), minHeight: z(30) }}>
              {player.legendaries.length === 0 ? none : player.legendaries.map(leg => (
                <View key={leg.pokedexNumber} style={{ flexDirection: 'row', alignItems: 'center', gap: z(6) }}>
                  <ArtworkImage dex={leg.pokedexNumber} style={{ width: z(24), height: z(24) }} />
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(11), color: theme.modalText }}>{leg.name}</Text>
                  <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(11), color: theme.accentSolid }}>{leg.trainerPoints}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* trained pokemon strip */}
        <View style={{ gap: z(7), marginTop: z(14) }}>
          <Text style={label}>TRAINED {trained.length}</Text>
          {trained.length === 0 ? none : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: z(6) }}>
              {trained.map(c => (
                <View key={c.pokedexNumber} style={{
                  width: z(34), height: z(40), borderRadius: z(6), backgroundColor: TYPE_COLORS[c.energyType],
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}>
                  <ArtworkImage dex={c.pokedexNumber} style={{ width: z(30), height: z(30) }} />
                </View>
              ))}
            </ScrollView>
          )}
        </View>
        </ScrollView>
      </Pressable>
    </Pressable>
  );
}
