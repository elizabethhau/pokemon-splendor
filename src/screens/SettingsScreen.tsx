import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useGameStore } from '../store/useGameStore';

export default function SettingsScreen() {
  const { soundEnabled, toggleSound } = useGameStore();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Sound Effects</Text>
        <Switch value={soundEnabled} onValueChange={toggleSound} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  label: { fontSize: 16 },
});
