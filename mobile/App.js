import React, { useMemo, useRef, useState } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet, Animated, I18nManager } from 'react-native';
import { FLASHCARDS } from './src/data';

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

export default function App() {
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
    <SafeAreaView style={styles.safe}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#eef5ff' },
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
});

