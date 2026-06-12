import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EnergyType, PokemonCard } from '../../types/game';
import { TYPE_COLORS } from '../../constants';
import { useTheme } from '../../theme/ThemeContext';
import ArtworkImage from './ArtworkImage';
import { onTypeColor } from './util';

const TIER_LABELS = { 1: 'I', 2: 'II', 3: 'III' } as const;

// Prototype card: 78×90 canvas units — type-colored frame, TP badge, tier
// label, cost pips, sprite, name band, tier-3 sheen.
export default function BoardCard({ card, scale, onPress }: {
  card: PokemonCard;
  scale: number;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const z = (n: number) => n * scale;
  const color = TYPE_COLORS[card.energyType];
  const pips = (Object.entries(card.cost) as [EnergyType, number][]).filter(([, n]) => n > 0);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ width: z(78), height: z(90), borderRadius: z(11), borderWidth: 2, borderColor: color, overflow: 'hidden' }}
    >
      <LinearGradient colors={theme.cardBg} style={StyleSheet.absoluteFill} />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: z(22), backgroundColor: color, opacity: 0.15 }} />
      {card.evolutionTier === 3 && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute', top: -z(20), left: z(30), width: z(24), height: z(130),
            backgroundColor: theme.sheen, transform: [{ rotate: '35deg' }],
          }}
        />
      )}
      <View style={{ position: 'absolute', top: z(15), left: 0, right: 0, height: z(50), alignItems: 'center', justifyContent: 'center' }}>
        <ArtworkImage dex={card.pokedexNumber} style={{ width: z(48), height: z(48) }} />
      </View>
      {card.trainerPoints > 0 && (
        <View style={{
          position: 'absolute', top: z(4), left: z(4), width: z(18), height: z(18), borderRadius: z(9),
          backgroundColor: color, alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(11), color: onTypeColor(card.energyType) }}>
            {card.trainerPoints}
          </Text>
        </View>
      )}
      <Text style={{ position: 'absolute', top: z(5), right: z(6), fontFamily: 'Fredoka_700Bold', fontSize: z(8), color: theme.cardSub }}>
        {TIER_LABELS[card.evolutionTier]}
      </Text>
      <View style={{ position: 'absolute', left: z(4), bottom: z(21), gap: z(2) }}>
        {pips.map(([type, n]) => (
          <View key={type} style={{
            width: z(16), height: z(16), borderRadius: z(8), backgroundColor: TYPE_COLORS[type],
            borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(9), color: onTypeColor(type) }}>{n}</Text>
          </View>
        ))}
      </View>
      <View style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: z(18),
        backgroundColor: color, alignItems: 'center', justifyContent: 'center',
      }}>
        <Text numberOfLines={1} style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(8.5), color: onTypeColor(card.energyType) }}>
          {card.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
