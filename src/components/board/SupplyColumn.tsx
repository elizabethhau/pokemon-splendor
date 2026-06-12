import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { TokenType } from '../../types/game';
import { TYPE_COLORS } from '../../constants';
import { useTheme } from '../../theme/ThemeContext';
import { TokenSelection } from '../../store/tokenSelection';
import { onTypeColor } from './util';

const TOKEN_ORDER: TokenType[] = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ditto'];

export default function SupplyColumn({ supply, selection, scale, onTokenTap }: {
  supply: Record<TokenType, number>;
  selection: TokenSelection;
  scale: number;
  onTokenTap: (type: TokenType) => void;
}) {
  const { theme } = useTheme();
  const z = (n: number) => n * scale;

  return (
    <View style={{ width: z(44), alignItems: 'center', gap: z(4), paddingTop: z(1), justifyContent: 'center' }}>
      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: z(7), color: theme.cardSub, letterSpacing: 1 }}>
        SUPPLY
      </Text>
      {TOKEN_ORDER.map(type => {
        const selected = type !== 'Ditto' ? (selection[type] ?? 0) : 0;
        const remaining = supply[type] - selected;
        return (
          <TouchableOpacity
            key={type}
            onPress={() => onTokenTap(type)}
            activeOpacity={0.7}
            style={{
              width: z(33), height: z(33), borderRadius: z(17),
              backgroundColor: TYPE_COLORS[type],
              borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)',
              alignItems: 'center', justifyContent: 'center',
              opacity: remaining === 0 ? 0.35 : 1,
            }}
          >
            <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(13), color: onTypeColor(type) }}>
              {remaining}
            </Text>
            {selected > 0 && (
              <View style={{
                position: 'absolute', top: -z(5), right: -z(5),
                width: z(16), height: z(16), borderRadius: z(8),
                backgroundColor: theme.accentSolid, borderWidth: 1.5, borderColor: '#fff',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(9), color: theme.accentText }}>
                  {selected}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
