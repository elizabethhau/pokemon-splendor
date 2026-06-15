import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EnergyType, GameState, PokeballTier, TokenType } from '../../types/game';
import { TYPE_COLORS } from '../../constants';
import { trainerPoints } from '../../store/selectors';
import { useTheme } from '../../theme/ThemeContext';
import ArtworkImage from './ArtworkImage';
import { BALL_TOP_COLORS, onTypeColor, SEAT_AVATAR_DEX } from './util';

const ENERGY_TYPES: EnergyType[] = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic'];
const BALL_ORDER: PokeballTier[] = ['Pokeball', 'GreatBall', 'UltraBall', 'MasterBall'];

function BallGlyph({ ball, size }: { ball: PokeballTier; size: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2, backgroundColor: '#fff',
      borderWidth: 2, borderColor: '#1d2530', overflow: 'hidden',
    }}>
      <View style={{ height: '50%', backgroundColor: BALL_TOP_COLORS[ball] }} />
      <View style={{ position: 'absolute', top: '50%', left: -2, right: -2, height: 2, marginTop: -1, backgroundColor: '#1d2530' }} />
    </View>
  );
}

export default function Dock({
  game, scale, selecting, selectionTotal, selectionValid,
  onClear, onTake, onEndTurn, endTurnEnabled, mewEligible, onCatchMew, onOpenHand,
  canUndo, onUndo, showActions,
}: {
  game: GameState;
  scale: number;
  selecting: boolean;
  selectionTotal: number;
  selectionValid: boolean;
  onClear: () => void;
  onTake: () => void;
  onEndTurn: () => void;
  endTurnEnabled: boolean;
  mewEligible: boolean;
  onCatchMew: () => void;
  onOpenHand: () => void;
  canUndo: boolean;
  onUndo: () => void;
  showActions: boolean;
}) {
  const { theme } = useTheme();
  const z = (n: number) => n * scale;
  const player = game.players[game.currentPlayerIndex];
  const tp = trainerPoints(player);

  const heldTokens = (Object.entries(player.energyTokens) as [TokenType, number][]).filter(([, n]) => n > 0);
  const energyCount = heldTokens.reduce((acc, [, n]) => acc + n, 0);
  const heldBalls = BALL_ORDER
    .map(ball => [ball, player.pokeballs[ball] ?? 0] as const)
    .filter(([, n]) => n > 0);

  const label = {
    fontFamily: 'Poppins_700Bold', fontSize: z(7), color: theme.dockDim, letterSpacing: 1,
  } as const;
  const ghostBtn = {
    paddingVertical: z(9), paddingHorizontal: z(14), borderRadius: z(11),
    borderWidth: 1.5, borderColor: theme.dockGhostBorder,
  } as const;
  const ghostText = { fontFamily: 'Poppins_600SemiBold', fontSize: z(12), color: theme.dockText } as const;

  return (
    <LinearGradient
      colors={theme.dock}
      style={{
        height: z(78), flexDirection: 'row', alignItems: 'center', gap: z(13),
        paddingHorizontal: z(14), borderTopWidth: 1, borderTopColor: theme.ring,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(9) }}>
        <View style={{
          width: z(42), height: z(42), borderRadius: z(21), backgroundColor: theme.surface,
          borderWidth: 2, borderColor: theme.tpDock, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          <ArtworkImage dex={SEAT_AVATAR_DEX[game.currentPlayerIndex % SEAT_AVATAR_DEX.length]} style={{ width: z(38), height: z(38) }} />
        </View>
        <View>
          <Text numberOfLines={1} style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(11), color: theme.dockText }}>
            {player.name}
          </Text>
          <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(20), color: theme.tpDock, lineHeight: z(21) }}>
            {tp}
            <Text style={{ fontSize: z(10), color: theme.dockDim, fontFamily: 'Poppins_600SemiBold' }}> TP</Text>
          </Text>
        </View>
      </View>

      <View style={{ width: 1, height: z(46), backgroundColor: theme.ring }} />

      <View style={{ gap: z(4) }}>
        <Text style={label}>TYPE BONUS</Text>
        <View style={{ flexDirection: 'row', gap: z(4) }}>
          {ENERGY_TYPES.map(type => {
            const count = player.typeBonuses[type] ?? 0;
            return (
              <View key={type} style={{
                width: z(23), height: z(26), borderRadius: z(6),
                backgroundColor: TYPE_COLORS[type], opacity: count > 0 ? 1 : 0.25,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(11), color: onTypeColor(type) }}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ gap: z(4) }}>
        <Text style={label}>ENERGY {energyCount}</Text>
        <View style={{ flexDirection: 'row', gap: z(6), minHeight: z(20), alignItems: 'center' }}>
          {heldTokens.length === 0 ? (
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(10), color: theme.dockDim }}>none</Text>
          ) : heldTokens.map(([type, count]) => (
            <View key={type} style={{ flexDirection: 'row', alignItems: 'center', gap: z(3) }}>
              <View style={{
                width: z(20), height: z(20), borderRadius: z(10), backgroundColor: TYPE_COLORS[type],
                borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.8)',
              }} />
              <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(12), color: theme.dockText }}>{count}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: z(4) }}>
        <Text style={label}>BALLS</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(7), minHeight: z(20) }}>
          {heldBalls.length === 0 ? (
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(10), color: theme.dockDim }}>none</Text>
          ) : heldBalls.map(([ball, count]) => (
            <View key={ball} style={{ flexDirection: 'row', alignItems: 'center', gap: z(3) }}>
              <BallGlyph ball={ball} size={z(18)} />
              <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: z(11), color: theme.dockText }}>{count}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={{ gap: z(4) }} onPress={onOpenHand}>
        <Text style={label}>HAND {player.scoutedCards.length}/3</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: z(4), minHeight: z(20) }}>
          {player.scoutedCards.length === 0 ? (
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: z(10), color: theme.dockDim }}>empty</Text>
          ) : (
            <>
              {player.scoutedCards.map(card => (
                <View
                  key={card.pokedexNumber}
                  style={{
                    width: z(17), height: z(23), borderRadius: z(4),
                    backgroundColor: TYPE_COLORS[card.energyType],
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.65)',
                    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  }}
                >
                  <ArtworkImage dex={card.pokedexNumber} style={{ width: z(16), height: z(16) }} />
                </View>
              ))}
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(9.5), color: theme.accentSolid, marginLeft: z(1) }}>
                View
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>

      {showActions && (
      <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: z(8) }}>
        {selecting ? (
          <>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: z(11), color: theme.dockDim }}>
              {selectionTotal}/3 energy
            </Text>
            <TouchableOpacity style={ghostBtn} onPress={onClear}>
              <Text style={ghostText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onTake}
              disabled={!selectionValid}
              style={{
                paddingVertical: z(9), paddingHorizontal: z(17), borderRadius: z(11),
                backgroundColor: selectionValid ? theme.accent : theme.ring2,
                borderWidth: 1, borderColor: theme.accentBorder,
                opacity: selectionValid ? 1 : 0.55,
              }}
            >
              <Text style={{
                fontFamily: 'Poppins_700Bold', fontSize: z(12.5),
                color: selectionValid ? theme.accentText : theme.dockDim,
              }}>
                Take Energy
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {canUndo && (
              <TouchableOpacity style={ghostBtn} onPress={onUndo}>
                <Text style={ghostText}>↩ Undo Action</Text>
              </TouchableOpacity>
            )}
            {mewEligible && (
              <TouchableOpacity style={ghostBtn} onPress={onCatchMew}>
                <Text style={ghostText}>Catch Mew</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onEndTurn}
              disabled={!endTurnEnabled}
              style={{
                paddingVertical: z(9), paddingHorizontal: z(18), borderRadius: z(11),
                backgroundColor: theme.dockBtnBg, borderWidth: 1, borderColor: theme.accentBorder,
                opacity: endTurnEnabled ? 1 : 0.45,
              }}
            >
              <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: z(12.5), color: theme.dockBtnText }}>
                End Turn
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      )}
    </LinearGradient>
  );
}
