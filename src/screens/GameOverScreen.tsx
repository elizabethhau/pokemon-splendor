import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useGameStore } from '../store/useGameStore';
import { trainerPoints } from '../store/selectors';
import { getWinners } from '../store/selectors';
import { PLAYER_COLORS } from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GameOver'>;
};

export default function GameOverScreen({ navigation }: Props) {
  const game = useGameStore(s => s.game);

  if (!game) {
    return (
      <View style={styles.center}>
        <Text>No game data.</Text>
      </View>
    );
  }

  const sorted = [...game.players].sort((a, b) => {
    const tpDiff = trainerPoints(b) - trainerPoints(a);
    if (tpDiff !== 0) return tpDiff;
    return a.trainedCards.length - b.trainedCards.length;
  });
  const winners = getWinners(game.players);
  const winnerIds = new Set(winners.map(w => w.id));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Over</Text>
      </View>

      {sorted.map((player, rank) => {
        const tp = trainerPoints(player);
        const cardTP = player.trainedCards.reduce((s, c) => s + c.trainerPoints, 0);
        const legTP = player.legendaries.reduce((s, l) => s + l.trainerPoints, 0);
        const mewTP = player.mythical ? player.mythical.trainerPoints : 0;
        const originalIndex = game.players.findIndex(p => p.id === player.id);
        const color = PLAYER_COLORS[originalIndex] ?? '#888';
        const isWinner = winnerIds.has(player.id);

        return (
          <View
            key={player.id}
            style={[styles.row, isWinner && styles.rowWinner, { borderLeftColor: color }]}
          >
            <Text style={styles.rank}>#{rank + 1}</Text>
            <View style={styles.info}>
              <Text style={[styles.name, isWinner && styles.nameWinner]}>
                {isWinner ? '🏆 ' : ''}{player.name}
              </Text>
              <Text style={styles.breakdown}>
                Cards {cardTP} + Legendaries {legTP} + Mew {mewTP} = {tp} TP
              </Text>
              <Text style={styles.sub}>{player.trainedCards.length} cards trained</Text>
            </View>
            <Text style={[styles.tp, { color }]}>{tp}</Text>
          </View>
        );
      })}

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.secondaryBtnText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('GameSetup')}>
          <Text style={styles.primaryBtnText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1, backgroundColor: '#0d1b2a' },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: 52,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 5,
    borderLeftColor: '#ccc',
  },
  rowWinner: { backgroundColor: '#fff9e6' },
  rank: { fontSize: 18, fontWeight: '700', color: '#999', width: 32 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#222' },
  nameWinner: { color: '#c8a400' },
  breakdown: { fontSize: 12, color: '#666', marginTop: 3 },
  sub: { fontSize: 11, color: '#aaa', marginTop: 1 },
  tp: { fontSize: 26, fontWeight: '800' },

  buttons: { flexDirection: 'row', margin: 16, marginTop: 32, gap: 12 },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#E53935',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
