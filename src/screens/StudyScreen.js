import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import FeedbackPressable from '../components/FeedbackPressable';
import RequestErrorState from '../components/RequestErrorState';
import { getDueCards, gradeCard } from '../api';
import { colors, radius, spacing, type } from '../theme/color';

const ratingOptions = [
  { quality: 1, label: '다시', borderColor: colors.danger, textColor: colors.dangerText },
  { quality: 3, label: '어려움', borderColor: '#D97706', textColor: colors.warningText },
  { quality: 4, label: '알맞음', borderColor: colors.good, textColor: colors.goodText },
  { quality: 5, label: '쉬움', borderColor: colors.easy, textColor: colors.easyText },
];

export default function StudyScreen({ route, navigation }) {
  const { deckId, deckTitle = '오늘의 학습' } = route.params;
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const submitLockRef = useRef(false);

  const loadStudyCards = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getDueCards(deckId);
      setCards(data);
      setCurrentIndex(0);
    } catch (error) {
      setLoadError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudyCards();
  }, [deckId]);

  const handleFlip = () => {
    if (cards.length === 0 || isSubmitting) return;

    Animated.spring(animatedValue, {
      toValue: isFlipped ? 0 : 1,
      friction: 9,
      tension: 46,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
    setIsFlipped((current) => !current);
  };

  const handleRate = async (quality) => {
    if (submitLockRef.current) return;
    const currentCard = cards[currentIndex];
    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      await gradeCard(deckId, currentCard.id, quality);

      animatedValue.setValue(0);
      setIsFlipped(false);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex((index) => index + 1);
        return;
      }

      Alert.alert('오늘 학습 완료', `${cards.length}장의 카드를 모두 확인했어요.`, [
        { text: '마치기', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('학습 기록을 저장하지 못했어요', error.message);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        accessibilityLabel="오늘의 카드 준비 중"
        accessibilityLiveRegion="polite"
        accessibilityRole="progressbar"
        accessibilityState={{ busy: true }}
        style={styles.centered}
      >
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>오늘의 카드를 준비하고 있어요</Text>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.emptyScreen}>
        <View style={styles.emptyHeader}>
          <FeedbackPressable
            accessibilityLabel="학습 화면 닫기"
            accessibilityRole="button"
            baseColor={colors.surface}
            hoverColor={colors.surfaceHover}
            pressedColor={colors.surfacePressed}
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </FeedbackPressable>
        </View>
        <View style={styles.emptyBody}>
          <RequestErrorState error={loadError} onRetry={loadStudyCards} />
        </View>
      </SafeAreaView>
    );
  }

  if (cards.length === 0) {
    return (
      <SafeAreaView style={styles.emptyScreen}>
        <View style={styles.emptyHeader}>
          <FeedbackPressable
            accessibilityLabel="학습 화면 닫기"
            accessibilityRole="button"
            baseColor={colors.surface}
            hoverColor={colors.surfaceHover}
            pressedColor={colors.surfacePressed}
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </FeedbackPressable>
        </View>
        <View style={styles.emptyBody}>
          <EmptyState
            icon="check-circle-outline"
            title="오늘 복습은 모두 끝났어요"
            actionLabel="암기장으로 돌아가기"
            onAction={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const frontRotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <FeedbackPressable
            accessibilityLabel="학습 화면 닫기"
            accessibilityRole="button"
            baseColor={colors.surface}
            hoverColor={colors.surfaceHover}
            pressedColor={colors.surfacePressed}
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </FeedbackPressable>
          <View style={styles.headerCopy}>
            <Text accessibilityRole="header" numberOfLines={1} style={styles.deckTitle}>
              {deckTitle}
            </Text>
            <Text style={styles.progressCount}>
              {currentIndex + 1} / {cards.length}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View
          accessibilityLabel="학습 진행률"
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: cards.length,
            now: currentIndex + 1,
            text: `${currentIndex + 1} / ${cards.length}`,
          }}
          style={styles.progressTrack}
        >
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <View style={styles.cardStage}>
          <View style={styles.cardContainer} testID="study-card-container">
            <Animated.View
              testID="study-card-front"
              accessibilityElementsHidden={isFlipped}
              aria-hidden={isFlipped}
              importantForAccessibility={isFlipped ? 'no-hide-descendants' : 'yes'}
              pointerEvents={Platform.OS === 'web' ? undefined : isFlipped ? 'none' : 'auto'}
              style={[
                StyleSheet.absoluteFill,
                styles.card,
                Platform.OS === 'web' && { pointerEvents: isFlipped ? 'none' : 'auto' },
                { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
              ]}
            >
              <Pressable
                accessibilityHint="두 번 눌러 답을 확인합니다"
                accessibilityLabel={`질문: ${currentCard.frontText}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: isFlipped || isSubmitting }}
                disabled={isFlipped || isSubmitting}
                onPress={handleFlip}
                style={styles.facePressArea}
              >
                <Text style={styles.cardSideLabel}>앞면</Text>
                <ScrollView
                  contentContainerStyle={styles.cardScrollContent}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                  style={styles.cardScroll}
                >
                  <Text style={styles.cardText}>{currentCard.frontText}</Text>
                </ScrollView>
                <Text style={styles.flipHintText}>탭하여 답 보기</Text>
              </Pressable>
            </Animated.View>

            <Animated.View
              testID="study-card-back"
              accessibilityElementsHidden={!isFlipped}
              aria-hidden={!isFlipped}
              importantForAccessibility={!isFlipped ? 'no-hide-descendants' : 'yes'}
              pointerEvents={Platform.OS === 'web' ? undefined : isFlipped ? 'auto' : 'none'}
              style={[
                StyleSheet.absoluteFill,
                styles.card,
                Platform.OS === 'web' && { pointerEvents: isFlipped ? 'auto' : 'none' },
                { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
              ]}
            >
              <Pressable
                accessibilityHint="두 번 눌러 질문을 봅니다"
                accessibilityLabel={`답: ${currentCard.backText}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: !isFlipped || isSubmitting }}
                disabled={!isFlipped || isSubmitting}
                onPress={handleFlip}
                style={styles.facePressArea}
              >
                <Text style={styles.cardSideLabel}>뒷면</Text>
                <ScrollView
                  contentContainerStyle={styles.cardScrollContent}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                  style={styles.cardScroll}
                >
                  <Text style={styles.cardText}>{currentCard.backText}</Text>
                </ScrollView>
                <Text style={styles.flipHintText}>탭하여 질문 보기</Text>
              </Pressable>
              <View style={styles.ratingSection}>
                <Text style={styles.ratingTitle}>기억 정도</Text>
                <View style={styles.ratingGrid}>
                  {ratingOptions.map((option) => (
                    <FeedbackPressable
                      accessibilityLabel={option.label}
                      accessibilityRole="button"
                      accessibilityState={{ busy: isSubmitting, disabled: !isFlipped || isSubmitting }}
                      baseColor={colors.surface}
                      hoverColor={colors.surfaceHover}
                      pressedColor={colors.surfacePressed}
                      disabled={!isFlipped || isSubmitting}
                      key={option.quality}
                      onPress={() => handleRate(option.quality)}
                      style={[styles.ratingButton, { borderColor: option.borderColor }]}
                    >
                      <Text style={[styles.ratingLabel, { color: option.textColor }]}>{option.label}</Text>
                    </FeedbackPressable>
                  ))}
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
      </View>
      {isSubmitting && (
        <View
          accessibilityLabel="학습 기록 저장 중"
          accessibilityLiveRegion="polite"
          style={[StyleSheet.absoluteFill, styles.submittingOverlay]}
        >
          <ActivityIndicator color={colors.surface} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  loadingText: { ...type.body, color: colors.subText },
  emptyScreen: { flex: 1, backgroundColor: colors.background },
  emptyHeader: { height: 64, justifyContent: 'center', paddingHorizontal: spacing.xl },
  emptyBody: { flex: 1, justifyContent: 'center' },
  header: { height: 64, flexDirection: 'row', alignItems: 'center' },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  headerCopy: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.md },
  deckTitle: { fontSize: 15, color: colors.text, fontWeight: '700' },
  progressCount: { ...type.caption, color: colors.subText, fontVariant: ['tabular-nums'] },
  headerSpacer: { width: 44 },
  progressTrack: { height: 3, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  progressFill: { height: 3, borderRadius: radius.pill, backgroundColor: colors.primary },
  cardStage: { flex: 1, justifyContent: 'center', paddingVertical: spacing.lg },
  cardContainer: { flex: 1, width: '100%', maxHeight: 560 },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    backfaceVisibility: 'hidden',
  },
  facePressArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cardSideLabel: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.xl,
    ...type.caption,
    fontWeight: '600',
    color: colors.subText,
  },
  cardScroll: { flex: 1, width: '100%', marginTop: 48, marginBottom: 48 },
  cardScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  cardText: {
    maxWidth: '92%',
    color: colors.text,
    fontSize: 28,
    lineHeight: 40,
    fontWeight: '600',
    letterSpacing: -0.45,
    textAlign: 'center',
  },
  flipHintText: { ...type.caption, color: colors.subText, position: 'absolute', bottom: spacing.xl },
  ratingSection: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ratingTitle: { fontSize: 14, lineHeight: 20, color: colors.subText, marginBottom: spacing.sm },
  ratingGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm },
  ratingButton: {
    width: '49%',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
  },
  ratingLabel: { fontSize: 15, fontWeight: '600' },
  submittingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(32, 35, 31, 0.18)',
  },
});
