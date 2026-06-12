import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useGameStore } from '../store/useGameStore';
import { currentPlayer, trainerPoints, canCatchMew, hasLegalMove } from '../store/selectors';
import { canAddToken, isSelectionValid, TokenSelection } from '../store/tokenSelection';
import {
  EvolutionTier, PokemonCard, PokeballTier, TokenType,
} from '../types/game';
import {
  PLAYER_COLORS, PHASE, SCOUT_HAND_LIMIT,
  BASE_CATCH_RATES, MEWTWO_CATCH_BONUS, MEWTWO_POKEDEX_NUMBER, FACE_UP_COUNT,
} from '../constants';
import { useTheme } from '../theme/ThemeContext';
import { useToast } from '../components/Toast';
import { useBoardScale } from '../components/board/useBoardScale';
import TopBar from '../components/board/TopBar';
import DeckRail from '../components/board/DeckRail';
import BoardCard from '../components/board/BoardCard';
import SupplyColumn from '../components/board/SupplyColumn';
import LegendariesColumn from '../components/board/LegendariesColumn';
import Dock from '../components/board/Dock';
import TokenDiscardModal from '../components/TokenDiscardModal';
import CardDetailModal from '../components/CardDetailModal';
import { getGreedyMove } from '../ai/greedy';
import { getHeuristicMove } from '../ai/heuristic';
import { getAIDiscard } from '../ai/utils';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GameBoard'>;
};

const BALL_ORDER: PokeballTier[] = ['Pokeball', 'GreatBall', 'UltraBall', 'MasterBall'];
const BALL_LABELS: Record<PokeballTier, string> = {
  Pokeball: 'Pokeball', GreatBall: 'Great Ball', UltraBall: 'Ultra Ball', MasterBall: 'Master Ball',
};

