import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import EmptyState from '../components/EmptyState';
import RequestErrorState from '../components/RequestErrorState';
import { getCards } from '../api';
import { colors, radius, spacing, type } from '../theme/color';

export default function CardListScreen({ route, navigation }) {
  const { deckId, deckTitle } = route.params;
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const loadCards = async ({ refreshing = false } = {}) => {
    refreshing ? setIsRefreshing(true) : setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getCards(deckId);
      setCards(data);
    } catch (error) {
      setLoadError(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [deckId])
  );

  const goToAddCard = () => navigation.navigate('CardEditor', { deckId });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: deckTitle,
      headerRight: () => (
        <TouchableOpacity
          accessibilityLabel="학습 시작"
          accessibilityRole="button"
          activeOpacity={0.75}
          disabled={cards.length === 0}
          onPress={() => navigation.navigate('Study', { deckId, deckTitle })}
          style={[styles.headerAction, cards.length === 0 && styles.headerActionDisabled]}
        >
          <MaterialCommunityIcons name="play" size={15} color={colors.surface} />
          <Text style={styles.headerActionText}>학습</Text>
        </TouchableOpacity>
      ),
    });
  }, [cards.length, deckId, deckTitle, navigation]);

  const renderHeader = () => (
    <View style={styles.heading}>
      <Text style={styles.eyebrow}>FLASH CARDS</Text>
      <Text style={styles.title}>{deckTitle}</Text>
      <Text style={styles.subtitle}>카드 {cards.length}장 · 앞면을 떠올린 뒤 뒷면으로 확인하세요.</Text>
      {!!loadError && cards.length > 0 && (
        <RequestErrorState error={loadError} onRetry={loadCards} compact />
      )}
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View style={styles.cardItem}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</Text>
        <View style={styles.frontLabel}>
          <Text style={styles.frontLabelText}>앞면</Text>
        </View>
      </View>
      <Text style={styles.frontText}>{item.frontText}</Text>
      <View style={styles.rule} />
      <View style={styles.answerRow}>
        <Text style={styles.backLabel}>뒷면</Text>
        <Text style={styles.backText}>{item.backText}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={[styles.content, cards.length === 0 && styles.emptyContent]}
        data={cards}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : loadError ? (
            <RequestErrorState error={loadError} onRetry={loadCards} />
          ) : (
            <EmptyState
              icon="card-plus-outline"
              title="첫 카드를 추가해보세요"
              description="질문과 답을 한 장씩 쌓으면 나만의 복습 루틴이 시작돼요."
              actionLabel="카드 추가"
              onAction={goToAddCard}
            />
          )
        }
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadCards({ refreshing: true })}
            tintColor={colors.primary}
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      {cards.length > 0 && (
        <TouchableOpacity
          accessibilityLabel="새 카드 추가"
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={goToAddCard}
          style={styles.fab}
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.surface} />
          <Text style={styles.fabText}>새 카드</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 110,
  },
  emptyContent: { flexGrow: 1 },
  heading: { paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  eyebrow: { ...type.eyebrow, color: colors.primary, marginBottom: spacing.sm },
  title: { ...type.title, color: colors.text },
  subtitle: { ...type.body, color: colors.subText, marginTop: spacing.sm },
  headerAction: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  headerActionDisabled: { opacity: 0.4 },
  headerActionText: { color: colors.surface, fontSize: 13, fontWeight: '700' },
  loader: { paddingVertical: spacing.huge },
  cardItem: {
    padding: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardIndex: { ...type.caption, color: colors.muted, fontVariant: ['tabular-nums'] },
  frontLabel: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  frontLabelText: { fontSize: 11, color: colors.primary, fontWeight: '800' },
  frontText: {
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.lg },
  answerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  backLabel: { ...type.caption, color: colors.warning, fontWeight: '800', width: 36 },
  backText: { flex: 1, ...type.body, color: colors.subText },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    height: 52,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryDark,
  },
  fabText: { color: colors.surface, fontSize: 14, fontWeight: '700' },
});
