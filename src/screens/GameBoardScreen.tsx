import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useGameStore } from '../store/useGameStore';
import { currentPlayer, trainerPoints, canCatchMew } from '../store/selectors';
import {
  EnergyType, EvolutionTier, Legendary, Mythical,
  PokemonCard, PokeballTier, TokenType,
} from '../types/game';
import {
  TYPE_COLORS, PLAYER_COLORS, PHASE, MIN_SUPPLY_FOR_TAKE_TWO,
  SCOUT_HAND_LIMIT, BASE_CATCH_RATES, MEWTWO_CATCH_BONUS, MEWTWO_POKEDEX_NUMBER,
} from '../constants';
import PokemonCardView from '../components/PokemonCardView';
import TokenDiscardModal from '../components/TokenDiscardModal';
import CardDetailModal from '../components/CardDetailModal';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GameBoard'>;
};

// ── Internal sub-components ──────────────────────────────────────────────────

function TierRow({
  tier, faceCards, deckCount, onCardPress, onDeckPress, actionAvailable,
}: {
  tier: 1 | 2 | 3;
  faceCards: PokemonCard[];
  deckCount: number;
  onCardPress: (card: PokemonCard) => void;
  onDeckPress: (tier: EvolutionTier) => void;
  actionAvailable: boolean;
}) {
  const tierLabels: Record<1 | 2 | 3, string> = { 1: 'Basic', 2: 'Stage 1', 3: 'Stage 2' };
  return (
    <View style={s.tierSection}>
      <View style={s.tierHeader}>
        <Text style={s.tierLabel}>Tier {tier} — {tierLabels[tier]}</Text>
        <View style={[s.deckBadge, deckCount === 0 && s.deckBadgeEmpty]}>
          <Text style={s.deckBadgeText}>{deckCount > 0 ? `${deckCount} left` : 'Empty'}</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cardRow}>
        {faceCards.map(card => (
          <PokemonCardView key={card.pokedexNumber} card={card} onPress={() => onCardPress(card)} />
        ))}
        <TouchableOpacity
          style={[s.deckArea, deckCount === 0 && s.deckAreaEmpty]}
          onPress={() => actionAvailable && deckCount > 0 && onDeckPress(tier)}
          disabled={!actionAvailable || deckCount === 0}
        >
          <Text style={s.deckAreaIcon}>D</Text>
          <Text style={s.deckAreaCount}>{deckCount > 0 ? deckCount : '—'}</Text>
          {actionAvailable && deckCount > 0 && <Text style={s.deckAreaHint}>Scout</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function EnergySupplyRow({
  supply, tokenSelection, onTokenTap, canTap, interactive,
}: {
  supply: Record<TokenType, number>;
  tokenSelection: Partial<Record<EnergyType, number>>;
  onTokenTap: (type: EnergyType) => void;
  canTap: (type: EnergyType) => boolean;
  interactive: boolean;
}) {
  const types: TokenType[] = ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Ditto'];
  return (
    <View style={s.supplySection}>
      <Text style={s.sectionLabel}>Energy Supply</Text>
      <View style={s.supplyRow}>
        {types.map(type => {
          const isDitto = type === 'Ditto';
          const energyType = type as EnergyType;
          const selected = !isDitto ? (tokenSelection[energyType] ?? 0) : 0;
          const displayCount = supply[type] - selected;
          const tappable = interactive && !isDitto && canTap(energyType);
          const isSelected = selected > 0;

          const circle = (
            <View style={[
              s.supplyCircle,
              { backgroundColor: TYPE_COLORS[type] },
              supply[type] === 0 && s.supplyCircleEmpty,
              isSelected && s.supplyCircleSelected,
            ]}>
              <Text style={[s.supplyCount, supply[type] === 0 && s.supplyCountEmpty]}>{displayCount}</Text>
              {isSelected && <Text style={s.supplySelectedBadge}>-{selected}</Text>}
            </View>
          );

          return (
            <View key={type} style={s.supplyToken}>
              {tappable ? (
                <TouchableOpacity onPress={() => onTokenTap(energyType)} activeOpacity={0.7}>
                  {circle}
                </TouchableOpacity>
              ) : circle}
              <Text style={s.supplyTypeLabel}>
                {isDitto ? 'Ditto*' : type.slice(0, 3)}
              </Text>
            </View>
          );
        })}
      </View>
      {interactive && <Text style={s.supplyHint}>Tap tokens to select • Ditto given by scouting</Text>}
    </View>
  );
}

function LegendariesPanel({ legendaries, mew }: { legendaries: Legendary[]; mew: Mythical | null }) {
  if (legendaries.length === 0 && !mew) return null;
  return (
    <View style={s.legendarySection}>
      <Text style={s.sectionLabel}>Legendaries</Text>
      {legendaries.map(leg => (
        <View key={leg.pokedexNumber} style={s.legRow}>
          <View style={s.legInfo}>
            <Text style={s.legName}>{leg.name}</Text>
            <View style={s.legReqs}>
              {(Object.entries(leg.requirements) as [EnergyType, number][]).map(([type, count]) => (
                <View key={type} style={[s.legReqBadge, { backgroundColor: TYPE_COLORS[type] }]}>
                  <Text style={s.legReqText}>{count} {type.slice(0, 3)}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={s.legTP}>{leg.trainerPoints} TP</Text>
        </View>
      ))}
      {mew && (
        <View style={[s.legRow, s.mewRow]}>
          <View style={s.legInfo}>
            <Text style={s.legName}>Mew (Mythical)</Text>
            <Text style={s.mewReq}>Needs {mew.legendariesRequired} Legendaries + Pokeball</Text>
          </View>
          <Text style={s.legTP}>{mew.trainerPoints} TP</Text>
        </View>
      )}
    </View>
  );
}

function TokenRow({ energyTokens }: { energyTokens: Partial<Record<TokenType, number>> }) {
  const entries = (Object.entries(energyTokens) as [TokenType, number][]).filter(([, n]) => n > 0);
  return (
    <View style={s.hudRow}>
      <Text style={s.hudRowLabel}>Tokens</Text>
      {entries.length === 0 ? (
        <Text style={s.hudRowEmpty}>none</Text>
      ) : (
        <View style={s.hudRowItems}>
          {entries.map(([type, count]) => (
            <View key={type} style={s.tokenChip}>
              <View style={[s.tokenDot, { backgroundColor: TYPE_COLORS[type] }]} />
              <Text style={s.tokenCount}>{count}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function BonusRow({ bonuses }: { bonuses: Partial<Record<EnergyType, number>> }) {
  const entries = (Object.entries(bonuses) as [EnergyType, number][]).filter(([, n]) => n > 0);
  if (entries.length === 0) return null;
  return (
    <View style={s.hudRow}>
      <Text style={s.hudRowLabel}>Bonuses</Text>
      <View style={s.hudRowItems}>
        {entries.map(([type, count]) => (
          <View key={type} style={s.tokenChip}>
            <View style={[s.tokenDot, { backgroundColor: TYPE_COLORS[type] }]} />
            <Text style={s.tokenCount}>+{count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PokeballRow({ pokeballs }: { pokeballs: Partial<Record<PokeballTier, number>> }) {
  const entries = (Object.entries(pokeballs) as [PokeballTier, number][]).filter(([, n]) => n > 0);
  if (entries.length === 0) return null;
  const labels: Record<PokeballTier, string> = {
    Pokeball: 'PB', GreatBall: 'GB', UltraBall: 'UB', MasterBall: 'MB',
  };
  return (
    <View style={s.hudRow}>
      <Text style={s.hudRowLabel}>Pokeballs</Text>
      <View style={s.hudRowItems}>
        {entries.map(([ball, count]) => (
          <View key={ball} style={s.ballChip}>
            <Text style={s.ballLabel}>{labels[ball]} x{count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const BALL_ORDER: PokeballTier[] = ['Pokeball', 'GreatBall', 'UltraBall', 'MasterBall'];
const BALL_LABELS: Record<PokeballTier, string> = {
  Pokeball: 'Pokeball', GreatBall: 'Great Ball', UltraBall: 'Ultra Ball', MasterBall: 'Master Ball',
};

// ── Main screen ──────────────────────────────────────────────────────────────

export default function GameBoardScreen({ navigation }: Props) {
  const game = useGameStore(s => s.game);
  const advanceTurn = useGameStore(s => s.advanceTurn);
  const acknowledgeHandoff = useGameStore(s => s.acknowledgeHandoff);
  const takeTokens = useGameStore(s => s.takeTokens);
  const trainCard = useGameStore(s => s.trainCard);
  const scoutFaceUp = useGameStore(s => s.scoutFaceUp);
  const scoutFromDeck = useGameStore(s => s.scoutFromDeck);
  const catchMew = useGameStore(s => s.catchMew);

  const [tokenSelection, setTokenSelection] = useState<Partial<Record<EnergyType, number>>>({});
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [selectedCardSource, setSelectedCardSource] = useState<'face' | 'scouted' | null>(null);
  const [catchModalVisible, setCatchModalVisible] = useState(false);
  const [selectedBall, setSelectedBall] = useState<PokeballTier | null>(null);

  useEffect(() => {
    if (game?.phase === PHASE.GAME_OVER) {
      navigation.replace('GameOver');
    }
  }, [game?.phase, navigation]);

  useEffect(() => {
    setTokenSelection({});
  }, [game?.currentPlayerIndex, game?.turnNumber]);

  if (!game) {
    return (
      <SafeAreaView style={s.center}>
        <Text style={s.centerText}>No game in progress.</Text>
      </SafeAreaView>
    );
  }

  if (game.pendingHandoff) {
    const nextPlayer = game.players[game.currentPlayerIndex];
    const nextColor = PLAYER_COLORS[game.currentPlayerIndex] ?? '#888';
    return (
      <View style={s.handoff}>
        <Text style={s.handoffPrompt}>Hand the phone to</Text>
        <Text style={[s.handoffName, { color: nextColor }]}>{nextPlayer.name}</Text>
        <TouchableOpacity style={[s.handoffBtn, { borderColor: nextColor }]} onPress={acknowledgeHandoff}>
          <Text style={[s.handoffBtnText, { color: nextColor }]}>Tap when ready</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const player = currentPlayer(game);
  const tp = trainerPoints(player);
  const playerColor = PLAYER_COLORS[game.currentPlayerIndex] ?? '#888';
  const canEndTurn = game.actionTakenThisTurn && game.phase !== PHASE.DISCARDING;
  const actionAvailable = !game.actionTakenThisTurn &&
    game.phase !== PHASE.DISCARDING &&
    game.phase !== PHASE.GAME_OVER;

  // ── Token selection helpers ──

  function canTapToken(type: EnergyType): boolean {
    const supply = game!.board.energySupply;
    const currentSelected = tokenSelection[type] ?? 0;
    const totalSelected = Object.values(tokenSelection).reduce<number>((acc, n) => acc + (n ?? 0), 0);

    if (supply[type] - currentSelected <= 0) return false;
    if (totalSelected === 0) return true;

    const selectedTypes = (Object.keys(tokenSelection) as EnergyType[]).filter(t => (tokenSelection[t] ?? 0) > 0);

    if (totalSelected === 2 && selectedTypes.length === 1) return false;
    if (totalSelected >= 3) return false;

    if (totalSelected === 1 && selectedTypes.length === 1) {
      if (type === selectedTypes[0]) return supply[type] >= MIN_SUPPLY_FOR_TAKE_TWO;
      return true;
    }
    if (totalSelected === 2 && selectedTypes.length === 2) {
      return !selectedTypes.includes(type);
    }
    return false;
  }

  function handleTokenTap(type: EnergyType) {
    if (!actionAvailable || !canTapToken(type)) return;
    setTokenSelection(prev => ({ ...prev, [type]: (prev[type] ?? 0) + 1 }));
  }

  function isSelectionValid(): boolean {
    const entries = (Object.entries(tokenSelection) as [EnergyType, number][]).filter(([, n]) => n > 0);
    const total = entries.reduce((acc, [, n]) => acc + n, 0);
    return (total === 3 && entries.every(([, n]) => n === 1)) || (total === 2 && entries.length === 1);
  }

  function handleConfirmTokens() {
    try {
      takeTokens(tokenSelection);
      setTokenSelection({});
    } catch (e: unknown) {
      Alert.alert('Cannot take tokens', e instanceof Error ? e.message : String(e));
    }
  }

  // ── Card action helpers ──

  function handleCardPress(card: PokemonCard, source: 'face' | 'scouted') {
    setSelectedCard(card);
    setSelectedCardSource(source);
  }

  function handleTrain(card: PokemonCard) {
    const legNamesBefore = game!.board.availableLegendaries.map(l => l.name);
    try {
      trainCard(card);
      setSelectedCard(null);
      const newGame = useGameStore.getState().game;
      if (newGame) {
        const claimed = legNamesBefore.filter(
          name => !newGame.board.availableLegendaries.some(l => l.name === name)
        );
        if (claimed.length > 0) {
          Alert.alert('Legendary obtained!', `${claimed.join(' and ')} joined your team!`);
        }
      }
    } catch (e: unknown) {
      Alert.alert('Cannot train', e instanceof Error ? e.message : String(e));
    }
  }

  function handleScoutFaceUp(card: PokemonCard) {
    try {
      scoutFaceUp(card);
      setSelectedCard(null);
    } catch (e: unknown) {
      Alert.alert('Cannot scout', e instanceof Error ? e.message : String(e));
    }
  }

  function handleDeckPress(tier: EvolutionTier) {
    if (!actionAvailable) return;
    if (player.scoutedCards.length >= SCOUT_HAND_LIMIT) {
      Alert.alert('Scout limit', 'You can only hold 3 scouted cards at a time.');
      return;
    }
    try {
      scoutFromDeck(tier);
      Alert.alert('Scouted!', 'You drew a card from the deck. It has been added to your scouted hand.');
    } catch (e: unknown) {
      Alert.alert('Cannot scout', e instanceof Error ? e.message : String(e));
    }
  }

  const selectionTotal = Object.values(tokenSelection).reduce<number>((acc, n) => acc + (n ?? 0), 0);
  const selectionHasTokens = selectionTotal > 0;

  function handleEndTurn() {
    try {
      advanceTurn();
    } catch (e: unknown) {
      Alert.alert('Cannot end turn', e instanceof Error ? e.message : String(e));
    }
  }

  // ── Catch Mew helpers ──

  const mewOnBoard = game.board.mew;
  const mewEligible = mewOnBoard !== null && canCatchMew(player, mewOnBoard) && actionAvailable;
  const hasMewtwo = player.legendaries.some(l => l.pokedexNumber === MEWTWO_POKEDEX_NUMBER);
  const availableBalls = (Object.entries(player.pokeballs) as [PokeballTier, number][])
    .filter(([, n]) => n > 0)
    .sort(([a], [b]) => BALL_ORDER.indexOf(a) - BALL_ORDER.indexOf(b));

  function handleCatchMew() {
    if (!selectedBall) return;
    const ball = selectedBall;
    try {
      const caught = catchMew(ball);
      setCatchModalVisible(false);
      setSelectedBall(null);
      Alert.alert(
        caught ? 'Mew caught!' : 'Mew escaped!',
        caught
          ? 'Mew joined your team! That\'s 5 Trainer Points!'
          : `The ${ball} was spent. Mew escaped this time. Try again next turn.`
      );
    } catch (e: unknown) {
      Alert.alert('Cannot attempt catch', e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <SafeAreaView style={s.root}>
      <ScrollView style={s.board} contentContainerStyle={s.boardContent}>
        <TierRow
          tier={3}
          faceCards={game.board.tier3Face}
          deckCount={game.board.tier3Deck.length}
          onCardPress={c => handleCardPress(c, 'face')}
          onDeckPress={handleDeckPress}
          actionAvailable={actionAvailable}
        />
        <TierRow
          tier={2}
          faceCards={game.board.tier2Face}
          deckCount={game.board.tier2Deck.length}
          onCardPress={c => handleCardPress(c, 'face')}
          onDeckPress={handleDeckPress}
          actionAvailable={actionAvailable}
        />
        <TierRow
          tier={1}
          faceCards={game.board.tier1Face}
          deckCount={game.board.tier1Deck.length}
          onCardPress={c => handleCardPress(c, 'face')}
          onDeckPress={handleDeckPress}
          actionAvailable={actionAvailable}
        />

        <EnergySupplyRow
          supply={game.board.energySupply}
          tokenSelection={tokenSelection}
          onTokenTap={handleTokenTap}
          canTap={canTapToken}
          interactive={actionAvailable}
        />

        {selectionHasTokens && (
          <View style={s.selectionPanel}>
            <View style={s.selectionChips}>
              {(Object.entries(tokenSelection) as [EnergyType, number][])
                .filter(([, n]) => n > 0)
                .map(([type, count]) => (
                  <View key={type} style={[s.selectionChip, { borderColor: TYPE_COLORS[type] }]}>
                    <View style={[s.tokenDot, { backgroundColor: TYPE_COLORS[type] }]} />
                    <Text style={s.selectionChipText}>{count > 1 ? `×${count}` : type.slice(0, 3)}</Text>
                  </View>
                ))}
            </View>
            <View style={s.selectionBtns}>
              <TouchableOpacity style={s.clearBtn} onPress={() => setTokenSelection({})}>
                <Text style={s.clearBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.confirmTokenBtn, !isSelectionValid() && s.confirmTokenBtnDisabled]}
                onPress={handleConfirmTokens}
                disabled={!isSelectionValid()}
              >
                <Text style={s.confirmTokenText}>
                  {isSelectionValid() ? 'Take Tokens' : `${selectionTotal}/3 selected`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <LegendariesPanel legendaries={game.board.availableLegendaries} mew={game.board.mew} />
      </ScrollView>

      {/* Player HUD */}
      <View style={s.hud}>
        <View style={s.hudHeader}>
          <View style={[s.playerDot, { backgroundColor: playerColor }]} />
          <Text style={s.hudName}>{player.name}</Text>
          <Text style={s.hudPhase}>
            {game.phase === PHASE.FINAL_ROUND ? 'Final Round' : `Turn ${game.turnNumber}`}
          </Text>
          <Text style={[s.hudTP, { color: playerColor }]}>{tp} TP</Text>
        </View>

        <TokenRow energyTokens={player.energyTokens} />
        <BonusRow bonuses={player.typeBonuses} />
        <PokeballRow pokeballs={player.pokeballs} />

        {mewEligible && (
          <TouchableOpacity style={s.catchMewBtn} onPress={() => setCatchModalVisible(true)}>
            <Text style={s.catchMewBtnText}>Catch Mew! (5 TP)</Text>
          </TouchableOpacity>
        )}

        {player.scoutedCards.length > 0 && (
          <View style={s.scoutedSection}>
            <Text style={s.hudRowLabel}>Scouted ({player.scoutedCards.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {player.scoutedCards.map(c => (
                <PokemonCardView
                  key={c.pokedexNumber}
                  card={c}
                  compact
                  onPress={() => handleCardPress(c, 'scouted')}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity
          style={[s.endTurnBtn, !canEndTurn && s.endTurnBtnDisabled]}
          onPress={handleEndTurn}
          disabled={!canEndTurn}
        >
          <Text style={[s.endTurnText, !canEndTurn && s.endTurnTextDisabled]}>
            {game.phase === PHASE.DISCARDING ? 'Discard tokens first' : 'End Turn'}
          </Text>
        </TouchableOpacity>
      </View>

      <CardDetailModal
        card={selectedCard}
        source={selectedCardSource}
        player={player}
        actionTakenThisTurn={game.actionTakenThisTurn}
        onClose={() => { setSelectedCard(null); setSelectedCardSource(null); }}
        onTrain={handleTrain}
        onScout={handleScoutFaceUp}
      />

      <TokenDiscardModal />

      {/* Catch Mew modal */}
      <Modal visible={catchModalVisible} transparent animationType="slide" onRequestClose={() => setCatchModalVisible(false)}>
        <View style={s.catchBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setCatchModalVisible(false)} />
          <View style={s.catchSheet}>
            <Text style={s.catchTitle}>Catch Mew!</Text>
            <Text style={s.catchSub}>Failed attempts consume the ball. Choose wisely.</Text>

            {hasMewtwo && (
              <View style={s.mewtwoBanner}>
                <Text style={s.mewtwoBannerText}>
                  Mewtwo bonus: +{Math.round(MEWTWO_CATCH_BONUS * 100)}% to all catch rates
                </Text>
              </View>
            )}

            {availableBalls.map(([ball, count]) => {
              const baseRate = BASE_CATCH_RATES[ball];
              const rate = Math.min(1, baseRate + (hasMewtwo ? MEWTWO_CATCH_BONUS : 0));
              const pct = Math.round(rate * 100);
              return (
                <TouchableOpacity
                  key={ball}
                  style={[s.ballRow, selectedBall === ball && s.ballRowSelected]}
                  onPress={() => setSelectedBall(ball)}
                >
                  <View style={s.ballInfo}>
                    <Text style={s.ballName}>{BALL_LABELS[ball]}</Text>
                    <Text style={s.ballCount}>x{count} available</Text>
                  </View>
                  <Text style={[s.ballRate, ball === 'MasterBall' && s.ballRatePerfect]}>{pct}%</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[s.catchConfirmBtn, !selectedBall && s.catchConfirmBtnDisabled]}
              onPress={handleCatchMew}
              disabled={!selectedBall}
            >
              <Text style={s.catchConfirmText}>
                {selectedBall ? `Throw ${BALL_LABELS[selectedBall]}!` : 'Select a Pokeball'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d1b2a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1b2a' },
  centerText: { color: '#aaa', fontSize: 16 },

  handoff: { flex: 1, backgroundColor: '#0d1b2a', alignItems: 'center', justifyContent: 'center', padding: 32 },
  handoffPrompt: { fontSize: 20, color: '#aaa', marginBottom: 8 },
  handoffName: { fontSize: 32, fontWeight: '800', marginBottom: 48 },
  handoffBtn: { borderWidth: 2, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48 },
  handoffBtnText: { fontSize: 17, fontWeight: '600' },

  board: { flex: 1 },
  boardContent: { paddingBottom: 8 },

  tierSection: { marginTop: 8, paddingHorizontal: 12 },
  tierHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  tierLabel: { fontSize: 11, fontWeight: '700', color: '#90caf9', textTransform: 'uppercase', letterSpacing: 0.5 },
  deckBadge: { backgroundColor: '#1e3a5f', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  deckBadgeEmpty: { backgroundColor: '#333' },
  deckBadgeText: { fontSize: 10, color: '#aaa' },
  cardRow: { paddingBottom: 4, paddingRight: 8 },
  deckArea: {
    width: 52, height: 110, backgroundColor: '#1e3a5f', borderRadius: 8,
    borderWidth: 1, borderColor: '#2a5080', borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginRight: 4,
  },
  deckAreaEmpty: { backgroundColor: '#1a1a2e', borderColor: '#333' },
  deckAreaIcon: { fontSize: 12, color: '#90caf9', fontWeight: '700' },
  deckAreaCount: { fontSize: 11, color: '#aaa', marginTop: 4 },
  deckAreaHint: { fontSize: 9, color: '#4a8fc0', marginTop: 4 },

  supplySection: { marginTop: 12, paddingHorizontal: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#90caf9', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  supplyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  supplyToken: { alignItems: 'center', gap: 4 },
  supplyCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  supplyCircleEmpty: { opacity: 0.3 },
  supplyCircleSelected: { borderWidth: 3, borderColor: '#fff' },
  supplyCount: { fontSize: 15, fontWeight: '800', color: '#fff' },
  supplyCountEmpty: { color: '#999' },
  supplySelectedBadge: { position: 'absolute', top: -4, right: -4, fontSize: 8, color: '#fff', backgroundColor: '#333', borderRadius: 6, paddingHorizontal: 2 },
  supplyTypeLabel: { fontSize: 9, color: '#aaa', fontWeight: '600' },
  supplyHint: { fontSize: 10, color: '#445', marginTop: 6, textAlign: 'center' },

  selectionPanel: { marginHorizontal: 12, marginTop: 10, backgroundColor: '#1e3a5f', borderRadius: 10, padding: 12 },
  selectionChips: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  selectionChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  selectionChipText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  selectionBtns: { flexDirection: 'row', gap: 10 },
  clearBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#555', alignItems: 'center' },
  clearBtnText: { color: '#aaa', fontSize: 13 },
  confirmTokenBtn: { flex: 2, paddingVertical: 8, borderRadius: 6, backgroundColor: '#1565C0', alignItems: 'center' },
  confirmTokenBtnDisabled: { backgroundColor: '#2a3a4a' },
  confirmTokenText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  legendarySection: { marginTop: 12, paddingHorizontal: 12, marginBottom: 4 },
  legRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e3a5f', borderRadius: 8, padding: 10, marginBottom: 6 },
  mewRow: { backgroundColor: '#2a1a3a' },
  legInfo: { flex: 1 },
  legName: { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 4 },
  legReqs: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  legReqBadge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  legReqText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  legTP: { fontSize: 16, fontWeight: '800', color: '#ffd700', marginLeft: 8 },
  mewReq: { fontSize: 11, color: '#ccc', marginTop: 2 },

  hud: { backgroundColor: '#111827', borderTopWidth: 1, borderTopColor: '#1e3a5f', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  hudHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  playerDot: { width: 10, height: 10, borderRadius: 5 },
  hudName: { fontSize: 15, fontWeight: '700', color: '#fff', flex: 1 },
  hudPhase: { fontSize: 11, color: '#888' },
  hudTP: { fontSize: 18, fontWeight: '800' },

  hudRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 8 },
  hudRowLabel: { fontSize: 10, color: '#666', fontWeight: '700', textTransform: 'uppercase', width: 52 },
  hudRowEmpty: { fontSize: 12, color: '#444' },
  hudRowItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tokenChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tokenDot: { width: 10, height: 10, borderRadius: 5 },
  tokenCount: { fontSize: 12, fontWeight: '600', color: '#ddd' },
  ballChip: { backgroundColor: '#2a3a4a', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  ballLabel: { fontSize: 11, color: '#ccc', fontWeight: '600' },
  scoutedSection: { marginBottom: 6 },

  catchMewBtn: { backgroundColor: '#6a1b9a', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 4, marginBottom: 4 },
  catchMewBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  endTurnBtn: { backgroundColor: '#1565C0', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 6, marginBottom: 2 },
  endTurnBtnDisabled: { backgroundColor: '#1a2a3a' },
  endTurnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  endTurnTextDisabled: { color: '#555' },

  catchBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' },
  catchSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  catchTitle: { fontSize: 22, fontWeight: '800', color: '#6a1b9a', marginBottom: 4 },
  catchSub: { fontSize: 13, color: '#888', marginBottom: 16 },
  mewtwoBanner: { backgroundColor: '#f3e5f5', borderRadius: 8, padding: 8, marginBottom: 12 },
  mewtwoBannerText: { fontSize: 12, color: '#6a1b9a', fontWeight: '600' },
  ballRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#e0e0e0', marginBottom: 8 },
  ballRowSelected: { borderColor: '#6a1b9a', backgroundColor: '#f3e5f5' },
  ballInfo: { flex: 1 },
  ballName: { fontSize: 15, fontWeight: '700', color: '#222' },
  ballCount: { fontSize: 11, color: '#999', marginTop: 2 },
  ballRate: { fontSize: 20, fontWeight: '800', color: '#333' },
  ballRatePerfect: { color: '#ffd700' },
  catchConfirmBtn: { backgroundColor: '#6a1b9a', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  catchConfirmBtnDisabled: { backgroundColor: '#e0e0e0' },
  catchConfirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
