import React, { useMemo, useRef, useState } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet, Animated, I18nManager } from 'react-native';
import { FLASHCARDS, PUZZLES } from './src/data';

I18nManager.allowRTL(false);

function useFlipAnimation() {
  const anim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const rotateFront = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const rotateBack = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const flip = () => {
    const toValue = flipped ? 0 : 1;
    setFlipped(!flipped);
    Animated.spring(anim, {
      toValue,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return { flipped, rotateFront, rotateBack, flip };
}

function FlashcardsScreen() {
  const [shuffle, setShuffle] = useState(false);
  const [order, setOrder] = useState(null); // array of indices when shuffled
  const [index, setIndex] = useState(0);

  const total = FLASHCARDS.length;
  const logicalIndex = useMemo(() => {
    if (shuffle && order) return order[index];
    return index;
  }, [shuffle, order, index]);

  const card = FLASHCARDS[logicalIndex];
  const { rotateFront, rotateBack, flip } = useFlipAnimation();

  const toggleShuffle = () => {
    if (!shuffle) {
      const ord = Array.from({ length: total }, (_, i) => i);
      for (let i = ord.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ord[i], ord[j]] = [ord[j], ord[i]];
      }
      setOrder(ord);
      setIndex(0);
      setShuffle(true);
    } else {
      setShuffle(false);
      setOrder(null);
      setIndex(0);
    }
  };

  const reshuffle = () => {
    if (!shuffle) return;
    const ord = Array.from({ length: total }, (_, i) => i);
    for (let i = ord.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ord[i], ord[j]] = [ord[j], ord[i]];
    }
    setOrder(ord);
    setIndex(0);
  };

  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(total - 1, i + 1));
  const reset = () => setIndex(0);

  const progress = ((index + 1) / total) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Japanese Flashcards</Text>

        <View style={styles.toolbar}>
          <Pressable onPress={toggleShuffle} style={[styles.toggle, shuffle && styles.toggleOn]} accessibilityRole="button" accessibilityState={{ pressed: shuffle }}>
            <View style={[styles.dot, shuffle && styles.dotOn]} />
            <Text style={[styles.toggleLabel, shuffle && styles.toggleLabelOn]}>Shuffle</Text>
            <Text style={[styles.stateText, shuffle && styles.stateTextOn]}>{shuffle ? 'On' : 'Off'}</Text>
          </Pressable>
          <Pressable onPress={reshuffle} disabled={!shuffle} style={({ pressed }) => [styles.ghostBtn, !shuffle && styles.ghostDisabled, pressed && shuffle && styles.ghostPressed]}>
            <Text style={[styles.ghostText, !shuffle && styles.ghostTextDisabled]}>Reshuffle</Text>
          </Pressable>
        </View>

        <Text style={styles.instructions}>Tap card to flip</Text>

        <View style={styles.progressWrap}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>Card {index + 1} of {total}</Text>
        </View>

        <Pressable style={styles.cardWrap} onPress={flip}>
          <Animated.View style={[styles.card, { transform: [{ perspective: 1000 }, { rotateY: rotateFront }] }]}> 
            <Text style={styles.cardText}>{card.front}</Text>
          </Animated.View>
          <Animated.View style={[styles.card, styles.cardBack, { transform: [{ perspective: 1000 }, { rotateY: rotateBack }] }]}> 
            <Text style={styles.cardTextBack}>{card.back}</Text>
          </Animated.View>
        </Pressable>

        <View style={styles.controls}>
          <Pressable onPress={prev} disabled={index === 0} style={[styles.controlBtn, index === 0 && styles.controlDisabled]}>
            <Text style={[styles.controlText, index === 0 && styles.controlTextDisabled]}>← Previous</Text>
          </Pressable>
          <Pressable onPress={next} disabled={index === total - 1} style={[styles.controlBtn, index === total - 1 && styles.controlDisabled]}>
            <Text style={[styles.controlText, index === total - 1 && styles.controlTextDisabled]}>Next →</Text>
          </Pressable>
        </View>

        {index === total - 1 && (
          <Pressable onPress={reset} style={styles.resetBtn}>
            <Text style={styles.resetText}>🔄 Reset to First Card</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function shuffleArray(n) {
  const ord = Array.from({ length: n }, (_, i) => i);
  for (let i = ord.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ord[i], ord[j]] = [ord[j], ord[i]];
  }
  return ord;
}

function PuzzleScreen() {
  const total = PUZZLES.length;
  const [order, setOrder] = useState(() => shuffleArray(total));
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null); // true/false
  const [completedSet, setCompletedSet] = useState(new Set());
  const [incorrectSet, setIncorrectSet] = useState(new Set());

  const position = index + 1;
  const current = PUZZLES[order[index]];
  const completedCount = completedSet.size;
  const percent = total > 0 ? (completedCount / total) * 100 : 0;

  const choose = (choiceIdx) => {
    if (answered) return;
    const isCorrect = choiceIdx === current.answer;
    setSelected(choiceIdx);
    setAnswered(true);
    setResult(isCorrect);
    setCompletedSet(prev => {
      const next = new Set(prev);
      if (isCorrect) next.add(order[index]);
      return next;
    });
    setIncorrectSet(prev => {
      const next = new Set(prev);
      if (!isCorrect) next.add(order[index]);
      else next.delete(order[index]);
      return next;
    });
  };

  const tryAgain = () => {
    setAnswered(false);
    setSelected(null);
    setResult(null);
  };

  const next = () => {
    if (index < total - 1) {
      setIndex(i => i + 1);
      setAnswered(false);
      setSelected(null);
      setResult(null);
    }
  };

  const reset = () => {
    setOrder(shuffleArray(total));
    setIndex(0);
    setAnswered(false);
    setSelected(null);
    setResult(null);
    setCompletedSet(new Set());
    setIncorrectSet(new Set());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Puzzle Quiz</Text>

      <View style={styles.progressWrap}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Completed: {completedCount}/{total} • Question {position}
        </Text>
      </View>

      <View style={styles.puzzleBox}>
        <Text style={styles.puzzleQuestion}>{current.question}</Text>
        <View style={styles.choicesGrid}>
          {current.choices.map((c, i) => {
            const isCorrect = i === current.answer;
            const isSelected = i === selected;
            const correctStyle = answered && isCorrect ? styles.choiceCorrect : null;
            const incorrectStyle = answered && isSelected && !isCorrect ? styles.choiceIncorrect : null;
            return (
              <Pressable
                key={i}
                onPress={() => choose(i)}
                disabled={answered}
                style={({ pressed }) => [
                  styles.choiceBtn,
                  pressed && !answered && styles.choicePressed,
                  correctStyle,
                  incorrectStyle,
                ]}
              >
                <Text style={[
                  styles.choiceText,
                  (correctStyle || incorrectStyle) && styles.choiceTextOn,
                ]}>{c}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {answered && (
        <View style={styles.resultWrap}>
          <Text style={[styles.resultText, result ? styles.resultSuccess : styles.resultError]}>
            {result ? 'Correct ✅' : 'Incorrect ❌'}
          </Text>
          <View style={styles.actionRow}>
            {!result && (
              <Pressable onPress={tryAgain} style={[styles.actionBtn, styles.btnSecondary]}>
                <Text style={styles.actionBtnText}>Try Again</Text>
              </Pressable>
            )}
            {index < total - 1 && (
              <Pressable onPress={next} style={[styles.actionBtn, styles.btnPrimary]}>
                <Text style={styles.actionBtnText}>Next</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {index === total - 1 && (
        <Pressable onPress={reset} style={[styles.resetBtn, { marginTop: 16 }]}>
          <Text style={styles.resetText}>Start Over</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function App() {
  const [mode, setMode] = useState('flashcards'); // 'flashcards' | 'puzzle'
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topTabs}>
        <Pressable onPress={() => setMode('flashcards')} style={[styles.tabBtn, mode === 'flashcards' && styles.tabActive]}>
          <Text style={[styles.tabText, mode === 'flashcards' && styles.tabTextActive]}>Flashcards</Text>
        </Pressable>
        <Pressable onPress={() => setMode('puzzle')} style={[styles.tabBtn, mode === 'puzzle' && styles.tabActive]}>
          <Text style={[styles.tabText, mode === 'puzzle' && styles.tabTextActive]}>Puzzle</Text>
        </Pressable>
      </View>
      {mode === 'flashcards' ? <FlashcardsScreen /> : <PuzzleScreen />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef5ff' },
  topTabs: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingTop: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#b0bec5',
    backgroundColor: '#fff',
  },
  tabActive: { backgroundColor: '#3a7bd5', borderColor: '#3a7bd5' },
  tabText: { color: '#2d3a4b', fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#3a7bd5', marginTop: 12 },
  toolbar: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  toggle: {
    minHeight: 40,
    minWidth: 160,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#3a7bd5',
    backgroundColor: '#f8fbff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: '#3a7bd5' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8, backgroundColor: '#b0bec5' },
  dotOn: { backgroundColor: '#c8e6c9' },
  toggleLabel: { color: '#3a7bd5', fontWeight: '700', marginRight: 6 },
  toggleLabelOn: { color: '#fff' },
  stateText: { color: '#3a7bd5', opacity: 0.8, fontWeight: '600' },
  stateTextOn: { color: '#fff', opacity: 1 },
  ghostBtn: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#b0bec5',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostPressed: { backgroundColor: '#eef3f7' },
  ghostDisabled: { opacity: 0.5 },
  ghostText: { color: '#2d3a4b', fontWeight: '600' },
  ghostTextDisabled: { color: '#8d9aa5' },

  instructions: { marginTop: 10, color: '#3a7bd5' },

  progressWrap: { width: '90%', marginTop: 10, alignItems: 'center' },
  progressBar: { width: '100%', height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4CAF50' },
  progressText: { marginTop: 6, color: '#666' },

  cardWrap: {
    width: 300,
    height: 200,
    marginTop: 18,
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: '#f8fbff',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  cardBack: { backgroundColor: '#74ebd5' },
  cardText: { fontSize: 24, color: '#3a7bd5', fontWeight: '600', textAlign: 'center', paddingHorizontal: 12 },
  cardTextBack: { fontSize: 24, color: '#2d3a4b', fontWeight: '600', textAlign: 'center', paddingHorizontal: 12 },

  controls: { flexDirection: 'row', gap: 18, marginTop: 28 },
  controlBtn: { borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, backgroundColor: '#3a7bd5' },
  controlText: { color: '#fff', fontWeight: '700' },
  controlDisabled: { backgroundColor: '#b0c8ea' },
  controlTextDisabled: { color: '#eaf1fb' },

  resetBtn: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, backgroundColor: '#3a7bd5' },
  resetText: { color: '#fff', fontWeight: '700' },

  // Puzzle styles
  puzzleBox: { width: '100%', marginTop: 16 },
  puzzleQuestion: { fontSize: 18, color: '#2d3a4b', textAlign: 'center', fontWeight: '600' },
  choicesGrid: { marginTop: 16, width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  choiceBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    minWidth: '42%',
    alignItems: 'center',
  },
  choicePressed: { backgroundColor: '#f2f7ff' },
  choiceCorrect: { backgroundColor: '#4CAF50', borderColor: '#45a049' },
  choiceIncorrect: { backgroundColor: '#ff5252', borderColor: '#ff1744' },
  choiceText: { color: '#2d3a4b', fontWeight: '600' },
  choiceTextOn: { color: '#fff' },
  resultWrap: { marginTop: 14, alignItems: 'center' },
  resultText: { fontWeight: '800', fontSize: 16 },
  resultSuccess: { color: '#2e7d32' },
  resultError: { color: '#c62828' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  btnPrimary: { backgroundColor: '#2196F3' },
  btnSecondary: { backgroundColor: '#ff7043' },
  actionBtnText: { color: '#fff', fontWeight: '700' },
});