export default function GameBoardScreen({ navigation }: Props) {
  const game = useGameStore(s => s.game);
  const advanceTurn = useGameStore(s => s.advanceTurn);
  const acknowledgeHandoff = useGameStore(s => s.acknowledgeHandoff);
  const takeTokens = useGameStore(s => s.takeTokens);
  const trainCard = useGameStore(s => s.trainCard);
  const scoutFaceUp = useGameStore(s => s.scoutFaceUp);
  const scoutFromDeck = useGameStore(s => s.scoutFromDeck);
  const catchMew = useGameStore(s => s.catchMew);

  const { theme } = useTheme();
  const toast = useToast();
  const scale = useBoardScale();
  const z = (n: number) => n * scale;

  const [tokenSelection, setTokenSelection] = useState<TokenSelection>({});
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [selectedCardSource, setSelectedCardSource] = useState<'face' | 'scouted' | null>(null);
  const [catchModalVisible, setCatchModalVisible] = useState(false);
  const [selectedBall, setSelectedBall] = useState<PokeballTier | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (game?.phase === PHASE.GAME_OVER) {
      navigation.replace('GameOver');
    }
  }, [game?.phase, navigation]);

  useEffect(() => {
    setTokenSelection({});
    setSelectedBall(null);
    setCatchModalVisible(false);
  }, [game?.currentPlayerIndex, game?.turnNumber]);

  // AI turn trigger
  useEffect(() => {
    if (!game) return;
    const player = currentPlayer(game);
    if (!player.isAI || game.pendingHandoff || game.phase === PHASE.GAME_OVER || game.actionTakenThisTurn) return;
    if (aiTimerRef.current !== null) return; // already scheduled for this turn

    setAiThinking(true);
    aiTimerRef.current = setTimeout(() => {
      aiTimerRef.current = null;
      const store = useGameStore.getState();
      const g = store.game;
      if (!g) { setAiThinking(false); return; }

      const difficulty = g.config.aiDifficulty ?? 'greedy';
      const getMove = difficulty === 'heuristic' ? getHeuristicMove : getGreedyMove;

      try {
        const action = getMove(g);
        store.dispatchAction(action);
      } catch (e) {
        // The AI passes when stuck, so reaching here means an AI bug — surface it
        console.warn('AI move failed:', e);
      }

      // Auto-discard if needed
      const afterAction = useGameStore.getState().game;
      if (afterAction?.phase === PHASE.DISCARDING) {
        const aiPlayer = currentPlayer(afterAction);
        const discard = getAIDiscard(aiPlayer);
        try { store.discardTokens(discard); } catch { /* discard error */ }
      }

      // Advance turn
      const afterDiscard = useGameStore.getState().game;
      if (afterDiscard && afterDiscard.phase !== PHASE.GAME_OVER) {
        try { store.advanceTurn(); } catch { /* advance error */ }
      }

      setAiThinking(false);
    }, 1200);

    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
        aiTimerRef.current = null;
      }
    };
  }, [game?.currentPlayerIndex, game?.turnNumber]);

  if (!game) {
    return (
      <View style={[s.center, { backgroundColor: theme.bezel }]}>
        <Text style={s.centerText}>No game in progress.</Text>
      </View>
    );
  }

  const player = currentPlayer(game);
  const playerColor = PLAYER_COLORS[game.currentPlayerIndex] ?? '#888';

  if (aiThinking || (player.isAI && !game.actionTakenThisTurn && game.phase !== PHASE.GAME_OVER)) {
    return (
      <View style={s.aiThinking}>
        <ActivityIndicator size="large" color={playerColor} />
        <Text style={[s.aiThinkingName, { color: playerColor }]}>{player.name}</Text>
        <Text style={s.aiThinkingText}>is thinking...</Text>
      </View>
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

  const actionAvailable = !game.actionTakenThisTurn &&
    game.phase !== PHASE.DISCARDING &&
    game.phase !== PHASE.GAME_OVER;
  const canEndTurn = game.actionTakenThisTurn && game.phase !== PHASE.DISCARDING;
  // Allow End Turn to trigger the forced pass when the player has no legal move
  const endTurnEnabled = canEndTurn || (!game.actionTakenThisTurn && !hasLegalMove(game));

  const selectionTotal = Object.values(tokenSelection).reduce<number>((acc, n) => acc + (n ?? 0), 0);

  // ── Token selection ──

  function handleTokenTap(type: TokenType) {
    if (game!.phase === PHASE.DISCARDING) return;
    if (game!.actionTakenThisTurn) { toast('You already acted this turn'); return; }
    if (type === 'Ditto') { toast('Ditto is earned by Scouting'); return; }
    if (!canAddToken(game!.board.energySupply, tokenSelection, type)) {
      toast('Take 3 different, or 2 of one (4+ in supply)');
      return;
    }
    setTokenSelection(prev => ({ ...prev, [type]: (prev[type] ?? 0) + 1 }));
  }

  function handleConfirmTokens() {
    try {
      takeTokens(tokenSelection);
      setTokenSelection({});
      toast('Took energy');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : String(e));
    }
  }

  // ── Card actions ──

  function handleCardPress(card: PokemonCard, source: 'face' | 'scouted') {
    setSelectedCard(card);
    setSelectedCardSource(source);
  }

  function closeDetail() {
    setSelectedCard(null);
    setSelectedCardSource(null);
  }

  function handleTrain(card: PokemonCard) {
    const legNamesBefore = game!.board.availableLegendaries.map(l => l.name);
    try {
      trainCard(card);
      closeDetail();
      const newGame = useGameStore.getState().game;
      const claimed = newGame
        ? legNamesBefore.filter(name => !newGame.board.availableLegendaries.some(l => l.name === name))
        : [];
      toast(claimed.length > 0
        ? `${claimed.join(' and ')} joined your team!`
        : `Trained ${card.name}`);
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : String(e));
    }
  }

  function handleScoutFaceUp(card: PokemonCard) {
    try {
      scoutFaceUp(card);
      closeDetail();
      toast(`Scouted ${card.name} — added to your hand`);
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : String(e));
    }
  }

  function handleDeckPress(tier: EvolutionTier) {
    if (!actionAvailable) { toast('You already acted this turn'); return; }
    if (player.scoutedCards.length >= SCOUT_HAND_LIMIT) {
      toast('Scout hand is full (3)');
      return;
    }
    try {
      scoutFromDeck(tier);
      toast('Scouted from the deck — added to your hand');
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : String(e));
    }
  }

  function handleEndTurn() {
    try {
      const store = useGameStore.getState();
      const g = store.game!;
      if (!g.actionTakenThisTurn && !hasLegalMove(g)) {
        store.passTurn();
        toast('No legal moves — turn passed');
      }
      advanceTurn();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : String(e));
    }
  }

  // ── Catch Mew ──

  const mewOnBoard = game.board.mew;
  const mewEligible = mewOnBoard !== null && canCatchMew(player, mewOnBoard) && actionAvailable;
  const mewCatcher = mewOnBoard ? null : game.players.find(p => p.mythical) ?? null;
  const hasMewtwo = player.legendaries.some(l => l.pokedexNumber === MEWTWO_POKEDEX_NUMBER);
  const availableBalls = (Object.entries(player.pokeballs) as [PokeballTier, number][])
    .filter(([, n]) => n > 0)
    .sort(([a], [b]) => BALL_ORDER.indexOf(a) - BALL_ORDER.indexOf(b));

  function handleMewPress() {
    if (!mewOnBoard) return;
    if (mewEligible) { setCatchModalVisible(true); return; }
    if (!actionAvailable) { toast('You already acted this turn'); return; }
    toast(`Mew needs ${mewOnBoard.legendariesRequired} Legendaries + a Poké Ball`);
  }

  function handleCatchMew() {
    if (!selectedBall) return;
    const ball = selectedBall;
    try {
      const caught = catchMew(ball);
      setCatchModalVisible(false);
      setSelectedBall(null);
      toast(caught
        ? 'Mew caught! +5 Trainer Points!'
        : `The ${BALL_LABELS[ball]} was spent — Mew escaped`);
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : String(e));
    }
  }

  // ── Layout ──

  const rows = [
    { tier: 3 as const, label: 'Stage 2', face: game.board.tier3Face, deckCount: game.board.tier3Deck.length },
    { tier: 2 as const, label: 'Stage 1', face: game.board.tier2Face, deckCount: game.board.tier2Deck.length },
    { tier: 1 as const, label: 'Basic', face: game.board.tier1Face, deckCount: game.board.tier1Deck.length },
  ];

  return (
    <LinearGradient colors={theme.appBg} style={{ flex: 1 }}>
      <TopBar
        game={game}
        scale={scale}
        onMewPress={handleMewPress}
        onHome={() => navigation.navigate('Home')}
      />

      <View style={{ flex: 1, flexDirection: 'row', gap: z(9), paddingVertical: z(8), paddingHorizontal: z(12), minHeight: 0 }}>
        <DeckRail
          rows={rows.map(({ tier, label, deckCount }) => ({ tier, label, deckCount }))}
          scale={scale}
          onDeckPress={handleDeckPress}
        />
        <View style={{ flex: 1, justifyContent: 'center', gap: z(6) }}>
          {rows.map(row => (
            <View key={row.tier} style={{ flexDirection: 'row', gap: z(7), justifyContent: 'center' }}>
              {row.face.map(card => (
                <BoardCard
                  key={card.pokedexNumber}
                  card={card}
                  scale={scale}
                  onPress={() => handleCardPress(card, 'face')}
                />
              ))}
              {Array.from({ length: FACE_UP_COUNT - row.face.length }).map((_, i) => (
                <View key={`empty-${i}`} style={{
                  width: z(78), height: z(90), borderRadius: z(11),
                  borderWidth: 2, borderStyle: 'dashed', borderColor: theme.ring2,
                  backgroundColor: theme.surface, opacity: 0.4,
                }} />
              ))}
            </View>
          ))}
        </View>
        <SupplyColumn
          supply={game.board.energySupply}
          selection={tokenSelection}
          scale={scale}
          onTokenTap={handleTokenTap}
        />
        <LegendariesColumn
          legendaries={game.board.availableLegendaries}
          mew={mewOnBoard}
          mewCatcher={mewCatcher}
          scale={scale}
          onMewPress={handleMewPress}
        />
      </View>

      <Dock
        game={game}
        scale={scale}
        selecting={selectionTotal > 0}
        selectionTotal={selectionTotal}
        selectionValid={isSelectionValid(game.board.energySupply, tokenSelection)}
        onClear={() => setTokenSelection({})}
        onTake={handleConfirmTokens}
        onEndTurn={handleEndTurn}
        endTurnEnabled={endTurnEnabled}
        mewEligible={mewEligible}
        onCatchMew={() => setCatchModalVisible(true)}
        onScoutedPress={card => handleCardPress(card, 'scouted')}
      />

      <CardDetailModal
        card={selectedCard}
        source={selectedCardSource}
        player={player}
        actionTakenThisTurn={game.actionTakenThisTurn}
        dittoInSupply={game.board.energySupply.Ditto > 0}
        scale={scale}
        onClose={closeDetail}
        onTrain={handleTrain}
        onScout={handleScoutFaceUp}
      />

      <TokenDiscardModal />

      {/* Catch Mew modal — full prototype flow lands with issue #26 */}
      <Modal visible={catchModalVisible} transparent animationType="slide" onRequestClose={() => { setCatchModalVisible(false); setSelectedBall(null); }}>
        <View style={s.catchBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => { setCatchModalVisible(false); setSelectedBall(null); }} />
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
    </LinearGradient>
  );
}

// ── Styles (interstitials + catch modal keep their pre-redesign look until #26/#28) ──

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerText: { color: '#aaa', fontSize: 16 },

  aiThinking: { flex: 1, backgroundColor: '#0d1b2a', alignItems: 'center', justifyContent: 'center', gap: 12 },
  aiThinkingName: { fontSize: 28, fontWeight: '800' },
  aiThinkingText: { fontSize: 16, color: '#aaa' },

  handoff: { flex: 1, backgroundColor: '#0d1b2a', alignItems: 'center', justifyContent: 'center', padding: 32 },
  handoffPrompt: { fontSize: 20, color: '#aaa', marginBottom: 8 },
  handoffName: { fontSize: 32, fontWeight: '800', marginBottom: 48 },
  handoffBtn: { borderWidth: 2, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48 },
  handoffBtnText: { fontSize: 17, fontWeight: '600' },

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
