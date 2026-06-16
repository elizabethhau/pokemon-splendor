import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GameState, PlayerState } from '../../types/game';
import { trainerPoints } from '../../store/selectors';
import { useTheme } from '../../theme/ThemeContext';
import { PHASE } from '../../constants';
import ArtworkImage from './ArtworkImage';
import { SEAT_AVATAR_DEX, AI_AVATAR_DEX } from './util';

export default function TopBar({ game, scale, onMewPress, onHome, onInspectOpponent }: {
  game: GameState;
  scale: number;
  onMewPress: () => void;
  onHome: () => void;
  onInspectOpponent: (player: PlayerState, avatarDex: number) => void;
}) {
  const { theme } = useTheme();
  const z = (n: number) => n * scale;

  const opponents = game.players
    .map((p, i) => ({ p, i }))
    .filter(({ i }) => i !== game.currentPlayerIndex);
  const active = game.players[game.currentPlayerIndex];
  const turnText = game.phase === PHASE.FINAL_ROUND
    ? `Final Round · ${active.name}'s turn`
    : `Turn ${game.turnNumber} · ${active.name}'s turn`;
  const mew = game.board.mew;
  const catcher = mew ? null : game.players.find(p => p.mythical);

  return (
    <LinearGradient
      colors={theme.topBg}
      style={{
        height: z(44), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: z(14), borderBottomWidth: 1, borderBottomColor: theme.ring,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(13) }}>
        {opponents.map(({ p, i }) => {
          // AI seats start at index 1 (seat 0 is always the human), so Math.max guards the never-AI-at-0 case
          const avatarDex = p.isAI ? AI_AVATAR_DEX[Math.max(0, i - 1) % AI_AVATAR_DEX.length] : SEAT_AVATAR_DEX[i % SEAT_AVATAR_DEX.length];
          return (
          <TouchableOpacity
            key={p.id}
            onPress={() => onInspectOpponent(p, avatarDex)}
            accessibilityRole="button"
            accessibilityLabel={`View ${p.name}'s board`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: z(7) }}
          >
            <View style={{
              width: z(27), height: z(27), borderRadius: z(14), backgroundColor: '#4a5066',
              borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              <ArtworkImage dex={avatarDex} style={{ width: z(25), height: z(25) }} />
            </View>
            <View>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(10), color: theme.topDim }} numberOfLines={1}>
                {p.name}
              </Text>
              <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(13), color: theme.topText, lineHeight: z(14) }}>
                {trainerPoints(p)}
                <Text style={{ fontSize: z(8), fontFamily: 'Poppins_600SemiBold' }}> TP</Text>
              </Text>
            </View>
          </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(8) }}>
        <View style={{
          paddingVertical: z(4), paddingHorizontal: z(11), borderRadius: 999,
          backgroundColor: theme.pillBg, borderWidth: 1, borderColor: theme.ring,
        }}>
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(10), color: theme.pillText }}>{turnText}</Text>
        </View>
        {mew ? (
          <TouchableOpacity
            onPress={onMewPress}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: z(5),
              paddingVertical: z(3), paddingLeft: z(4), paddingRight: z(10), borderRadius: 999,
              backgroundColor: theme.pillBg, borderWidth: 1, borderColor: theme.ring,
            }}
          >
            <ArtworkImage dex={mew.pokedexNumber} style={{ width: z(20), height: z(20) }} />
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(9.5), color: theme.pillText }}>
              Catch Mew · <Text style={{ fontFamily: 'Fredoka_700Bold' }}>5 TP</Text>
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: z(5), opacity: 0.5,
            paddingVertical: z(3), paddingLeft: z(4), paddingRight: z(10), borderRadius: 999,
            backgroundColor: theme.pillBg, borderWidth: 1, borderColor: theme.ring,
          }}>
            <ArtworkImage dex={151} style={{ width: z(20), height: z(20), opacity: 0.45 }} />
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(9.5), color: theme.pillText }}>
              Mew · Caught{catcher ? ` by ${catcher.name}` : ''}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={onHome} hitSlop={10}>
        <Ionicons name="home" size={z(15)} color={theme.topDim} />
      </TouchableOpacity>
    </LinearGradient>
  );
}
