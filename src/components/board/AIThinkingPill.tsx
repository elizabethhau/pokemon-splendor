import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import ArtworkImage from './ArtworkImage';

// Compact on-board "rival is thinking" indicator — docks at the top of the
// board so the game stays visible behind it, replacing the old full-screen takeover.
export default function AIThinkingPill({ name, color, avatarDex, scale }: {
  name: string;
  color: string;
  avatarDex: number;
  scale: number;
}) {
  const z = (n: number) => n * scale;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute', top: z(52), alignSelf: 'center',
        flexDirection: 'row', alignItems: 'center', gap: z(9),
        paddingVertical: z(6), paddingLeft: z(6), paddingRight: z(14), borderRadius: 999,
        backgroundColor: 'rgba(20,26,36,0.94)', borderWidth: 1.5, borderColor: color,
        zIndex: 40, elevation: 40,
        shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
      }}
    >
      <View style={{
        width: z(28), height: z(28), borderRadius: z(14), backgroundColor: '#4a5066',
        borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        <ArtworkImage dex={avatarDex} style={{ width: z(26), height: z(26) }} />
      </View>
      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(12), color: '#eef3fa' }}>
        {name} is thinking…
      </Text>
      <ActivityIndicator size="small" color={color} />
    </View>
  );
}
