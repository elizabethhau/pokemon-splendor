import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { EvolutionTier } from '../../types/game';
import { useTheme } from '../../theme/ThemeContext';

export type TierRowData = { tier: EvolutionTier; label: string; deckCount: number };

export default function DeckRail({ rows, scale, onDeckPress }: {
  rows: TierRowData[];
  scale: number;
  onDeckPress: (tier: EvolutionTier) => void;
}) {
  const { theme } = useTheme();
  const z = (n: number) => n * scale;

  return (
    <View style={{ width: z(54), justifyContent: 'center', gap: z(6) }}>
      {rows.map(row => (
        <View key={row.tier} style={{ height: z(90), alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={() => onDeckPress(row.tier)}
            disabled={row.deckCount === 0}
            style={{
              width: z(46), height: z(80), borderRadius: z(9),
              backgroundColor: theme.deckBg, borderWidth: 1, borderColor: theme.ring,
              alignItems: 'center', justifyContent: 'center', gap: z(2),
              opacity: row.deckCount === 0 ? 0.4 : 1,
            }}
          >
            <Text style={{
              fontFamily: 'Poppins_600SemiBold', fontSize: z(7), color: theme.cardSub,
              textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center',
            }}>
              {row.label}
            </Text>
            <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(15), color: theme.cardText }}>
              {row.deckCount}
            </Text>
            <Text style={{
              fontFamily: 'Poppins_600SemiBold', fontSize: z(6.5), color: theme.accentSolid,
              textTransform: 'uppercase', letterSpacing: 0.4,
            }}>
              Scout
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}
