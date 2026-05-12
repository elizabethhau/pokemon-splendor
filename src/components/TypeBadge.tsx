import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TokenType } from '../types/game';
import { TYPE_COLORS } from '../constants';

const LIGHT_TYPES = new Set<TokenType>(['Electric', 'Ditto']);

interface Props {
  type: TokenType;
  size?: 'sm' | 'md';
}

export default function TypeBadge({ type, size = 'md' }: Props) {
  const textColor = LIGHT_TYPES.has(type) ? '#333' : '#fff';
  const isSmall = size === 'sm';
  return (
    <View style={[styles.badge, { backgroundColor: TYPE_COLORS[type] }, isSmall && styles.badgeSm]}>
      <Text style={[styles.text, { color: textColor }, isSmall && styles.textSm]}>{type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeSm: { paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '700' },
  textSm: { fontSize: 9 },
});
