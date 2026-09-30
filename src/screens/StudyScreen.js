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
  { quality: 1, label: '다시', color: colors.danger, background: colors.dangerSoft, hover: '#F8D9D5', icon: 'refresh' },
  { quality: 3, label: '어려움', color: colors.warning, background: colors.warningSoft, hover: '#FFE4AB', icon: 'alert-circle-outline' },
  { quality: 4, label: '알맞음', color: colors.primary, background: colors.primarySoft, hover: colors.primarySoftHover, icon: 'check' },
  { quality: 5, label: '쉬움', color: colors.easy, background: colors.easySoft, hover: '#D5E3FC', icon: 'lightning-bolt-outline' },
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

        <Pressable
          accessibilityHint={isFlipped ? '두 번 눌러 질문을 봅니다' : '두 번 눌러 답을 확인합니다'}
          accessibilityLabel={`${isFlipped ? '답' : '질문'}: ${
            isFlipped ? currentCard.backText : currentCard.frontText
          }`}
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitting }}
          disabled={isSubmitting}
          onPress={handleFlip}
          style={styles.cardContainer}
        >
          <Animated.View
            accessibilityElementsHidden={isFlipped}
            importantForAccessibility={isFlipped ? 'no-hide-descendants' : 'yes'}
            style={[
              styles.card,
              styles.frontCard,
              { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
            ]}
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
            <View style={styles.flipHint}>
              <MaterialCommunityIcons name="gesture-tap" size={18} color={colors.subText} />
              <Text style={styles.flipHintText}>눌러서 답 확인</Text>
            </View>
          </Animated.View>

          <Animated.View
            accessibilityElementsHidden={!isFlipped}
            importantForAccessibility={!isFlipped ? 'no-hide-descendants' : 'yes'}
            style={[
              styles.card,
              styles.backCard,
              { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
            ]}
          >
            <Text style={[styles.cardSideLabel, styles.answerLabel]}>뒷면</Text>
            <ScrollView
              contentContainerStyle={styles.cardScrollContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator
              style={styles.cardScroll}
            >
              <Text style={styles.cardText}>{currentCard.backText}</Text>
            </ScrollView>
            <View style={styles.flipHint}>
              <MaterialCommunityIcons name="rotate-3d-variant" size={18} color={colors.subText} />
              <Text style={styles.flipHintText}>눌러서 질문 보기</Text>
            </View>
          </Animated.View>
        </Pressable>

        <View style={styles.ratingArea}>
          {isFlipped ? (
            <>
              <Text style={styles.ratingTitle}>얼마나 잘 기억했나요?</Text>
              <View style={styles.ratingGrid}>
                {ratingOptions.map((option) => (
                  <FeedbackPressable
                    accessibilityLabel={option.label}
                    accessibilityRole="button"
                    accessibilityState={{ busy: isSubmitting, disabled: isSubmitting }}
                    baseColor={option.background}
                    hoverColor={option.hover}
                    pressedColor={option.hover}
                    disabled={isSubmitting}
                    key={option.quality}
                    onPress={() => handleRate(option.quality)}
                    style={[styles.ratingButton, { borderColor: option.color }]}
                  >
                    <MaterialCommunityIcons name={option.icon} size={21} color={option.color} />
                    <Text style={[styles.ratingLabel, { color: option.color }]}>{option.label}</Text>
                  </FeedbackPressable>
                ))}
              </View>
            </>
          ) : null}
        </View>
      </View>
      {isSubmitting && (
        <View
          accessibilityLabel="학습 기록 저장 중"
          accessibilityLiveRegion="polite"
          style={styles.submittingOverlay}
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
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  headerCopy: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.md },
  deckTitle: { fontSize: 15, color: colors.text, fontWeight: '700' },
  progressCount: { ...type.caption, color: colors.subText, fontVariant: ['tabular-nums'] },
  headerSpacer: { width: 44 },
  progressTrack: { height: 3, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  progressFill: { height: 3, borderRadius: radius.pill, backgroundColor: colors.primary },
  cardContainer: { flex: 1, minHeight: 240, maxHeight: 430, marginTop: spacing.xxl },
  card: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    backfaceVisibility: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 5px 14px rgba(37, 35, 31, 0.06)' },
      default: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 2,
      },
    }),
  },
  frontCard: { backgroundColor: colors.surface },
  backCard: { backgroundColor: '#FFF9EB' },
  cardSideLabel: {
    position: 'absolute',
    top: spacing.xxl,
    left: spacing.xxl,
    ...type.eyebrow,
    color: colors.subText,
  },
  answerLabel: { color: colors.subText },
  cardScroll: { width: '100%', marginVertical: 48 },
  cardScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  cardText: {
    maxWidth: '92%',
    color: colors.text,
    fontSize: 27,
    lineHeight: 39,
    fontWeight: '700',
    letterSpacing: -0.45,
    textAlign: 'center',
  },
  flipHint: {
    position: 'absolute',
    bottom: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flipHintText: { ...type.caption, color: colors.subText },
  ratingArea: { minHeight: 178, paddingTop: spacing.xl },
  ratingTitle: { fontSize: 15, color: colors.text, fontWeight: '700', marginBottom: spacing.md },
  ratingGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm },
  ratingButton: {
    width: '49%',
    minHeight: 62,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  ratingLabel: { fontSize: 15, fontWeight: '700' },
  submittingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(32, 35, 31, 0.18)',
  },
});
