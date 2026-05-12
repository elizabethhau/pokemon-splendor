import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { EnergyType, PokemonCard } from '../types/game';
import { getSpriteUri } from '../utils/spriteUriCache';
import TypeBadge from './TypeBadge';
import { TYPE_COLORS } from '../constants';

const LIGHT_TYPES = new Set<EnergyType>(['Electric']);

const TIER_COLORS: Record<1 | 2 | 3, string> = {
  1: '#a8d8a8',
  2: '#a8c0f0',
  3: '#f0d060',
};

interface Props {
  card: PokemonCard;
  onPress?: () => void;
  faceDown?: boolean;
  compact?: boolean;
}

export default function PokemonCardView({ card, onPress, faceDown = false, compact = false }: Props) {
  const [spriteUri, setSpriteUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSpriteUri(card.pokedexNumber)
      .then(uri => { if (!cancelled) setSpriteUri(uri); })
      .catch(() => { if (!cancelled) setSpriteUri(null); });
    return () => { cancelled = true; };
  }, [card.pokedexNumber]);

  if (faceDown) {
    return (
      <View style={[styles.card, styles.faceDown, compact && styles.cardCompact]}>
        <Text style={styles.faceDownQ}>?</Text>
      </View>
    );
  }

  const borderColor = TYPE_COLORS[card.energyType];
  const costEntries = Object.entries(card.cost) as [EnergyType, number][];

  const inner = (
    <View style={[styles.card, { borderColor }, compact && styles.cardCompact]}>
      <View style={[styles.tierStrip, { backgroundColor: TIER_COLORS[card.evolutionTier] }]}>
        <Text style={styles.tierText}>{'*'.repeat(card.evolutionTier)}</Text>
      </View>

      <View style={styles.spriteWrap}>
        {spriteUri ? (
          <Image
            source={{ uri: spriteUri }}
            style={compact ? styles.spriteCompact : styles.sprite}
            resizeMode="contain"
          />
        ) : (
          <ActivityIndicator size="small" color={borderColor} />
        )}
      </View>

      <Text style={styles.name} numberOfLines={1}>{card.name}</Text>

      {!compact && (
        <>
          <TypeBadge type={card.energyType} size="sm" />

          {costEntries.length > 0 && (
            <View style={styles.costRow}>
              {costEntries.map(([type, count]) => (
                <View key={type} style={[styles.costBadge, { backgroundColor: TYPE_COLORS[type] }]}>
                  <Text style={[styles.costText, LIGHT_TYPES.has(type) && { color: '#333' }]}>{count}</Text>
                </View>
              ))}
            </View>
          )}

          {card.trainerPoints > 0 && (
            <Text style={[styles.tp, { color: borderColor }]}>{card.trainerPoints} TP</Text>
          )}
        </>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  card: {
    width: 80,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 6,
    marginRight: 8,
  },
  cardCompact: { width: 60, paddingBottom: 4 },
  faceDown: { backgroundColor: '#3a3a5a', borderColor: '#555', justifyContent: 'center', height: 110 },
  tierStrip: { width: '100%', alignItems: 'center', paddingVertical: 2 },
  tierText: { fontSize: 8, color: '#fff', fontWeight: '700', letterSpacing: 1 },
  spriteWrap: { width: 60, height: 56, justifyContent: 'center', alignItems: 'center' },
  sprite: { width: 56, height: 56 },
  spriteCompact: { width: 40, height: 40 },
  name: { fontSize: 9, fontWeight: '600', textAlign: 'center', paddingHorizontal: 3, color: '#222', marginTop: 2 },
  costRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 3, marginTop: 4, paddingHorizontal: 4 },
  costBadge: { borderRadius: 3, paddingHorizontal: 4, paddingVertical: 1 },
  costText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  tp: { fontSize: 10, fontWeight: '800', marginTop: 3 },
  faceDownQ: { fontSize: 28, color: '#888', textAlign: 'center' },
});
