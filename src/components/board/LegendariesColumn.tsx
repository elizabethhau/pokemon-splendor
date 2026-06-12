import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { EnergyType, Legendary, Mythical, PlayerState } from '../../types/game';
import { TYPE_COLORS } from '../../constants';
import { useTheme } from '../../theme/ThemeContext';
import ArtworkImage from './ArtworkImage';
import { onTypeColor } from './util';

const MEW_PINK = '#e46bb0';

export default function LegendariesColumn({ legendaries, mew, mewCatcher, scale, onMewPress }: {
  legendaries: Legendary[];
  mew: Mythical | null;
  mewCatcher: PlayerState | null;
  scale: number;
  onMewPress: () => void;
}) {
  const { theme } = useTheme();
  const z = (n: number) => n * scale;

  const rowBase = {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: z(7),
    borderRadius: z(10), paddingVertical: z(4), paddingRight: z(8), paddingLeft: z(5),
  };

  return (
    <View style={{ width: z(172), gap: z(5), justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: z(7), color: theme.cardSub, letterSpacing: 1 }}>
        LEGENDARY · NOBLES
      </Text>
      {legendaries.map(leg => (
        <View key={leg.pokedexNumber} style={[rowBase, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.ring }]}>
          <ArtworkImage dex={leg.pokedexNumber} style={{ width: z(30), height: z(30) }} />
          <View style={{ flex: 1, gap: z(2) }}>
            <Text numberOfLines={1} style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(10), color: theme.cardText }}>
              {leg.name}
            </Text>
            <View style={{ flexDirection: 'row', gap: z(3) }}>
              {(Object.entries(leg.requirements) as [EnergyType, number][]).map(([type, n]) => (
                <View key={type} style={{
                  minWidth: z(14), height: z(14), paddingHorizontal: z(3), borderRadius: z(4),
                  backgroundColor: TYPE_COLORS[type], alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(8.5), color: onTypeColor(type) }}>{n}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(14), color: theme.accentSolid }}>
            {leg.trainerPoints}
          </Text>
        </View>
      ))}
      {mew ? (
        <TouchableOpacity
          onPress={onMewPress}
          style={[rowBase, { backgroundColor: theme.mewBg, borderWidth: 1.5, borderColor: MEW_PINK, borderStyle: 'dashed' }]}
        >
          <ArtworkImage dex={mew.pokedexNumber} style={{ width: z(30), height: z(30) }} />
          <View style={{ flex: 1, gap: z(1) }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(10), color: theme.cardText }}>
              Mew · Mythical
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(8), color: theme.cardSub }}>
              {mew.legendariesRequired} Legendaries + Poké Ball
            </Text>
          </View>
          <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(14), color: MEW_PINK }}>
            {mew.trainerPoints}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[rowBase, { backgroundColor: theme.mewBg, borderWidth: 1.5, borderColor: theme.ring2, opacity: 0.62 }]}>
          <ArtworkImage dex={151} style={{ width: z(30), height: z(30), opacity: 0.45 }} />
          <View style={{ flex: 1, gap: z(1) }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(10), color: theme.cardText }}>
              Mew · Caught
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(8), color: theme.cardSub }}>
              {mewCatcher ? `by ${mewCatcher.name}` : ''}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(13), color: '#46B25A' }}>✓</Text>
        </View>
      )}
    </View>
  );
}
