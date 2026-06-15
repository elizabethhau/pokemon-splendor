import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useGameStore } from '../store/useGameStore';
import { currentPlayer, canCatchMew, hasLegalMove } from '../store/selectors';
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
import AIThinkingPill from '../components/board/AIThinkingPill';
import AIMoveFly, { Rect } from '../components/board/AIMoveFly';
import { AI_AVATAR_DEX } from '../components/board/util';
import { formatAIMove, AIMoveOutcome } from '../ai/aiMoveSummary';
import TokenDiscardModal from '../components/TokenDiscardModal';
import CardDetailModal from '../components/CardDetailModal';
import CatchMewModal, { CatchBall, CatchPhase } from '../components/CatchMewModal';
import ScoutedHandModal from '../components/ScoutedHandModal';
import ConfirmModal, { ConfirmRequest } from '../components/ConfirmModal';
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

// Mew wiggles for this long before the catch resolves
const CATCH_THROW_MS = 1300;

// AI turn pacing — the think delay also spaces out consecutive AI rivals
const AI_THINK_MS = 900;
const AI_SETTLE_MS = 750; // > FLY_MS so the card-fly finishes before the turn advances

// Wraps a board card so its on-screen rect can be measured for the AI move-fly
function MeasuredCard({ card, scale, onPress, register }: {
  card: PokemonCard;
  scale: number;
  onPress: () => void;
  register: (dex: number, node: View | null) => void;
}) {
  const ref = useRef<View>(null);
  return (
    <View ref={ref} collapsable={false} onLayout={() => register(card.pokedexNumber, ref.current)}>
      <BoardCard card={card} scale={scale} onPress={onPress} />
    </View>
  );
}

