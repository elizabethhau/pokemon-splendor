import React, { useEffect } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, cancelAnimation,
} from 'react-native-reanimated';
import { PokeballTier } from '../types/game';
import { useTheme } from '../theme/ThemeContext';
import { BALL_TOP_COLORS } from './board/util';
import ArtworkImage from './board/ArtworkImage';

const MEW_DEX = 151;

const BALL_LABELS: Record<PokeballTier, string> = {
  Pokeball: 'Pokeball', GreatBall: 'Great Ball', UltraBall: 'Ultra Ball', MasterBall: 'Master Ball',
};
const RATE_COLORS: Record<PokeballTier, string> = {
  Pokeball: '#8893a3', GreatBall: '#2E8BE6', UltraBall: '#46B25A', MasterBall: '#ffcb05',
};

export type CatchPhase = 'select' | 'throwing' | 'result';
export type CatchBall = { tier: PokeballTier; count: number; pct: number };

interface Props {
  visible: boolean;
  phase: CatchPhase;
  caught: boolean;
  selectedBall: PokeballTier | null;
  balls: CatchBall[];
  scale: number;
  onPickBall: (tier: PokeballTier) => void;
  onThrow: () => void;
  onClose: () => void;
}

function BallGlyph({ tier, size }: { tier: PokeballTier; size: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: '#fff',
      borderWidth: 2.5, borderColor: '#1d2530', overflow: 'hidden',
    }}>
      <View style={{ height: '48%', backgroundColor: BALL_TOP_COLORS[tier] }} />
      <View style={{ position: 'absolute', top: '50%', left: -2.5, right: -2.5, height: 3, marginTop: -1.5, backgroundColor: '#1d2530' }} />
      <View style={{
        position: 'absolute', top: '50%', left: '50%',
        width: size * 0.31, height: size * 0.31, marginTop: -size * 0.155, marginLeft: -size * 0.155,
        borderRadius: size * 0.155, backgroundColor: '#fff', borderWidth: 2.5, borderColor: '#1d2530',
      }} />
    </View>
  );
}

// In-screen overlay (not an RN Modal) so toasts stack above it, matching CardDetailModal.
export default function CatchMewModal({
  visible, phase, caught, selectedBall, balls, scale, onPickBall, onThrow, onClose,
}: Props) {
  const { theme } = useTheme();
  const z = (n: number) => n * scale;

  // Mew wiggles while the ball is shaking.
  const wiggle = useSharedValue(0);
  useEffect(() => {
    if (phase === 'throwing') {
      wiggle.value = withRepeat(
        withSequence(
          withTiming(-16, { duration: 125 }),
          withTiming(16, { duration: 250 }),
          withTiming(0, { duration: 125 }),
        ),
        -1,
      );
    } else {
      cancelAnimation(wiggle);
      wiggle.value = 0;
    }
  }, [phase, wiggle]);

  const mewStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${wiggle.value}deg` }] }));

  if (!visible) return null;

  const canThrow = selectedBall !== null;
  const throwLabel = canThrow
    ? `Throw ${BALL_LABELS[selectedBall]}!`
    : balls.length > 0 ? 'Pick a ball' : 'No Poké Balls yet';

  return (
    <Pressable
      onPress={phase === 'throwing' ? undefined : onClose}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: theme.overlay, alignItems: 'center', justifyContent: 'center', zIndex: 21,
      }}
    >
      <Pressable
        onPress={() => {}}
        style={{
          width: z(420), backgroundColor: theme.modalBg, borderRadius: z(20), padding: z(22),
          alignItems: 'center',
          shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 60, shadowOffset: { width: 0, height: 24 },
          elevation: 24,
        }}
      >
        <View style={{
          width: z(130), height: z(130), marginBottom: z(8),
          alignItems: 'center', justifyContent: 'center',
        }}>
          <View style={{
            position: 'absolute', width: z(130), height: z(130), borderRadius: z(65),
            backgroundColor: 'rgba(228,107,176,0.18)',
          }} />
          <Animated.View style={mewStyle}>
            <ArtworkImage dex={MEW_DEX} style={{ width: z(120), height: z(120) }} />
          </Animated.View>
        </View>

        {phase === 'select' && (
          <>
            <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(24), color: '#e46bb0', marginBottom: z(2) }}>
              Catch Mew!
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(12), color: theme.inkDim, marginBottom: z(15), textAlign: 'center' }}>
              Pick a Poké Ball — a failed throw still spends it.
            </Text>

            <View style={{ alignSelf: 'stretch', gap: z(8), marginBottom: z(16) }}>
              {balls.map(({ tier, count, pct }) => {
                const selected = selectedBall === tier;
                return (
                  <TouchableOpacity
                    key={tier}
                    onPress={() => onPickBall(tier)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: z(11),
                      paddingVertical: z(11), paddingHorizontal: z(13), borderRadius: z(12),
                      backgroundColor: selected ? theme.mewBg : 'transparent',
                      borderWidth: 1.5, borderColor: selected ? '#e46bb0' : theme.ring2,
                    }}
                  >
                    <BallGlyph tier={tier} size={z(26)} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: z(13), color: theme.modalText }}>
                        {BALL_LABELS[tier]}
                      </Text>
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(10), color: theme.inkDim }}>
                        {count} available
                      </Text>
                    </View>
                    <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(20), color: RATE_COLORS[tier] }}>
                      {pct}%
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: z(9), alignSelf: 'stretch' }}>
              <TouchableOpacity
                onPress={onClose}
                style={{ flex: 1, padding: z(12), borderRadius: z(11), borderWidth: 1.5, borderColor: theme.ring2 }}
              >
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(13), color: theme.modalText, textAlign: 'center' }}>
                  Not now
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onThrow}
                disabled={!canThrow}
                style={{
                  flex: 1.5, padding: z(12), borderRadius: z(11),
                  backgroundColor: canThrow ? theme.accent : theme.ring2,
                  borderWidth: 1, borderColor: theme.accentBorder, opacity: canThrow ? 1 : 0.55,
                }}
              >
                <Text style={{
                  fontFamily: 'Fredoka_700Bold', fontSize: z(13), textAlign: 'center',
                  color: canThrow ? theme.accentText : theme.inkDim,
                }}>
                  {throwLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {phase === 'throwing' && (
          <>
            <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(22), color: theme.modalText, marginBottom: z(4) }}>
              …
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(12), color: theme.inkDim }}>
              The ball is shaking…
            </Text>
          </>
        )}

        {phase === 'result' && (
          <>
            <Text style={{
              fontFamily: 'Fredoka_700Bold', fontSize: z(26), marginBottom: z(4), textAlign: 'center',
              color: caught ? '#46B25A' : '#e8483b',
            }}>
              {caught ? 'Gotcha! Mew was caught!' : 'Oh no! Mew escaped!'}
            </Text>
            <Text style={{
              fontFamily: 'Poppins_400Regular', fontSize: z(12.5), color: theme.inkDim,
              marginBottom: z(16), textAlign: 'center',
            }}>
              {caught
                ? "Mew joined your team — that's +5 Trainer Points."
                : 'The ball was spent. Try again on a later turn.'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingVertical: z(12), paddingHorizontal: z(28), borderRadius: z(11),
                backgroundColor: theme.accent, borderWidth: 1, borderColor: theme.accentBorder,
              }}
            >
              <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(14), color: theme.accentText }}>
                Continue
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Pressable>
    </Pressable>
  );
}
