import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// The prototype's board is designed on a fixed 888×414 canvas. Everything on
// the board screen multiplies its prototype dp values by this factor so the
// whole board always fits one screen — small phones scale down, never scroll.
const CANVAS_W = 888;
const CANVAS_H = 414;

export function useBoardScale(): number {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availW = width - insets.left - insets.right;
  const availH = height - insets.top - insets.bottom;
  return Math.min(availW / CANVAS_W, availH / CANVAS_H);
}
