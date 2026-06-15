/* Test environment setup for component tests (jest-expo preset). */

// Reanimated: replace the native module with no-op JS so animated components
// render synchronously. The babel worklet transform only invokes these on call,
// so a plain mock is enough for render/interaction tests.
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const identity = (v) => v;
  const easingFn = () => 0;
  const easingFactory = () => easingFn;
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: (c) => c },
    View,
    useSharedValue: (initial) => ({ value: initial }),
    useAnimatedStyle: (fn) => {
      try { return fn() || {}; } catch { return {}; }
    },
    withTiming: identity,
    withSpring: identity,
    withDelay: (_d, v) => v,
    withRepeat: identity,
    withSequence: (...steps) => steps[0],
    cancelAnimation: () => {},
    interpolate: () => 0,
    Easing: {
      linear: easingFn, ease: easingFn, quad: easingFn, cubic: easingFn,
      in: easingFactory, out: easingFactory, inOut: easingFactory,
    },
  };
});

// AsyncStorage: in-memory mock (used by ThemeProvider / persistence if mounted).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
