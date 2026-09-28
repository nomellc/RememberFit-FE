import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import BrandMark from '../components/BrandMark';
import EmptyState from '../components/EmptyState';
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
          <View>
            <Text style={styles.brandName}>REMEMBERFIT</Text>
            <Text style={styles.brandCaption}>기억을 만드는 작은 루틴</Text>
          </View>
        </View>

        <View style={styles.intro}>
          <Text style={styles.date}>{todayLabel}</Text>
          <Text accessibilityRole="header" style={styles.title}>
            오늘의 기억을{`\n`}가볍게 이어가요.
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
            <StatItem value={stats.doneCount || 0} label="기억 완료" tone={colors.success} last />
          </View>
        )}

        {!loadError && (
          <>
            <TouchableOpacity
              accessibilityLabel="오늘 학습 시작하기"
              accessibilityRole="button"
              activeOpacity={0.88}
              style={styles.studyCard}
              onPress={() => navigation.navigate('Decks', { screen: 'DeckList' })}
            >
              <View style={styles.studyCardCopy}>
                <Text style={styles.studyEyebrow}>TODAY'S SESSION</Text>
                <Text style={styles.studyTitle}>오늘 학습 시작하기</Text>
                <Text style={styles.studySubtitle}>
                  {reviewCount > 0
                    ? `${reviewCount}장의 카드가 복습을 기다리고 있어요.`
                    : '새 암기장을 열고 첫 카드를 만들어보세요.'}
                </Text>
              </View>
              <View style={styles.arrowButton}>
                <MaterialCommunityIcons name="arrow-right" size={22} color={colors.primaryDark} />
              </View>
              <View style={styles.studyCardAccent} />
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>RECENT</Text>
                <Text accessibilityRole="header" style={styles.sectionTitle}>최근 암기장</Text>
              </View>
              {recentDecks.length > 0 && (
                <TouchableOpacity
                  accessibilityLabel="전체 암기장 보기"
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('Decks')}
                  style={styles.allLinkButton}
                >
                  <Text style={styles.allLink}>전체 보기</Text>
                </TouchableOpacity>
              )}
            </View>

            {recentDecks.length === 0 && !isLoading ? (
              <EmptyState
                icon="notebook-outline"
                title="아직 암기장이 없어요"
                description="배우고 싶은 주제로 첫 암기장을 만들어보세요."
                actionLabel="암기장 만들기"
                onAction={() => navigation.navigate('Decks')}
              />
            ) : (
              <View style={styles.deckList}>
                {recentDecks.map((deck, index) => (
                  <TouchableOpacity
                    accessibilityLabel={`${deck.title}, 카드 ${deck.cardCount || 0}장`}
                    accessibilityHint="카드 목록을 엽니다"
                    accessibilityRole="button"
                    activeOpacity={0.75}
                    key={deck.id}
                    style={styles.deckRow}
                    onPress={() =>
                      navigation.navigate('Decks', {
                        screen: 'CardList',
                        params: { deckId: deck.id, deckTitle: deck.title },
                      })
                    }
                  >
                    <Text style={styles.deckIndex}>{String(index + 1).padStart(2, '0')}</Text>
                    <View style={styles.deckInfo}>
                      <Text numberOfLines={1} style={styles.deckTitle}>
                        {deck.title}
                      </Text>
                      <Text style={styles.deckCount}>{deck.cardCount || 0}장의 카드</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={colors.muted} />
                  </TouchableOpacity>
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
  brandCaption: { ...type.caption, color: colors.subText, marginTop: 2 },
  intro: { marginTop: spacing.xxxl, marginBottom: spacing.xxl },
  date: { ...type.eyebrow, color: colors.primary, marginBottom: spacing.sm },
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
    minHeight: 92,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  statItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statDivider: { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.border },
  statValue: { fontSize: 24, lineHeight: 30, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { ...type.caption, color: colors.subText, marginTop: 2 },
  studyCard: {
    minHeight: 174,
    marginTop: spacing.lg,
    padding: spacing.xxl,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryDark,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  studyCardCopy: { flex: 1, paddingRight: spacing.lg, zIndex: 1 },
  studyEyebrow: { ...type.eyebrow, color: '#BFD0C7' },
  studyTitle: { fontSize: 22, lineHeight: 29, fontWeight: '700', color: colors.surface, marginTop: spacing.sm },
  studySubtitle: { ...type.caption, color: '#CFD9D3', marginTop: spacing.sm, maxWidth: 250 },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  studyCardAccent: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderWidth: 24,
    borderColor: 'rgba(255,255,255,0.055)',
    borderRadius: radius.pill,
    right: -35,
    top: -45,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.xxxl,
    marginBottom: spacing.md,
  },
  sectionEyebrow: { ...type.eyebrow, color: colors.muted, marginBottom: 3 },
  sectionTitle: { ...type.section, color: colors.text },
  allLink: { ...type.caption, color: colors.primary, fontWeight: '700', paddingVertical: spacing.xs },
  allLinkButton: { minHeight: 44, justifyContent: 'center' },
  deckList: { borderTopWidth: 1, borderTopColor: colors.text },
  deckRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  deckIndex: { width: 40, ...type.caption, color: colors.muted, fontVariant: ['tabular-nums'] },
  deckInfo: { flex: 1 },
  deckTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  deckCount: { ...type.caption, color: colors.subText, marginTop: 3 },
});
