import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BrandMark from '../components/BrandMark';
import EmptyState from '../components/EmptyState';
import FeedbackPressable from '../components/FeedbackPressable';
import RequestErrorState from '../components/RequestErrorState';
import { getDecks, getStudyStatistics } from '../api';
import { colors, radius, spacing, type } from '../theme/color';

const EMPTY_STATS = { newCount: 0, reviewCount: 0, doneCount: 0 };

function StatItem({ value, label, tone, last }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label} ${value}장`}
      style={[styles.statItem, !last && styles.statDivider]}
    >
      <Text style={[styles.statValue, { color: tone }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [recentDecks, setRecentDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      }).format(new Date()),
    []
  );

  const loadData = async ({ refreshing = false } = {}) => {
    refreshing ? setIsRefreshing(true) : setIsLoading(true);
    setLoadError(null);
    try {
      const [statData, decks] = await Promise.all([getStudyStatistics(), getDecks()]);
      setStats(statData || EMPTY_STATS);
      setRecentDecks(decks.slice(0, 3));
    } catch (error) {
      setLoadError(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const reviewCount = stats.reviewCount || 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadData({ refreshing: true })}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <BrandMark />
          <Text style={styles.brandName}>REMEMBERFIT</Text>
        </View>

        <View style={styles.intro}>
          <Text style={styles.date}>{todayLabel}</Text>
          <Text accessibilityRole="header" style={styles.title}>
            오늘 할 복습
          </Text>
        </View>

        {isLoading ? (
          <View
            accessibilityLabel="학습 현황 불러오는 중"
            accessibilityLiveRegion="polite"
            accessibilityRole="progressbar"
            accessibilityState={{ busy: true }}
            style={styles.loadingBox}
          >
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>학습 현황을 정리하고 있어요</Text>
          </View>
        ) : loadError ? (
          <RequestErrorState error={loadError} onRetry={loadData} compact />
        ) : (
          <View style={styles.statsStrip}>
            <StatItem value={stats.newCount || 0} label="새 카드" tone={colors.primary} />
            <StatItem value={reviewCount} label="복습 예정" tone={colors.warning} />
            <StatItem value={stats.doneCount || 0} label="기억 완료" tone={colors.text} last />
          </View>
        )}

        {!loadError && (
          <>
            <FeedbackPressable
              accessibilityLabel="오늘 학습 시작하기"
              accessibilityRole="button"
              baseColor={colors.primary}
              hoverColor={colors.primaryHover}
              pressedColor={colors.primaryPressed}
              style={styles.studyCard}
              onPress={() => navigation.navigate('Decks', { screen: 'DeckList' })}
            >
              <View style={styles.studyCardCopy}>
                <Text style={styles.studyTitle}>오늘 학습 시작하기</Text>
              </View>
              <View style={styles.arrowButton}>
                <MaterialCommunityIcons name="arrow-right" size={22} color={colors.primary} />
              </View>
            </FeedbackPressable>

            <View style={styles.sectionHeader}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>최근 암기장</Text>
              {recentDecks.length > 0 && (
                <FeedbackPressable
                  accessibilityLabel="전체 암기장 보기"
                  accessibilityRole="button"
                  baseColor={colors.background}
                  hoverColor={colors.surfaceHover}
                  pressedColor={colors.surfacePressed}
                  onPress={() => navigation.navigate('Decks')}
                  style={styles.allLinkButton}
                >
                  <Text style={styles.allLink}>전체 보기</Text>
                </FeedbackPressable>
              )}
            </View>

            {recentDecks.length === 0 && !isLoading ? (
              <EmptyState
                icon="notebook-outline"
                title="암기장이 없습니다"
                actionLabel="암기장 만들기"
                onAction={() => navigation.navigate('Decks')}
              />
            ) : (
              <View style={styles.deckList}>
                {recentDecks.map((deck) => (
                  <FeedbackPressable
                    accessibilityLabel={`${deck.title}, 카드 ${deck.cardCount || 0}장`}
                    accessibilityHint="카드 목록을 엽니다"
                    accessibilityRole="button"
                    baseColor={colors.background}
                    hoverColor={colors.surfaceHover}
                    pressedColor={colors.surfacePressed}
                    key={deck.id}
                    style={styles.deckRow}
                    onPress={() =>
                      navigation.navigate('Decks', {
                        screen: 'CardList',
                        params: { deckId: deck.id, deckTitle: deck.title },
                      })
                    }
                  >
                    <View style={styles.deckInfo}>
                      <Text numberOfLines={1} style={styles.deckTitle}>
                        {deck.title}
                      </Text>
                      <Text style={styles.deckCount}>{deck.cardCount || 0}장의 카드</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={colors.subText} />
                  </FeedbackPressable>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.huge,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandName: { ...type.eyebrow, color: colors.text, letterSpacing: 1.6 },
  intro: { marginTop: spacing.xxxl, marginBottom: spacing.xxl },
  date: { ...type.body, fontWeight: '600', color: colors.subText, marginBottom: spacing.xs },
  title: { ...type.title, color: colors.text },
  loadingBox: {
    height: 92,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  loadingText: { ...type.caption, color: colors.subText },
  statsStrip: {
    minHeight: 86,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statDivider: { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.border },
  statValue: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.5 },
  statLabel: { ...type.caption, color: colors.subText, marginTop: 2 },
  studyCard: {
    minHeight: 98,
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  studyCardCopy: { flex: 1, paddingRight: spacing.lg },
  studyTitle: { fontSize: 20, lineHeight: 27, fontWeight: '700', color: colors.surface },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.xxxl,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...type.section, color: colors.text },
  allLink: { ...type.caption, color: colors.primary, fontWeight: '700', paddingVertical: spacing.xs },
  allLinkButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  deckList: { borderTopWidth: 1, borderTopColor: colors.border },
  deckRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  deckInfo: { flex: 1 },
  deckTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  deckCount: { ...type.caption, color: colors.subText, marginTop: 3 },
});
