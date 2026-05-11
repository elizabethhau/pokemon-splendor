import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RulebookScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Rulebook — coming in issue #15</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { fontSize: 16, color: '#666' },
});
