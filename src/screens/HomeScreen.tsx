import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../theme/ThemeContext';
import { TYPE_COLORS } from '../constants';
import { getArtworkUri } from '../utils/spriteUriCache';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const TYPE_DOTS = [
  TYPE_COLORS.Fire,
  TYPE_COLORS.Water,
  TYPE_COLORS.Grass,
  TYPE_COLORS.Electric,
  TYPE_COLORS.Psychic,
];

const PIKACHU_DEX = 25;

export default function HomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [heroUri, setHeroUri] = useState<string | null>(null);

  useEffect(() => {
    getArtworkUri(PIKACHU_DEX).then(setHeroUri).catch(() => {});
  }, []);

  const bob = useSharedValue(0);
  useEffect(() => {
    bob.value = withRepeat(
      withTiming(-11, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [bob]);
  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  return (
    <LinearGradient colors={theme.appBg} style={s.container}>
      <View style={[s.bgCircle, { backgroundColor: theme.surface }]} />

      {/* margin mode so the absolutely-positioned corner icons land inside the safe area */}
      <SafeAreaView style={s.safeArea} mode="margin">
      <View style={s.cornerIcons}>
        <TouchableOpacity
          style={[s.cornerBtn, { backgroundColor: theme.surface, borderColor: theme.ring }]}
          onPress={() => navigation.navigate('Stats')}
        >
          <Ionicons name="stats-chart" size={16} color={theme.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.cornerBtn, { backgroundColor: theme.surface, borderColor: theme.ring }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-sharp" size={16} color={theme.ink} />
        </TouchableOpacity>
      </View>

      <View style={s.heroLeft}>
        <View style={s.dotsRow}>
          {TYPE_DOTS.map((color) => (
            <View key={color} style={[s.typeDot, { backgroundColor: color }]} />
          ))}
        </View>
        <Text style={[s.eyebrow, { color: theme.inkDim }]}>The deck-building duel</Text>
        <Text style={[s.title, { color: theme.ink }]}>Pokémon{'\n'}Splendor</Text>
        <Text style={[s.tagline, { color: theme.inkDim }]}>
          Collect energy, train Pokémon, claim Legendaries, and race to{' '}
          <Text style={[s.taglineBold, { color: theme.accentSolid }]}>20 Trainer Points</Text>.
        </Text>
        <View style={s.buttons}>
          <TouchableOpacity
            style={[s.playBtn, { backgroundColor: theme.accent, borderColor: theme.accentBorder }]}
            onPress={() => navigation.navigate('GameSetup')}
          >
            <Text style={[s.playText, { color: theme.accentText }]}>▶ Play</Text>
          </TouchableOpacity>
          <View style={s.secondaryRow}>
            <TouchableOpacity
              style={[s.secondaryBtn, { backgroundColor: theme.surface, borderColor: theme.ring }]}
              onPress={() => navigation.navigate('Rulebook')}
            >
              <Text style={[s.secondaryText, { color: theme.ink }]}>How to play</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.secondaryBtn, { backgroundColor: theme.surface, borderColor: theme.ring }]}
              onPress={() => navigation.navigate('Pokedex')}
            >
              <Text style={[s.secondaryText, { color: theme.ink }]}>Pokédex</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={s.heroRight}>
        <View style={[s.glow, { backgroundColor: theme.accentGlow }]} />
        {heroUri && (
          <Animated.View style={bobStyle}>
            <Image source={{ uri: heroUri }} style={s.heroImage} resizeMode="contain" />
          </Animated.View>
        )}
      </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, flexDirection: 'row' },
  bgCircle: {
    position: 'absolute', top: -60, right: -40,
    width: 300, height: 300, borderRadius: 150, opacity: 0.6,
  },
  cornerIcons: { position: 'absolute', top: 18, right: 18, flexDirection: 'row', gap: 8, zIndex: 3 },
  cornerBtn: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  heroLeft: { flex: 1, justifyContent: 'center', paddingLeft: 52, zIndex: 2 },
  dotsRow: { flexDirection: 'row', gap: 7, marginBottom: 14 },
  typeDot: { width: 13, height: 13, borderRadius: 7 },
  eyebrow: {
    fontFamily: 'Poppins_600SemiBold', fontSize: 13,
    letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2,
  },
  title: { fontFamily: 'Fredoka_700Bold', fontSize: 52, lineHeight: 52, letterSpacing: 0.5 },
  tagline: {
    fontFamily: 'Poppins_400Regular', fontSize: 14, lineHeight: 21,
    maxWidth: 320, marginTop: 14, marginBottom: 26,
  },
  taglineBold: { fontFamily: 'Poppins_700Bold' },
  buttons: { width: 240, gap: 10 },
  playBtn: {
    padding: 14, borderRadius: 13, borderWidth: 1, alignItems: 'center',
    shadowColor: '#0a0f19', shadowOpacity: 0.18, shadowRadius: 14, shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  playText: { fontFamily: 'Fredoka_700Bold', fontSize: 16 },
  secondaryRow: { flexDirection: 'row', gap: 10 },
  secondaryBtn: { flex: 1, padding: 11, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  secondaryText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  heroRight: { width: 360, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  glow: { position: 'absolute', width: 230, height: 230, borderRadius: 115, opacity: 0.8 },
  heroImage: { width: 280, height: 280 },
});
