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
import { getDecks, getHomeStats } from '../api';
import { colors, radius, spacing, type } from '../theme/color';

const EMPTY_STATS = { newCount: 0, reviewCount: 0, doneCount: 0 };

function MetricRow({ icon, label, value, caption, color, last }) {
  return (
    <View style={[styles.metricRow, !last && styles.metricBorder]}>
      <View style={[styles.metricIcon, { backgroundColor: color.background }]}>
        <MaterialCommunityIcons name={icon} size={21} color={color.foreground} />
      </View>
      <View style={styles.metricCopy}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricCaption}>{caption}</Text>
      </View>
      <Text style={[styles.metricValue, { color: color.foreground }]}>{value}</Text>
    </View>
  );
}

export default function StatsScreen() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [totalCards, setTotalCards] = useState(0);
  const [deckCount, setDeckCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStats = async ({ refreshing = false } = {}) => {
    refreshing ? setIsRefreshing(true) : setIsLoading(true);
    const [statData, decks] = await Promise.all([getHomeStats(), getDecks()]);
    setStats(statData || EMPTY_STATS);
    setDeckCount(decks.length);
    setTotalCards(decks.reduce((sum, deck) => sum + (deck.cardCount || 0), 0));
    setIsLoading(false);
    setIsRefreshing(false);
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

  const guideText = useMemo(() => {
    if (totalCards === 0) return '첫 암기장과 카드를 만들면 이곳에 학습 흐름이 기록돼요.';
    if (stats.reviewCount > 0) return `오늘은 복습 카드 ${stats.reviewCount}장을 먼저 확인해보세요.`;
    return '오늘 예정된 복습을 마쳤어요. 새 카드를 천천히 추가해도 좋아요.';
  }, [stats.reviewCount, totalCards]);

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
        <View style={styles.brandRow}>
          <BrandMark />
          <Text style={styles.brandName}>REMEMBERFIT</Text>
        </View>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>LEARNING RECORD</Text>
          <Text style={styles.title}>나의 학습 기록</Text>
          <Text style={styles.subtitle}>쌓인 카드와 오늘의 복습 상태를 한눈에 확인하세요.</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>학습 기록을 불러오고 있어요</Text>
          </View>
        ) : (
          <>
            <View style={styles.overviewCard}>
              <View style={styles.overviewTop}>
                <View>
                  <Text style={styles.overviewLabel}>전체 카드</Text>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalValue}>{totalCards}</Text>
                    <Text style={styles.totalUnit}>장</Text>
                  </View>
                </View>
                <View style={styles.deckBadge}>
                  <MaterialCommunityIcons name="notebook-outline" size={17} color={colors.primary} />
                  <Text style={styles.deckBadgeText}>암기장 {deckCount}개</Text>
                </View>
              </View>

              <View style={styles.progressCopy}>
                <Text style={styles.progressLabel}>기억 완료율</Text>
                <Text style={styles.progressValue}>{completionRate}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${completionRate}%` }]} />
              </View>
              <Text style={styles.progressCaption}>3회 이상 기억해 낸 카드를 기준으로 계산해요.</Text>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>현재 상태</Text>
              <Text style={styles.sectionCaption}>카드 수</Text>
            </View>

            <View style={styles.metricList}>
              <MetricRow
                caption="아직 학습하지 않은 카드"
                color={{ background: colors.primarySoft, foreground: colors.primary }}
                icon="cards-outline"
                label="새 카드"
                value={stats.newCount || 0}
              />
              <MetricRow
                caption="오늘 다시 볼 카드"
                color={{ background: colors.warningSoft, foreground: colors.warning }}
                icon="calendar-refresh-outline"
                label="복습 예정"
                value={stats.reviewCount || 0}
              />
              <MetricRow
                caption="3회 이상 기억한 카드"
                color={{ background: colors.successSoft, foreground: colors.success }}
                icon="check-circle-outline"
                label="기억 완료"
                value={stats.doneCount || 0}
                last
              />
            </View>

            <View style={styles.guideBox}>
              <View style={styles.guideIcon}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color={colors.warning} />
              </View>
              <View style={styles.guideCopy}>
                <Text style={styles.guideTitle}>오늘의 학습 가이드</Text>
                <Text style={styles.guideText}>{guideText}</Text>
              </View>
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
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandName: { ...type.eyebrow, color: colors.text, letterSpacing: 1.6 },
  heading: { marginTop: spacing.xxxl, marginBottom: spacing.xxl },
  eyebrow: { ...type.eyebrow, color: colors.primary, marginBottom: spacing.sm },
  title: { ...type.title, color: colors.text },
  subtitle: { ...type.body, color: colors.subText, marginTop: spacing.sm },
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
    backgroundColor: colors.primaryDark,
  },
  overviewTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  overviewLabel: { ...type.eyebrow, color: '#BDD0C6' },
  totalRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs },
  totalValue: { color: colors.surface, fontSize: 42, lineHeight: 50, fontWeight: '800', letterSpacing: -1 },
  totalUnit: { color: '#BDD0C6', fontSize: 15, fontWeight: '700', marginLeft: spacing.xs },
  deckBadge: {
    height: 36,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  deckBadgeText: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  progressCopy: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xxl },
  progressLabel: { ...type.caption, color: '#CFD9D3' },
  progressValue: { ...type.caption, color: colors.surface, fontWeight: '800' },
  progressTrack: {
    height: 7,
    marginTop: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.13)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accent },
  progressCaption: { fontSize: 11, lineHeight: 16, color: '#AFC1B7', marginTop: spacing.sm },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.xxxl,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...type.section, color: colors.text },
  sectionCaption: { ...type.caption, color: colors.muted },
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
  },
  metricCopy: { flex: 1, paddingHorizontal: spacing.md },
  metricLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  metricCaption: { ...type.caption, color: colors.subText, marginTop: 2 },
  metricValue: { fontSize: 23, fontWeight: '800', fontVariant: ['tabular-nums'] },
  guideBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    marginTop: spacing.xxl,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
  },
  guideIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  guideCopy: { flex: 1 },
  guideTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  guideText: { ...type.caption, color: colors.subText, marginTop: 4 },
});
