import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { currentPlayer } from '../store/selectors';
import { totalTokens } from '../store/gameRules';
import { TokenType } from '../types/game';
import { TYPE_COLORS, MAX_TOKENS, PHASE } from '../constants';

export default function TokenDiscardModal() {
  const game = useGameStore(s => s.game);
  const discardTokens = useGameStore(s => s.discardTokens);
  const [selection, setSelection] = useState<Partial<Record<TokenType, number>>>({});

  const visible = game?.phase === PHASE.DISCARDING;

  useEffect(() => {
    if (!visible) setSelection({});
  }, [visible]);

  if (!game || !visible) return null;

  const player = currentPlayer(game);
  const totalHeld = totalTokens(player.energyTokens);
  const totalDiscard = Object.values(selection).reduce<number>((s, n) => s + (n ?? 0), 0);
  const tokensAfterDiscard = totalHeld - totalDiscard;
  const stillOver = tokensAfterDiscard - MAX_TOKENS;
  const canConfirm = totalDiscard > 0 && tokensAfterDiscard >= 0;

  const heldTypes = (Object.entries(player.energyTokens) as [TokenType, number][]).filter(([, n]) => n > 0);

  function adjust(type: TokenType, delta: number) {
    setSelection(prev => {
      const held = player.energyTokens[type] ?? 0;
      const next = Math.max(0, Math.min(held, (prev[type] ?? 0) + delta));
      const updated = { ...prev, [type]: next };
      if (updated[type] === 0) delete updated[type];
      return updated;
    });
  }

  function handleConfirm() {
    try {
      discardTokens(selection);
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <Modal visible transparent animationType="slide">
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <Text style={s.title}>Discard Tokens</Text>
          <Text style={s.subtitle}>
            You have {totalHeld} tokens — maximum is {MAX_TOKENS}.{'\n'}
            {stillOver > 0 ? `Discard at least ${totalHeld - MAX_TOKENS}.` : 'Select tokens to discard.'}
          </Text>

          {heldTypes.map(([type, held]) => {
            const discardCount = selection[type] ?? 0;
            return (
              <View key={type} style={s.typeRow}>
                <View style={[s.typeDot, { backgroundColor: TYPE_COLORS[type] }]} />
                <Text style={s.typeName}>{type}</Text>
                <Text style={s.typeHeld}>{held} held</Text>
                <View style={s.adjRow}>
                  <TouchableOpacity style={s.adjBtn} onPress={() => adjust(type, -1)} disabled={discardCount === 0}>
                    <Text style={[s.adjText, discardCount === 0 && s.adjDisabled]}>–</Text>
                  </TouchableOpacity>
                  <Text style={s.discardCount}>{discardCount}</Text>
                  <TouchableOpacity style={s.adjBtn} onPress={() => adjust(type, 1)} disabled={discardCount >= held}>
                    <Text style={[s.adjText, discardCount >= held && s.adjDisabled]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <View style={s.summary}>
            <Text style={[s.summaryText, tokensAfterDiscard <= MAX_TOKENS ? s.summaryOk : s.summaryOver]}>
              After discard: {tokensAfterDiscard} tokens{' '}
              {tokensAfterDiscard <= MAX_TOKENS ? '— ready' : `(still ${stillOver} over)`}
            </Text>
          </View>

          <TouchableOpacity
            style={[s.confirmBtn, !canConfirm && s.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={!canConfirm}
          >
            <Text style={s.confirmText}>Discard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '800', color: '#222', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 18 },

  typeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 8 },
  typeDot: { width: 12, height: 12, borderRadius: 6 },
  typeName: { fontSize: 14, fontWeight: '600', color: '#222', flex: 1 },
  typeHeld: { fontSize: 12, color: '#999' },
  adjRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adjBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' },
  adjText: { fontSize: 18, fontWeight: '700', color: '#333', lineHeight: 22 },
  adjDisabled: { color: '#ccc' },
  discardCount: { fontSize: 16, fontWeight: '700', color: '#222', width: 20, textAlign: 'center' },

  summary: { marginTop: 16, marginBottom: 12 },
  summaryText: { fontSize: 13, fontWeight: '600' },
  summaryOk: { color: '#388e3c' },
  summaryOver: { color: '#c62828' },

  confirmBtn: { backgroundColor: '#E53935', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: '#e0e0e0' },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
