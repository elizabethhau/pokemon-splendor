import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useGameStore } from '../store/useGameStore';
import { AIDifficulty, GameConfig } from '../types/game';
import { PLAYER_COLORS } from '../constants';
import { useTheme } from '../theme/ThemeContext';
import { Theme } from '../theme/themes';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GameSetup'>;
};

type Mode = 'solo' | 'pass';
type Difficulty = 'easy' | 'normal';

type SegOption<T extends string> = { key: T; label: string; sub?: string; disabled?: boolean };

function Segmented<T extends string>({ options, value, onChange, theme }: {
  options: SegOption<T>[];
  value: T;
  onChange: (key: T) => void;
  theme: Theme;
}) {
  return (
    <View style={s.segRow}>
      {options.map(o => {
        const active = o.key === value;
        return (
          <TouchableOpacity
            key={o.key}
            disabled={o.disabled}
            onPress={() => onChange(o.key)}
            style={[s.segBtn, {
              backgroundColor: active ? theme.accent : 'transparent',
              borderColor: active ? theme.accentBorder : theme.ring2,
              opacity: o.disabled ? 0.5 : 1,
            }]}
          >
            <Text style={[s.segLabel, { color: active ? theme.accentText : theme.ink }]}>{o.label}</Text>
            {o.sub && (
              <Text style={[s.segSub, { color: active ? theme.accentText : theme.inkDim }]}>{o.sub}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function GameSetupScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [mode, setMode] = useState<Mode>('solo');
  const [players, setPlayers] = useState(2);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [names, setNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const initGame = useGameStore(st => st.initGame);

  function updateName(index: number, value: string) {
    setNames(prev => prev.map((n, i) => (i === index ? value : n)));
  }

  // Solo enters one name (the human); Pass & Play enters every player's name.
  const nameCount = mode === 'solo' ? 1 : players;

  function handleStart() {
    const aiDifficulty: AIDifficulty = difficulty === 'easy' ? 'greedy' : 'heuristic';

    let playerNames: string[];
    let aiPlayerIndices: number[] | undefined;

    if (mode === 'solo') {
      const humanName = names[0].trim() || 'You';
      const rivalCount = players - 1;
      const rivalNames = Array.from({ length: rivalCount }, (_, k) =>
        rivalCount === 1 ? 'Rival' : `Rival ${k + 1}`
      );
      playerNames = [humanName, ...rivalNames];
      aiPlayerIndices = rivalNames.map((_, k) => k + 1); // seats 1..players-1 are AI
    } else {
      playerNames = names.slice(0, players).map((n, i) => n.trim() || `Player ${i + 1}`);
    }

    const config: GameConfig = {
      playerNames,
      deckMode: 'first151',
      passAndPlay: mode === 'pass',
      aiPlayerIndices,
      aiDifficulty: mode === 'solo' ? aiDifficulty : undefined,
    };
    initGame(config);
    navigation.navigate('GameBoard');
  }

  const playersHint = mode === 'solo'
    ? `1 you + ${players - 1} AI`
    : `${players} humans, pass-and-play`;

  return (
    <LinearGradient colors={theme.appBg} style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={s.topBar}>
          <TouchableOpacity
            style={[s.backBtn, { backgroundColor: theme.surface, borderColor: theme.ring }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={16} color={theme.ink} />
          </TouchableOpacity>
          <Text style={[s.heading, { color: theme.ink }]}>New Game</Text>
        </View>

        <View style={s.columns}>
          <View style={s.column}>
            <View>
              <Text style={[s.label, { color: theme.inkDim }]}>Mode</Text>
              <Segmented
                theme={theme}
                value={mode}
                onChange={setMode}
                options={[
                  { key: 'solo', label: 'Solo vs AI' },
                  { key: 'pass', label: 'Pass & Play' },
                ]}
              />
            </View>

            <View>
              <Text style={[s.label, { color: theme.inkDim }]}>Players</Text>
              <View style={s.stepperRow}>
                <TouchableOpacity
                  style={[s.stepBtn, { backgroundColor: theme.surface, borderColor: theme.ring }]}
                  onPress={() => setPlayers(p => Math.max(2, p - 1))}
                >
                  <Text style={[s.stepSign, { color: theme.ink }]}>−</Text>
                </TouchableOpacity>
                <Text style={[s.stepValue, { color: theme.ink }]}>{players}</Text>
                <TouchableOpacity
                  style={[s.stepBtn, { backgroundColor: theme.surface, borderColor: theme.ring }]}
                  onPress={() => setPlayers(p => Math.min(4, p + 1))}
                >
                  <Text style={[s.stepSign, { color: theme.ink }]}>+</Text>
                </TouchableOpacity>
                <Text style={[s.stepHint, { color: theme.inkDim }]}>{playersHint}</Text>
              </View>
            </View>
          </View>

          <View style={s.column}>
            <View>
              <Text style={[s.label, { color: theme.inkDim }]}>AI difficulty</Text>
              <Segmented
                theme={theme}
                value={difficulty}
                onChange={setDifficulty}
                options={[
                  { key: 'easy', label: 'Easy' },
                  { key: 'normal', label: 'Normal' },
                ]}
              />
            </View>

            <View>
              <Text style={[s.label, { color: theme.inkDim }]}>Deck</Text>
              <Segmented
                theme={theme}
                value="first151"
                onChange={() => {}}
                options={[
                  { key: 'first151', label: 'First 151', sub: 'All Kanto' },
                  { key: 'balanced', label: 'Balanced', sub: 'Coming Soon', disabled: true },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={s.namesBlock}>
          <Text style={[s.label, { color: theme.inkDim }]}>
            {mode === 'solo' ? 'Your name' : 'Player names'}
          </Text>
          {Array.from({ length: nameCount }, (_, i) => (
            <View key={i} style={s.nameRow}>
              <View style={[s.playerDot, { backgroundColor: PLAYER_COLORS[i] }]} />
              <TextInput
                style={[s.nameInput, {
                  color: theme.ink, backgroundColor: theme.surface, borderColor: theme.ring,
                }]}
                value={names[i]}
                onChangeText={v => updateName(i, v)}
                placeholder={`Player ${i + 1}`}
                placeholderTextColor={theme.inkDim}
                maxLength={20}
                returnKeyType="done"
              />
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[s.startBtn, { backgroundColor: theme.accent, borderColor: theme.accentBorder }]}
          onPress={handleStart}
        >
          <Text style={[s.startText, { color: theme.accentText }]}>Start Game →</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 40, paddingVertical: 22 },

  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  backBtn: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  heading: { fontFamily: 'Fredoka_700Bold', fontSize: 24 },

  columns: { flexDirection: 'row', gap: 26 },
  column: { flex: 1, gap: 18 },

  label: {
    fontFamily: 'Poppins_600SemiBold', fontSize: 11,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8,
  },

  segRow: { flexDirection: 'row', gap: 8 },
  segBtn: {
    flex: 1, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1.5,
    alignItems: 'center',
  },
  segLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  segSub: { fontFamily: 'Poppins_400Regular', fontSize: 10, marginTop: 2 },

  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: {
    width: 40, height: 40, borderRadius: 11, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  stepSign: { fontFamily: 'Fredoka_700Bold', fontSize: 20 },
  stepValue: { fontFamily: 'Fredoka_700Bold', fontSize: 28, minWidth: 30, textAlign: 'center' },
  stepHint: { fontFamily: 'Poppins_400Regular', fontSize: 12 },

  namesBlock: { marginTop: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  playerDot: { width: 12, height: 12, borderRadius: 6 },
  nameInput: {
    flex: 1, maxWidth: 360, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 10, borderWidth: 1, fontFamily: 'Poppins_400Regular', fontSize: 14,
  },

  startBtn: {
    marginTop: 22, paddingVertical: 15, borderRadius: 13, borderWidth: 1, alignItems: 'center',
  },
  startText: { fontFamily: 'Fredoka_700Bold', fontSize: 16 },
});