export default function GameBoardScreen({ navigation }: Props) {
  const game = useGameStore(s => s.game);
  const advanceTurn = useGameStore(s => s.advanceTurn);
  const acknowledgeHandoff = useGameStore(s => s.acknowledgeHandoff);
  const takeTokens = useGameStore(s => s.takeTokens);
  const trainCard = useGameStore(s => s.trainCard);
  const scoutFaceUp = useGameStore(s => s.scoutFaceUp);
  const scoutFromDeck = useGameStore(s => s.scoutFromDeck);
  const catchMew = useGameStore(s => s.catchMew);
  const undoAction = useGameStore(s => s.undoAction);
  const undoSnapshot = useGameStore(s => s.undoSnapshot);

  const { theme } = useTheme();
  const toast = useToast();
  const scale = useBoardScale();
  const z = (n: number) => n * scale;

  const [tokenSelection, setTokenSelection] = useState<TokenSelection>({});
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [selectedCardSource, setSelectedCardSource] = useState<'face' | 'scouted' | null>(null);
  const [catchModalVisible, setCatchModalVisible] = useState(false);
  const [selectedBall, setSelectedBall] = useState<PokeballTier | null>(null);
  const [catchPhase, setCatchPhase] = useState<CatchPhase>('select');
  const [catchResult, setCatchResult] = useState(false);
  const [handVisible, setHandVisible] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [aiThinking, setAiThinking] = useState<{ name: string; color: string; avatarDex: number } | null>(null);
  const [aiFly, setAiFly] = useState<{ card: PokemonCard; from: Rect; to: { x: number; y: number } } | null>(null);
  const [aiPulse, setAiPulse] = useState<{ tokens: Partial<Record<TokenType, number>>; key: number } | null>(null);
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardNodes = useRef<Map<number, View>>(new Map());
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const registerCardNode = useCallback((dex: number, node: View | null) => {
    if (node) cardNodes.current.set(dex, node);
  }, []);

  useEffect(() => {
    if (game?.phase === PHASE.GAME_OVER) {
      navigation.replace('GameOver');
    }
  }, [game?.phase, navigation]);

  useEffect(() => {
    setTokenSelection({});
    setSelectedBall(null);
    setCatchModalVisible(false);
    setCatchPhase('select');
    setCatchResult(false);
    setHandVisible(false);
  }, [game?.currentPlayerIndex, game?.turnNumber]);

  // AI turn: think (board visible) → act on the board with a summary toast → pause → advance.
  // Consecutive AI rivals chain through this effect re-firing per turn, so the think
  // delay doubles as readable pacing between them.
  useEffect(() => {
    if (!game) return;
    const player = currentPlayer(game);
    if (!player.isAI || game.pendingHandoff || game.phase === PHASE.GAME_OVER || game.actionTakenThisTurn) return;
    if (aiTimerRef.current !== null) return; // already scheduled for this turn

    const idx = game.currentPlayerIndex;
    setAiThinking({
      name: player.name,
      color: PLAYER_COLORS[idx] ?? '#888',
      avatarDex: AI_AVATAR_DEX[Math.max(0, idx - 1) % AI_AVATAR_DEX.length],
    });

    aiTimerRef.current = setTimeout(() => {
      const store = useGameStore.getState();
      const g = store.game;
      if (!g) { aiTimerRef.current = null; setAiThinking(null); return; }

      const difficulty = g.config.aiDifficulty ?? 'greedy';
      const getMove = difficulty === 'heuristic' ? getHeuristicMove : getGreedyMove;
      const rivalName = currentPlayer(g).name;

      let outcome: AIMoveOutcome = { kind: 'pass' };
      try {
        const action = getMove(g);

        // Capture the source card's on-screen rect before dispatch so the fly
        // starts from its slot (the slot refills underneath the floating clone).
        if (action.type === 'trainCard' || action.type === 'scoutFaceUp') {
          const node = cardNodes.current.get(action.card.pokedexNumber);
          const card = action.card;
          const winH = Dimensions.get('window').height;
          const flyTurn = g.turnNumber;
          node?.measureInWindow((x, y, w, h) => {
            // Ignore a late callback that resolves after the turn advanced or the screen unmounted
            if (w <= 0 || !mountedRef.current || useGameStore.getState().game?.turnNumber !== flyTurn) return;
            setAiFly({ card, from: { x, y, width: w, height: h }, to: { x: z(14), y: winH - z(58) } });
          });
        }

        const legNamesBefore = g.board.availableLegendaries.map(l => l.name);
        const result = store.dispatchAction(action);
        const after = useGameStore.getState().game;

        switch (action.type) {
          case 'takeTokens':
            setAiPulse({ tokens: action.tokens, key: Date.now() });
            outcome = { kind: 'takeTokens', tokens: action.tokens };
            break;
          case 'trainCard': {
            const claimed = after
              ? legNamesBefore.filter(n => !after.board.availableLegendaries.some(l => l.name === n))
              : [];
            outcome = { kind: 'trainCard', cardName: action.card.name, claimedLegendaries: claimed };
            break;
          }
          case 'scoutFaceUp':   outcome = { kind: 'scoutFaceUp', cardName: action.card.name }; break;
          case 'scoutFromDeck': outcome = { kind: 'scoutFromDeck', tier: action.tier }; break;
          case 'catchMew':      outcome = { kind: 'catchMew', caught: result }; break;
          case 'pass':          outcome = { kind: 'pass' }; break;
        }
      } catch (e) {
        // The AI passes when stuck, so reaching here means an AI bug — surface it
        console.warn('AI move failed:', e);
      }

      setAiThinking(null);
      toast(formatAIMove(rivalName, outcome));

      // Let the move animation play, then commit the turn.
      aiTimerRef.current = setTimeout(() => {
        aiTimerRef.current = null;
        setAiFly(null);

        const afterAction = useGameStore.getState().game;
        if (afterAction && afterAction.phase !== PHASE.GAME_OVER) {
          try { store.advanceTurn(); } catch { /* advance error */ }
        }

        // If End Turn entered the discard phase, the AI discards and commits again
        const afterAdvance = useGameStore.getState().game;
        if (afterAdvance?.phase === PHASE.DISCARDING) {
          const aiPlayer = currentPlayer(afterAdvance);
          try {
            store.discardTokens(getAIDiscard(aiPlayer));
            store.advanceTurn();
          } catch { /* discard error */ }
        }
      }, AI_SETTLE_MS);
    }, AI_THINK_MS);

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
  // AI turns now play out on the board; this overlay blocks human input while they do.
  const aiActive = player.isAI && game.phase !== PHASE.GAME_OVER && !game.pendingHandoff;

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
    setConfirm({
      title: 'Scout from the deck?',
      message: 'You’ll draw the top card face-down into your hand. Because only you get to see it, this move can’t be undone.',
      confirmLabel: 'Scout blind',
      onProceed: () => {
        try {
          scoutFromDeck(tier);
          toast('Scouted from the deck — added to your hand');
        } catch (e: unknown) {
          toast(e instanceof Error ? e.message : String(e));
        }
      },
    });
  }

  function handleUndo() {
    try {
      undoAction();
      setTokenSelection({});
      toast('Action undone · choose again');
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
  const ballPct = (ball: PokeballTier) =>
    Math.round(Math.min(1, BASE_CATCH_RATES[ball] + (hasMewtwo ? MEWTWO_CATCH_BONUS : 0)) * 100);
  const catchBalls: CatchBall[] = (Object.entries(player.pokeballs) as [PokeballTier, number][])
    .filter(([, n]) => n > 0)
    .sort(([a], [b]) => BALL_ORDER.indexOf(a) - BALL_ORDER.indexOf(b))
    .map(([ball, count]) => ({ tier: ball, count, pct: ballPct(ball) }));

  function openCatch() {
    setSelectedBall(null);
    setCatchResult(false);
    setCatchPhase('select');
    setCatchModalVisible(true);
  }

  function closeCatch() {
    setCatchModalVisible(false);
    setSelectedBall(null);
    setCatchPhase('select');
    setCatchResult(false);
  }

  function handleMewPress() {
    if (!mewOnBoard) return;
    if (mewEligible) { openCatch(); return; }
    if (!actionAvailable) { toast('You already acted this turn'); return; }
    toast(`Mew needs ${mewOnBoard.legendariesRequired} Legendaries + a Poké Ball`);
  }

  // Confirm gate → throwing (Mew wiggles) → resolve via the engine → in-modal result.
  function handleThrowPress() {
    if (!selectedBall) return;
    const ball = selectedBall;
    setConfirm({
      title: `Throw your ${BALL_LABELS[ball]}?`,
      message: `Catch chance is ${ballPct(ball)}%. Win or lose, this uses your turn and the ball — it can’t be undone.`,
      confirmLabel: 'Throw it!',
      onProceed: () => {
        setCatchPhase('throwing');
        setTimeout(() => {
          if (!mountedRef.current) return;
          try {
            const caught = catchMew(ball);
            setCatchResult(caught);
            setCatchPhase('result');
          } catch (e: unknown) {
            closeCatch();
            toast(e instanceof Error ? e.message : String(e));
          }
        }, CATCH_THROW_MS);
      },
    });
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
                <MeasuredCard
                  key={card.pokedexNumber}
                  card={card}
                  scale={scale}
                  onPress={() => handleCardPress(card, 'face')}
                  register={registerCardNode}
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
          pulse={aiPulse?.tokens}
          pulseKey={aiPulse?.key}
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
        onCatchMew={openCatch}
        onOpenHand={() => setHandVisible(true)}
        canUndo={undoSnapshot !== null}
        onUndo={handleUndo}
        showActions={!aiActive}
      />

      {aiActive && <View style={StyleSheet.absoluteFill} pointerEvents="auto" />}
      {aiFly && <AIMoveFly card={aiFly.card} from={aiFly.from} to={aiFly.to} scale={scale} />}
      {aiThinking && (
        <AIThinkingPill
          name={aiThinking.name}
          color={aiThinking.color}
          avatarDex={aiThinking.avatarDex}
          scale={scale}
        />
      )}

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

      <ScoutedHandModal
        visible={handVisible}
        player={player}
        scale={scale}
        onClose={() => setHandVisible(false)}
        onCardPress={card => { setHandVisible(false); handleCardPress(card, 'scouted'); }}
      />

      <CatchMewModal
        visible={catchModalVisible}
        phase={catchPhase}
        caught={catchResult}
        selectedBall={selectedBall}
        balls={catchBalls}
        scale={scale}
        onPickBall={setSelectedBall}
        onThrow={handleThrowPress}
        onClose={closeCatch}
      />

      {/* After the catch modal so the confirm gate paints above it (equal zIndex). */}
      <ConfirmModal request={confirm} scale={scale} onClose={() => setConfirm(null)} />

      <TokenDiscardModal />
    </LinearGradient>
  );
}

// ── Styles (handoff interstitial keeps its pre-redesign look until #29) ──

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerText: { color: '#aaa', fontSize: 16 },

  handoff: { flex: 1, backgroundColor: '#0d1b2a', alignItems: 'center', justifyContent: 'center', padding: 32 },
  handoffPrompt: { fontSize: 20, color: '#aaa', marginBottom: 8 },
  handoffName: { fontSize: 32, fontWeight: '800', marginBottom: 48 },
  handoffBtn: { borderWidth: 2, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48 },
  handoffBtnText: { fontSize: 17, fontWeight: '600' },
});
