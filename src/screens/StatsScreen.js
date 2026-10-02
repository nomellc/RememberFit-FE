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
import RequestErrorState from '../components/RequestErrorState';
import { getDecks, getStudyInsights, getStudyStatistics } from '../api';
import { colors, radius, spacing, type } from '../theme/color';

const EMPTY_STATS = { newCount: 0, reviewCount: 0, doneCount: 0 };
const EMPTY_INSIGHTS = {
  totalStudyCount: 0,
  streakDays: 0,
  weeklyActivity: [],
  qualityDistribution: { againCount: 0, hardCount: 0, goodCount: 0, easyCount: 0 },
};

const qualityRows = [
  { key: 'againCount', label: '다시', color: colors.danger },
  { key: 'hardCount', label: '어려움', color: colors.warning },
  { key: 'goodCount', label: '알맞음', color: colors.good },
  { key: 'easyCount', label: '쉬움', color: colors.easy },
];

function MetricRow({ icon, label, value, caption, last }) {
  return (
    <View
      accessible
      accessibilityLabel={`${label} ${value}장. ${caption}`}
      style={[styles.metricRow, !last && styles.metricBorder]}
    >
      <View style={styles.metricIcon}>
        <MaterialCommunityIcons name={icon} size={21} color={colors.subText} />
      </View>
      <View style={styles.metricCopy}>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function DistributionRow({ label, count, total, color }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <View
      accessible
      accessibilityLabel={`${label} ${count}회, 전체의 ${percentage}%`}
      style={styles.distributionRow}
    >
      <View style={styles.distributionCopy}>
        <View style={[styles.distributionDot, { backgroundColor: color }]} />
        <Text style={styles.distributionLabel}>{label}</Text>
      </View>
      <View style={styles.distributionTrack}>
        <View style={[styles.distributionFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.distributionValue}>{count}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [insights, setInsights] = useState(EMPTY_INSIGHTS);
  const [totalCards, setTotalCards] = useState(0);
  const [deckCount, setDeckCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const loadStats = async ({ refreshing = false } = {}) => {
    refreshing ? setIsRefreshing(true) : setIsLoading(true);
    setLoadError(null);
    try {
      const [statData, insightData, decks] = await Promise.all([
        getStudyStatistics(),
        getStudyInsights(),
        getDecks(),
      ]);
      setStats(statData || EMPTY_STATS);
      setInsights(insightData || EMPTY_INSIGHTS);
      setDeckCount(decks.length);
      setTotalCards(decks.reduce((sum, deck) => sum + (deck.cardCount || 0), 0));
    } catch (error) {
      setLoadError(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const completionRate = useMemo(() => {
    if (totalCards === 0) return 0;
    return Math.min(Math.round(((stats.doneCount || 0) / totalCards) * 100), 100);
  }, [stats.doneCount, totalCards]);

  const weeklyMaximum = useMemo(
    () => Math.max(...insights.weeklyActivity.map((item) => item.count), 1),
    [insights.weeklyActivity]
  );

  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }),
    []
  );

  const weeklyAccessibilityLabel = useMemo(() => {
    const dailyCounts = insights.weeklyActivity
      .map((item) => `${weekdayFormatter.format(new Date(`${item.date}T00:00:00`))}요일 ${item.count}회`)
      .join(', ');
    return `누적 학습 ${insights.totalStudyCount || 0}회. 최근 7일 학습 기록. ${
      dailyCounts || '학습 기록 없음'
    }`;
  }, [insights.totalStudyCount, insights.weeklyActivity, weekdayFormatter]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadStats({ refreshing: true })}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>학습 기록</Text>
        </View>

        {isLoading ? (
          <View
            accessibilityLabel="학습 기록 불러오는 중"
            accessibilityLiveRegion="polite"
            accessibilityRole="progressbar"
            accessibilityState={{ busy: true }}
            style={styles.loadingBox}
          >
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>학습 기록을 불러오고 있어요</Text>
          </View>
        ) : loadError ? (
          <RequestErrorState error={loadError} onRetry={loadStats} />
        ) : (
          <>
            <View style={styles.overviewCard}>
              <View>
                <Text style={styles.overviewLabel}>전체 카드</Text>
                <View style={styles.totalRow}>
                  <Text style={styles.totalValue}>{totalCards}</Text>
                  <Text style={styles.totalUnit}>장</Text>
                </View>
                <Text style={styles.deckMeta}>{deckCount}개의 암기장</Text>
              </View>

              <View style={styles.progressCopy}>
                <Text style={styles.progressLabel}>기억 완료율</Text>
                <Text style={styles.progressValue}>{completionRate}%</Text>
              </View>
              <View
                accessibilityLabel="기억 완료율"
                accessibilityHint="3회 이상 기억한 카드의 비율"
                accessibilityRole="progressbar"
                accessibilityValue={{ min: 0, max: 100, now: completionRate, text: `${completionRate}%` }}
                style={styles.progressTrack}
              >
                <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>최근 7일 학습</Text>
              <View accessible accessibilityLabel={`${insights.streakDays || 0}일 연속 학습`}>
                <Text style={styles.streakText}>{insights.streakDays || 0}일 연속</Text>
              </View>
            </View>

            <View accessible accessibilityLabel={weeklyAccessibilityLabel} style={styles.activityCard}>
              <View style={styles.activitySummary}>
                <Text style={styles.activityTotal}>{insights.totalStudyCount || 0}</Text>
                <Text style={styles.activityUnit}>누적 학습</Text>
              </View>
              <View style={styles.chart}>
                {insights.weeklyActivity.map((item) => {
                  const barHeight = item.count > 0 ? Math.max(10, (item.count / weeklyMaximum) * 72) : 4;
                  return (
                    <View key={item.date} style={styles.chartColumn}>
                      <Text style={styles.chartValue}>{item.count || ''}</Text>
                      <View style={[styles.chartBar, { height: barHeight }]} />
                      <Text style={styles.chartLabel}>
                        {weekdayFormatter.format(new Date(`${item.date}T00:00:00`))}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>평가 분포</Text>
            </View>

            <View style={styles.distributionCard}>
              {qualityRows.map((item) => (
                <DistributionRow
                  color={item.color}
                  count={insights.qualityDistribution[item.key] || 0}
                  key={item.key}
                  label={item.label}
                  total={insights.totalStudyCount || 0}
                />
              ))}
            </View>

            <View style={styles.sectionHeading}>
              <Text accessibilityRole="header" style={styles.sectionTitle}>현재 상태</Text>
            </View>

            <View style={styles.metricList}>
              <MetricRow
                caption="아직 학습하지 않은 카드"
                icon="cards-outline"
                label="새 카드"
                value={stats.newCount || 0}
              />
              <MetricRow
                caption="오늘 다시 볼 카드"
                icon="calendar-refresh-outline"
                label="복습 예정"
                value={stats.reviewCount || 0}
              />
              <MetricRow
                caption="3회 이상 기억한 카드"
                icon="check-circle-outline"
                label="기억 완료"
                value={stats.doneCount || 0}
                last
              />
            </View>

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
  heading: { marginTop: spacing.lg, marginBottom: spacing.xxl },
  title: { ...type.title, color: colors.text },
  loadingBox: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  loadingText: { ...type.caption, color: colors.subText },
  overviewCard: {
    padding: spacing.xxl,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
  },
  overviewLabel: { ...type.body, color: colors.surface },
  totalRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs },
  totalValue: { color: colors.surface, fontSize: 40, lineHeight: 48, fontWeight: '700', letterSpacing: -1 },
  totalUnit: { color: colors.surface, fontSize: 15, marginLeft: spacing.xs },
  deckMeta: { ...type.caption, color: colors.surface, marginTop: spacing.xs },
  progressCopy: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xxl },
  progressLabel: { ...type.caption, color: colors.surface, fontWeight: '700' },
  progressValue: { ...type.caption, color: colors.surface, fontWeight: '800' },
  progressTrack: {
    height: 7,
    marginTop: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.13)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.surface },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.xxxl,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...type.section, color: colors.text },
  streakText: { color: colors.subText, fontSize: 14, fontWeight: '400' },
  activityCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  activitySummary: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  activityTotal: { color: colors.text, fontSize: 26, fontWeight: '700' },
  activityUnit: { ...type.caption, color: colors.subText },
  chart: {
    height: 116,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  chartColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartValue: { height: 18, color: colors.subText, fontSize: 10, fontWeight: '700' },
  chartBar: {
    width: 18,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  chartLabel: { ...type.caption, color: colors.muted, marginTop: spacing.sm, fontSize: 11 },
  distributionCard: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  distributionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  distributionCopy: { width: 64, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  distributionDot: { width: 10, height: 10, borderRadius: radius.pill },
  distributionLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  distributionTrack: {
    flex: 1,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  distributionFill: { height: '100%', borderRadius: radius.pill },
  distributionValue: {
    width: 30,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  metricList: {
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  metricRow: { minHeight: 82, flexDirection: 'row', alignItems: 'center' },
  metricBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  metricIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  metricCopy: { flex: 1, paddingHorizontal: spacing.md },
  metricLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
  metricValue: { color: colors.text, fontSize: 23, fontWeight: '700', fontVariant: ['tabular-nums'] },
});
