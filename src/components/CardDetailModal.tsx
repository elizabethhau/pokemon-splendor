import React, { useEffect, useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, Image, StyleSheet,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { EnergyType, PlayerState, PokemonCard } from '../types/game';
import { canAfford } from '../store/selectors';
import { getSpriteUri } from '../utils/spriteUriCache';
import TypeBadge from './TypeBadge';
import { TYPE_COLORS, SCOUT_HAND_LIMIT } from '../constants';

interface Props {
  card: PokemonCard | null;
  source: 'face' | 'scouted' | null;
  player: PlayerState | null;
  actionTakenThisTurn: boolean;
  onClose: () => void;
  onTrain: (card: PokemonCard) => void;
  onScout: (card: PokemonCard) => void;
}

type BreakdownRow = {
  type: EnergyType;
  rawCost: number;
  bonusCovers: number;
  tokensPay: number;
  dittoNeeds: number;
};

function computeBreakdown(player: PlayerState, card: PokemonCard): BreakdownRow[] {
  return (Object.entries(card.cost) as [EnergyType, number][]).map(([type, rawCost]) => {
    const bonus = player.typeBonuses[type] ?? 0;
    const bonusCovers = Math.min(rawCost, bonus);
    const effective = rawCost - bonusCovers;
    const tokensPay = Math.min(effective, player.energyTokens[type] ?? 0);
    const dittoNeeds = effective - tokensPay;
    return { type, rawCost, bonusCovers, tokensPay, dittoNeeds };
  });
}

export default function CardDetailModal({
  card, source, player, actionTakenThisTurn, onClose, onTrain, onScout,
}: Props) {
  const [spriteUri, setSpriteUri] = useState<string | null>(null);

  useEffect(() => {
    if (!card) { setSpriteUri(null); return; }
    let cancelled = false;
    getSpriteUri(card.pokedexNumber)
      .then(uri => { if (!cancelled) setSpriteUri(uri); })
      .catch(() => { if (!cancelled) setSpriteUri(null); });
    return () => { cancelled = true; };
  }, [card?.pokedexNumber]);

  if (!card || !player) return null;

  const affordable = canAfford(player, card);
  const canTrain = affordable && !actionTakenThisTurn;
  const canScout = source === 'face' &&
    !actionTakenThisTurn &&
    player.scoutedCards.length < SCOUT_HAND_LIMIT;

  const breakdown = computeBreakdown(player, card);
  const totalDitto = breakdown.reduce((s, r) => s + r.dittoNeeds, 0);
  const isFreeTrain = breakdown.length === 0 || breakdown.every(r => r.rawCost === 0);

  const borderColor = TYPE_COLORS[card.energyType];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={s.sheet}>
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* Card header */}
          <View style={[s.cardHeader, { borderLeftColor: borderColor }]}>
            {spriteUri ? (
              <Image source={{ uri: spriteUri }} style={s.sprite} resizeMode="contain" />
            ) : (
              <ActivityIndicator size="large" color={borderColor} style={s.sprite} />
            )}
            <View style={s.cardMeta}>
              <Text style={s.cardName}>{card.name}</Text>
              <Text style={s.cardDex}>#{card.pokedexNumber}</Text>
              <TypeBadge type={card.energyType} />
              <Text style={s.tierText}>Tier {card.evolutionTier} {'★'.repeat(card.evolutionTier)}</Text>
              {card.trainerPoints > 0 && (
                <Text style={[s.tpText, { color: borderColor }]}>{card.trainerPoints} Trainer Points</Text>
              )}
              {card.typeBonus && (
                <Text style={s.bonusText}>+1 {card.typeBonus} bonus when trained</Text>
              )}
            </View>
          </View>

          {/* Payment breakdown */}
          <View style={s.costSection}>
            <Text style={s.costTitle}>Cost Breakdown</Text>
            {isFreeTrain ? (
              <Text style={s.freeText}>Free to train</Text>
            ) : (
              <>
                {breakdown.map(row => (
                  <View key={row.type} style={s.breakdownRow}>
                    <View style={[s.typeDot, { backgroundColor: TYPE_COLORS[row.type] }]} />
                    <Text style={s.breakdownType}>{row.type}</Text>
                    <Text style={s.breakdownCost}>{row.rawCost}</Text>
                    {row.bonusCovers > 0 && (
                      <Text style={s.breakdownBonus}>−{row.bonusCovers} bonus</Text>
                    )}
                    {row.tokensPay > 0 && (
                      <Text style={s.breakdownToken}>{row.tokensPay} token</Text>
                    )}
                    {row.dittoNeeds > 0 && (
                      <Text style={s.breakdownDitto}>{row.dittoNeeds} Ditto</Text>
                    )}
                  </View>
                ))}
                {totalDitto > 0 && (
                  <Text style={[s.dittoSummary, { color: TYPE_COLORS.Ditto }]}>
                    Requires {totalDitto} Ditto token{totalDitto > 1 ? 's' : ''} (wild)
                  </Text>
                )}
                <Text style={[s.affordability, affordable ? s.canAfford : s.cantAfford]}>
                  {affordable ? 'You can afford this' : 'Not enough tokens'}
                </Text>
              </>
            )}
          </View>

          {/* Action buttons */}
          <View style={s.actions}>
            {source === 'face' && (
              <TouchableOpacity
                style={[s.actionBtn, s.scoutBtn, !canScout && s.actionBtnDisabled]}
                onPress={() => onScout(card)}
                disabled={!canScout}
              >
                <Text style={[s.actionBtnText, !canScout && s.actionBtnTextDisabled]}>
                  {player.scoutedCards.length >= SCOUT_HAND_LIMIT
                    ? 'Scout full (3/3)'
                    : actionTakenThisTurn
                      ? 'Already acted'
                      : 'Scout'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[s.actionBtn, s.trainBtn, !canTrain && s.actionBtnDisabled]}
              onPress={() => onTrain(card)}
              disabled={!canTrain}
            >
              <Text style={[s.actionBtnText, !canTrain && s.actionBtnTextDisabled]}>
                {actionTakenThisTurn ? 'Already acted' : affordable ? 'Train' : 'Cannot afford'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  closeBtn: { alignSelf: 'flex-end', padding: 4 },
  closeBtnText: { fontSize: 18, color: '#aaa' },

  cardHeader: { flexDirection: 'row', gap: 16, marginBottom: 16, borderLeftWidth: 4, paddingLeft: 12, borderRadius: 2 },
  sprite: { width: 96, height: 96 },
  cardMeta: { flex: 1, gap: 4 },
  cardName: { fontSize: 20, fontWeight: '800', color: '#111' },
  cardDex: { fontSize: 12, color: '#aaa' },
  tierText: { fontSize: 12, color: '#888', marginTop: 2 },
  tpText: { fontSize: 14, fontWeight: '700' },
  bonusText: { fontSize: 11, color: '#555', fontStyle: 'italic' },

  costSection: { backgroundColor: '#f8f8f8', borderRadius: 10, padding: 12, marginBottom: 16 },
  costTitle: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  freeText: { fontSize: 14, color: '#388e3c', fontWeight: '600' },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  typeDot: { width: 10, height: 10, borderRadius: 5 },
  breakdownType: { fontSize: 13, color: '#333', fontWeight: '600', width: 64 },
  breakdownCost: { fontSize: 13, color: '#222', fontWeight: '700', width: 16 },
  breakdownBonus: { fontSize: 11, color: '#4caf50', fontWeight: '600' },
  breakdownToken: { fontSize: 11, color: '#1565c0', fontWeight: '600' },
  breakdownDitto: { fontSize: 11, color: '#9c27b0', fontWeight: '600' },
  dittoSummary: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  affordability: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  canAfford: { color: '#388e3c' },
  cantAfford: { color: '#c62828' },

  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  actionBtnDisabled: { opacity: 0.4 },
  scoutBtn: { backgroundColor: '#e8f0fe', borderWidth: 1.5, borderColor: '#1565C0' },
  trainBtn: { backgroundColor: '#E53935' },
  actionBtnText: { fontSize: 15, fontWeight: '700' },
  actionBtnTextDisabled: { color: '#888' },
});
