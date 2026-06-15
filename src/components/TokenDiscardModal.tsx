import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
} from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { useToast } from './Toast';
import { currentPlayer } from '../store/selectors';
import { totalTokens } from '../store/gameRules';
import { TokenType } from '../types/game';
import { TYPE_COLORS, MAX_TOKENS, PHASE } from '../constants';
import { useTheme } from '../theme/ThemeContext';
import { useBoardScale } from './board/useBoardScale';
import { onTypeColor } from './board/util';

export default function TokenDiscardModal() {
  const game = useGameStore(s => s.game);
  const discardTokens = useGameStore(s => s.discardTokens);
  const advanceTurn = useGameStore(s => s.advanceTurn);
  const toast = useToast();
  const { theme } = useTheme();
  const scale = useBoardScale();
  const z = (n: number) => n * scale;

  // Tapping a token marks it for return; the net discard is applied once on Done.
  const [pending, setPending] = useState<Partial<Record<TokenType, number>>>({});

  const visible = game?.phase === PHASE.DISCARDING;

  useEffect(() => {
    if (!visible) setPending({});
  }, [visible]);

  if (!game || !visible) return null;

  const player = currentPlayer(game);
  const totalHeld = totalTokens(player.energyTokens);
  const totalPending = Object.values(pending).reduce<number>((s, n) => s + (n ?? 0), 0);
  const holding = totalHeld - totalPending;
  const over = Math.max(0, holding - MAX_TOKENS);
  const dirty = totalPending > 0;
  const canDone = holding <= MAX_TOKENS;

  // Remaining-after-pending count per type; spent-to-zero types drop out (Reset restores them).
  const tokens = (Object.entries(player.energyTokens) as [TokenType, number][])
    .map(([type, held]) => ({ type, count: held - (pending[type] ?? 0) }))
    .filter(({ count }) => count > 0);

  function returnToken(type: TokenType) {
    const held = player.energyTokens[type] ?? 0;
    setPending(prev => {
      const next = Math.min(held, (prev[type] ?? 0) + 1);
      return { ...prev, [type]: next };
    });
  }

  function handleDone() {
    try {
      discardTokens(pending);
      setPending({});
      // Discard happens at End Turn now — once back under the limit, finish committing.
      if (useGameStore.getState().game?.phase !== PHASE.DISCARDING) {
        advanceTurn();
      }
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <View style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: theme.overlay, alignItems: 'center', justifyContent: 'center', zIndex: 45,
    }}>
      <View style={{
        width: z(440), backgroundColor: theme.modalBg, borderRadius: z(18), padding: z(22),
        shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 60, shadowOffset: { width: 0, height: 24 },
        elevation: 24,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(11), marginBottom: z(5) }}>
          <View style={{
            width: z(34), height: z(34), borderRadius: z(17), backgroundColor: '#F0483C',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(17), color: '#fff' }}>{MAX_TOKENS}</Text>
          </View>
          <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(18), color: theme.modalText }}>
            Token limit reached
          </Text>
        </View>

        <Text style={{
          fontFamily: 'Poppins_400Regular', fontSize: z(13), lineHeight: z(21),
          color: theme.inkDim, marginBottom: z(16),
        }}>
          You can hold at most {MAX_TOKENS} tokens. Tap to return tokens to the supply —{' '}
          {over > 0 ? (
            <>you’re <Text style={{ color: '#F0483C', fontFamily: 'Poppins_700Bold' }}>{over} over the limit</Text>.</>
          ) : (
            'you’re under the limit.'
          )}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: z(9), justifyContent: 'center', marginBottom: z(18) }}>
          {tokens.map(({ type, count }) => (
            <TouchableOpacity
              key={type}
              onPress={() => returnToken(type)}
              style={{ alignItems: 'center', gap: z(5) }}
            >
              <View style={{
                width: z(46), height: z(46), borderRadius: z(23), backgroundColor: TYPE_COLORS[type],
                borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(19), color: onTypeColor(type) }}>
                  {count}
                </Text>
              </View>
              <Text style={{
                fontFamily: 'Poppins_600SemiBold', fontSize: z(9), color: theme.inkDim,
                textTransform: 'uppercase', letterSpacing: 0.4,
              }}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: z(12) }}>
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(12), color: theme.inkDim }}>
            Holding <Text style={{ color: theme.modalText, fontSize: z(14) }}>{holding}</Text> / {MAX_TOKENS}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(9) }}>
            {dirty && (
              <TouchableOpacity
                onPress={() => setPending({})}
                style={{
                  paddingVertical: z(11), paddingHorizontal: z(16), borderRadius: z(11),
                  borderWidth: 1.5, borderColor: theme.ring2,
                }}
              >
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(12.5), color: theme.modalText }}>
                  ↩ Reset
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleDone}
              disabled={!canDone}
              style={{
                paddingVertical: z(11), paddingHorizontal: z(22), borderRadius: z(11),
                backgroundColor: canDone ? theme.dockBtnBg : theme.ring2,
                borderWidth: 1, borderColor: canDone ? theme.accentBorder : theme.ring2,
                opacity: canDone ? 1 : 0.5,
              }}
            >
              <Text style={{
                fontFamily: 'Fredoka_700Bold', fontSize: z(13),
                color: canDone ? theme.dockBtnText : theme.inkDim,
              }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
