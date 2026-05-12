import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useGameStore } from '../store/useGameStore';
import { GameConfig } from '../types/game';
import { PLAYER_COLORS } from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GameSetup'>;
};

export default function GameSetupScreen({ navigation }: Props) {
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [passAndPlay, setPassAndPlay] = useState(true);
  const initGame = useGameStore(s => s.initGame);

  function updateName(index: number, value: string) {
    setNames(prev => prev.map((n, i) => (i === index ? value : n)));
  }

  function handleStart() {
    const config: GameConfig = {
      playerNames: names.slice(0, playerCount).map((n, i) => n.trim() || `Player ${i + 1}`),
      deckMode: 'first151',
      passAndPlay: playerCount > 1 ? passAndPlay : false,
    };
    initGame(config);
    navigation.navigate('GameBoard');
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pokemon Splendor</Text>
        <Text style={styles.headerSubtitle}>Game Setup</Text>
      </View>

      {/* Player count */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Players</Text>
        <View style={styles.countRow}>
          {([1, 2, 3, 4] as const).map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.countBtn, playerCount === n && styles.countBtnActive]}
              onPress={() => setPlayerCount(n)}
            >
              <Text style={[styles.countBtnText, playerCount === n && styles.countBtnTextActive]}>
                {n}P
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Player names */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Player Names</Text>
        {Array.from({ length: playerCount }, (_, i) => (
          <View key={i} style={styles.nameRow}>
            <View style={[styles.playerDot, { backgroundColor: PLAYER_COLORS[i] }]} />
            <TextInput
              style={styles.nameInput}
              value={names[i]}
              onChangeText={v => updateName(i, v)}
              maxLength={20}
              returnKeyType="done"
            />
          </View>
        ))}
      </View>

      {/* Deck mode */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Deck Mode</Text>
        <View style={styles.modeRow}>
          <View style={[styles.modeBtn, styles.modeBtnActive]}>
            <Text style={[styles.modeBtnText, styles.modeBtnTextActive]}>First 151</Text>
          </View>
          <View style={[styles.modeBtn, styles.modeBtnDisabled]}>
            <Text style={styles.modeBtnTextDisabled}>Balanced</Text>
            <Text style={styles.comingSoon}>Coming Soon</Text>
          </View>
        </View>
      </View>

      {/* Pass & Play */}
      {playerCount > 1 && (
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <Text style={styles.cardLabel}>Pass &amp; Play</Text>
            <Switch
              value={passAndPlay}
              onValueChange={setPassAndPlay}
              trackColor={{ true: '#E53935' }}
            />
          </View>
          <Text style={styles.toggleHint}>Hides board between turns to protect hidden information</Text>
        </View>
      )}

      <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
        <Text style={styles.startBtnText}>Start Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0d1b2a' },
  container: { paddingBottom: 48 },

  header: {
    backgroundColor: '#1a237e',
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#90caf9', marginTop: 4 },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#777',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },

  countRow: { flexDirection: 'row', gap: 10 },
  countBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  countBtnActive: { borderColor: '#E53935', backgroundColor: '#E53935' },
  countBtnText: { fontSize: 15, fontWeight: '600', color: '#666' },
  countBtnTextActive: { color: '#fff' },

  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  playerDot: { width: 12, height: 12, borderRadius: 6 },
  nameInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 6,
    fontSize: 15,
    color: '#222',
  },

  modeRow: { flexDirection: 'row', gap: 10 },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modeBtnActive: { borderColor: '#E53935', backgroundColor: '#E53935' },
  modeBtnDisabled: { backgroundColor: '#fafafa', borderColor: '#e8e8e8', opacity: 0.55 },
  modeBtnText: { fontSize: 14, fontWeight: '600', color: '#555' },
  modeBtnTextActive: { color: '#fff' },
  modeBtnTextDisabled: { fontSize: 14, fontWeight: '600', color: '#bbb' },
  comingSoon: { fontSize: 10, color: '#bbb', marginTop: 2 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleHint: { fontSize: 12, color: '#999', marginTop: 6, lineHeight: 16 },

  startBtn: {
    marginHorizontal: 16,
    marginTop: 28,
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
