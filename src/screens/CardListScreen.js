import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import EmptyState from '../components/EmptyState';
import RequestErrorState from '../components/RequestErrorState';
import { deleteCard, getCards } from '../api';
import { colors, radius, spacing, type } from '../theme/color';

const { filterCards } = require('../utils/cardSearch');

export default function CardListScreen({ route, navigation }) {
  const { deckId, deckTitle } = route.params;
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [deletingCardId, setDeletingCardId] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const deleteLockRef = useRef(false);

  const filteredCards = useMemo(() => {
    return filterCards(cards, query);
  }, [cards, query]);

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

  const goToEditCard = (card) => navigation.navigate('CardEditor', { deckId, card });

  const handleDelete = (card) => {
    Alert.alert(
      '카드 삭제',
      '이 카드는 바로 삭제되며 복구할 수 없어요. 삭제할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            if (deleteLockRef.current) return;
            deleteLockRef.current = true;
            setDeletingCardId(card.id);
            try {
              await deleteCard(deckId, card.id);
              setCards((current) => current.filter((item) => item.id !== card.id));
            } catch (error) {
              Alert.alert('카드를 삭제하지 못했어요', error.message);
            } finally {
              deleteLockRef.current = false;
              setDeletingCardId(null);
            }
          },
        },
      ]
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: deckTitle,
      headerRight: () => (
        <TouchableOpacity
          accessibilityLabel="학습 시작"
          accessibilityRole="button"
          accessibilityState={{ disabled: cards.length === 0 }}
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
      <Text accessibilityRole="header" style={styles.title}>{deckTitle}</Text>
      <Text style={styles.subtitle}>카드 {cards.length}장 · 앞면을 떠올린 뒤 뒷면으로 확인하세요.</Text>
      {cards.length > 0 && (
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.muted} />
          <TextInput
            accessibilityLabel="카드 검색"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="앞면과 뒷면에서 검색"
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            style={styles.searchInput}
            value={query}
          />
          {!!query && (
            <TouchableOpacity
              accessibilityLabel="검색어 지우기"
              accessibilityRole="button"
              onPress={() => setQuery('')}
              style={styles.clearButton}
            >
              <MaterialCommunityIcons name="close-circle" size={19} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      )}
      {!!query.trim() && (
        <Text accessibilityLiveRegion="polite" style={styles.searchResult}>
          {filteredCards.length}개의 카드를 찾았어요.
        </Text>
      )}
      {!!loadError && cards.length > 0 && (
        <RequestErrorState error={loadError} onRetry={loadCards} compact />
      )}
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View style={styles.cardItem}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</Text>
        <View style={styles.cardActions}>
          <View style={styles.frontLabel}>
            <Text style={styles.frontLabelText}>앞면</Text>
          </View>
          <TouchableOpacity
            accessibilityLabel={`${item.frontText} 카드 수정`}
            accessibilityRole="button"
            hitSlop={6}
            onPress={() => goToEditCard(item)}
            style={styles.iconButton}
          >
            <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel={`${item.frontText} 카드 삭제`}
            accessibilityRole="button"
            accessibilityState={{
              busy: deletingCardId === item.id,
              disabled: deletingCardId === item.id,
            }}
            disabled={deletingCardId === item.id}
            hitSlop={6}
            onPress={() => handleDelete(item)}
            style={styles.iconButton}
          >
            {deletingCardId === item.id ? (
              <ActivityIndicator color={colors.danger} size="small" />
            ) : (
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
            )}
          </TouchableOpacity>
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
        accessibilityState={{ busy: isLoading || isRefreshing }}
        contentContainerStyle={[styles.content, filteredCards.length === 0 && styles.emptyContent]}
        data={filteredCards}
        initialNumToRender={8}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : loadError ? (
            <RequestErrorState error={loadError} onRetry={loadCards} />
          ) : cards.length === 0 ? (
            <EmptyState
              icon="card-plus-outline"
              title="첫 카드를 추가해보세요"
              description="질문과 답을 한 장씩 쌓으면 나만의 복습 루틴이 시작돼요."
              actionLabel="카드 추가"
              onAction={goToAddCard}
            />
          ) : (
            <EmptyState
              icon="magnify"
              title="검색 결과가 없어요"
              description="검색어를 줄이거나 앞면과 뒷면의 다른 단어로 찾아보세요."
              actionLabel="검색어 지우기"
              onAction={() => setQuery('')}
            />
          )
        }
        ListHeaderComponent={renderHeader}
        maxToRenderPerBatch={8}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadCards({ refreshing: true })}
            tintColor={colors.primary}
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        updateCellsBatchingPeriod={40}
        windowSize={7}
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
  searchBox: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  searchInput: { flex: 1, height: '100%', color: colors.text, fontSize: 15 },
  clearButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.md,
  },
  searchResult: { ...type.caption, color: colors.subText, marginTop: spacing.sm },
  headerAction: {
    minHeight: 44,
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
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardIndex: { ...type.caption, color: colors.muted, fontVariant: ['tabular-nums'] },
  frontLabel: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  frontLabelText: { fontSize: 11, color: colors.primary, fontWeight: '800' },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
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
