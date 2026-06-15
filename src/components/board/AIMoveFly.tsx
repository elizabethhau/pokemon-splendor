import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { PokemonCard } from '../../types/game';
import BoardCard from './BoardCard';

export const FLY_MS = 520;

export type Rect = { x: number; y: number; width: number; height: number };

// A clone of a trained/scouted card that flies from its board slot toward the
// active player's dock, shrinking and fading — makes the AI's pick visible
// before the slot refills underneath it.
export default function AIMoveFly({ card, from, to, scale }: {
  card: PokemonCard;
  from: Rect;
  to: { x: number; y: number };
  scale: number;
}) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withTiming(1, { duration: FLY_MS, easing: Easing.in(Easing.cubic) });
  }, [p]);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: from.x + (to.x - from.x) * p.value,
    top: from.y + (to.y - from.y) * p.value,
    transform: [{ scale: 1 - 0.65 * p.value }],
    opacity: 1 - 0.8 * p.value,
    zIndex: 45,
  }));

  return (
    <Animated.View pointerEvents="none" style={style}>
      <BoardCard card={card} scale={scale} onPress={() => {}} />
    </Animated.View>
  );
}
