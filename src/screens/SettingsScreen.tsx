import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useGameStore } from '../store/useGameStore';
import { useTheme } from '../theme/ThemeContext';
import { themes, THEME_IDS } from '../theme/themes';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: Props) {
  const { soundEnabled, toggleSound } = useGameStore();
  const { theme, themeId, setThemeId } = useTheme();

  return (
    <LinearGradient colors={theme.appBg} style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: theme.surface, borderColor: theme.ring }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={16} color={theme.ink} />
        </TouchableOpacity>
        <Text style={[s.heading, { color: theme.ink }]}>Settings</Text>
      </View>

      <Text style={[s.sectionLabel, { color: theme.inkDim }]}>Theme</Text>
      <View style={s.themeRow}>
        {THEME_IDS.map((id) => {
          const active = id === themeId;
          return (
            <TouchableOpacity
              key={id}
              style={[
                s.themeBtn,
                { backgroundColor: theme.surface, borderColor: active ? theme.accentSolid : theme.ring },
                active && { borderWidth: 2 },
              ]}
              onPress={() => setThemeId(id)}
            >
              <Text style={[s.themeTag, { color: active ? theme.accentSolid : theme.ink }]}>{id}</Text>
              <Text style={[s.themeLabel, { color: theme.inkDim }]}>{themes[id].label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[s.sectionLabel, { color: theme.inkDim }]}>Sound</Text>
      <View style={[s.row, { backgroundColor: theme.surface, borderColor: theme.ring }]}>
        <Text style={[s.rowLabel, { color: theme.ink }]}>Sound Effects</Text>
        <Switch
          value={soundEnabled}
          onValueChange={toggleSound}
          trackColor={{ true: theme.accentSolid }}
        />
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 40, paddingTop: 26 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  backBtn: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  heading: { fontFamily: 'Fredoka_700Bold', fontSize: 19 },
  sectionLabel: {
    fontFamily: 'Poppins_600SemiBold', fontSize: 12,
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
  },
  themeRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  themeBtn: {
    flex: 1, maxWidth: 180, padding: 12, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', gap: 2,
  },
  themeTag: { fontFamily: 'Fredoka_700Bold', fontSize: 18 },
  themeLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    maxWidth: 560, padding: 14, borderRadius: 12, borderWidth: 1,
  },
  rowLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
});
