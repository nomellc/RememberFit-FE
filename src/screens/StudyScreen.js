import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import RequestErrorState from '../components/RequestErrorState';
import { getDueCards, gradeCard } from '../api';
import { colors, radius, shadow, spacing, type } from '../theme/color';

const ratingOptions = [
  { quality: 1, label: '다시', caption: '아직 낯설어요', color: colors.dangerSoft, textColor: colors.danger },
  { quality: 3, label: '어려움', caption: '조금 헷갈려요', color: colors.warningSoft, textColor: colors.warning },
  { quality: 4, label: '알맞음', caption: '기억이 났어요', color: colors.primarySoft, textColor: colors.primary },
  { quality: 5, label: '쉬움', caption: '바로 떠올랐어요', color: colors.success, textColor: colors.surface },
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
      useNativeDriver: true,
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
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>오늘의 카드를 준비하고 있어요</Text>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.emptyScreen}>
        <View style={styles.emptyHeader}>
          <TouchableOpacity
            accessibilityLabel="학습 화면 닫기"
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
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
          <TouchableOpacity
            accessibilityLabel="학습 화면 닫기"
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyBody}>
          <EmptyState
            icon="check-circle-outline"
            title="오늘 복습은 모두 끝났어요"
            description="다음 복습 일정이 생기면 이곳에서 다시 만날 수 있어요."
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
          <TouchableOpacity
            accessibilityLabel="학습 화면 닫기"
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text numberOfLines={1} style={styles.deckTitle}>
              {deckTitle}
            </Text>
            <Text style={styles.progressCount}>
              {currentIndex + 1} / {cards.length}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <View style={styles.promptRow}>
          <Text style={styles.promptEyebrow}>{isFlipped ? 'ANSWER' : 'QUESTION'}</Text>
          <Text style={styles.promptHint}>{isFlipped ? '기억과 비교해보세요' : '먼저 답을 떠올려보세요'}</Text>
        </View>

        <Pressable
          accessibilityHint="카드의 앞면과 뒷면을 전환합니다"
          accessibilityRole="button"
          onPress={handleFlip}
          style={styles.cardContainer}
        >
          <Animated.View
            style={[
              styles.card,
              styles.frontCard,
              { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
            ]}
          >
            <View style={styles.cardCorner} />
            <Text style={styles.cardSideLabel}>앞면</Text>
            <Text style={styles.cardText}>{currentCard.frontText}</Text>
            <View style={styles.flipHint}>
              <MaterialCommunityIcons name="gesture-tap" size={18} color={colors.subText} />
              <Text style={styles.flipHintText}>눌러서 답 확인</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.backCard,
              { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
            ]}
          >
            <View style={[styles.cardCorner, styles.answerCorner]} />
            <Text style={[styles.cardSideLabel, styles.answerLabel]}>뒷면</Text>
            <Text style={styles.cardText}>{currentCard.backText}</Text>
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
                  <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.78}
                    disabled={isSubmitting}
                    key={option.quality}
                    onPress={() => handleRate(option.quality)}
                    style={[styles.ratingButton, { backgroundColor: option.color }]}
                  >
                    <Text style={[styles.ratingLabel, { color: option.textColor }]}>{option.label}</Text>
                    <Text style={[styles.ratingCaption, { color: option.textColor }]}>{option.caption}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.recallNote}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color={colors.warning} />
              <Text style={styles.recallText}>소리 내어 답한 뒤 카드를 뒤집으면 더 오래 기억할 수 있어요.</Text>
            </View>
          )}
        </View>
      </View>
      {isSubmitting && (
        <View style={styles.submittingOverlay}>
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
    width: 42,
    height: 42,
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
  headerSpacer: { width: 42 },
  progressTrack: { height: 3, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  progressFill: { height: 3, borderRadius: radius.pill, backgroundColor: colors.primary },
  promptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  promptEyebrow: { ...type.eyebrow, color: colors.primary },
  promptHint: { ...type.caption, color: colors.subText },
  cardContainer: { flex: 1, minHeight: 300, maxHeight: 430 },
  card: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    backfaceVisibility: 'hidden',
    ...shadow.card,
  },
  frontCard: { backgroundColor: colors.surface },
  backCard: { backgroundColor: '#F8F3E8' },
  cardCorner: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    right: -24,
    top: -24,
  },
  answerCorner: { backgroundColor: colors.accentSoft },
  cardSideLabel: {
    position: 'absolute',
    top: spacing.xxl,
    left: spacing.xxl,
    ...type.eyebrow,
    color: colors.primary,
  },
  answerLabel: { color: colors.warning },
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
    minHeight: 58,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  ratingLabel: { fontSize: 14, fontWeight: '800' },
  ratingCaption: { fontSize: 11, marginTop: 2, opacity: 0.86 },
  recallNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
  recallText: { flex: 1, ...type.caption, color: colors.text },
  submittingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(32, 35, 31, 0.18)',
  },
});
