import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import EmptyState from '../components/EmptyState';
import FeedbackPressable from '../components/FeedbackPressable';
import RequestErrorState from '../components/RequestErrorState';
import TextEditModal from '../components/TextEditModal';
import { createDeck, deleteDeck, getDecks, updateDeck } from '../api';
import { colors, radius, spacing, type } from '../theme/color';

export default function DeckScreen({ navigation }) {
  const [decks, setDecks] = useState([]);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingDeckId, setDeletingDeckId] = useState(null);
  const [editingDeck, setEditingDeck] = useState(null);
  const [editDeckTitle, setEditDeckTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const createLockRef = useRef(false);
  const deleteLockRef = useRef(false);
  const renameLockRef = useRef(false);

  const loadDecks = async ({ refreshing = false } = {}) => {
    refreshing ? setIsRefreshing(true) : setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getDecks();
      setDecks(data);
    } catch (error) {
      setLoadError(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDecks();
    }, [])
  );

  const handleAddDeck = async () => {
    const title = newDeckTitle.trim();
    if (!title || createLockRef.current) return;

    createLockRef.current = true;
    setIsAdding(true);
    try {
      await createDeck(title);
      setNewDeckTitle('');
      await loadDecks();
    } catch (error) {
      Alert.alert('암기장을 만들지 못했어요', error.message);
    } finally {
      createLockRef.current = false;
      setIsAdding(false);
    }
  };

  const openRenameModal = (deck) => {
    setEditingDeck(deck);
    setEditDeckTitle(deck.title);
  };

  const closeRenameModal = () => {
    if (renameLockRef.current) return;
    setEditingDeck(null);
    setEditDeckTitle('');
  };

  const handleRename = async () => {
    const title = editDeckTitle.trim();
    if (!editingDeck || !title || renameLockRef.current) return;
    if (title === editingDeck.title) {
      closeRenameModal();
      return;
    }

    renameLockRef.current = true;
    setIsRenaming(true);
    try {
      const updatedDeck = await updateDeck(editingDeck.id, title);
      setDecks((current) =>
        current.map((deck) => (deck.id === updatedDeck.id ? updatedDeck : deck))
      );
      setEditingDeck(null);
      setEditDeckTitle('');
    } catch (error) {
      Alert.alert('이름을 바꾸지 못했어요', error.message);
    } finally {
      renameLockRef.current = false;
      setIsRenaming(false);
    }
  };

  const handleDelete = (deck) => {
    Alert.alert(
      '암기장 삭제',
      `‘${deck.title}’ 암기장과 안의 모든 카드가 바로 삭제되며 복구할 수 없어요. 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            if (deleteLockRef.current) return;
            deleteLockRef.current = true;
            setDeletingDeckId(deck.id);
            try {
              await deleteDeck(deck.id);
              setDecks((current) => current.filter((item) => item.id !== deck.id));
            } catch (error) {
              Alert.alert('삭제하지 못했어요', error.message);
            } finally {
              deleteLockRef.current = false;
              setDeletingDeckId(null);
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={styles.title}>암기장</Text>
      </View>

      <View style={styles.createBox}>
        <Text style={styles.inputLabel}>새 암기장</Text>
        <View style={styles.inputRow}>
          <TextInput
            accessibilityLabel="새 암기장 이름"
            autoCapitalize="none"
            blurOnSubmit
            maxLength={40}
            onChangeText={setNewDeckTitle}
            onSubmitEditing={handleAddDeck}
            placeholder="암기장 이름"
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            style={styles.input}
            value={newDeckTitle}
          />
          <FeedbackPressable
            accessibilityLabel="암기장 추가"
            accessibilityRole="button"
            accessibilityState={{
              busy: isAdding,
              disabled: !newDeckTitle.trim() || isAdding,
            }}
            baseColor={colors.primary}
            hoverColor={colors.primaryHover}
            pressedColor={colors.primaryPressed}
            disabled={!newDeckTitle.trim() || isAdding}
            onPress={handleAddDeck}
            style={[
              styles.addButton,
              (!newDeckTitle.trim() || isAdding) && styles.addButtonDisabled,
            ]}
          >
            {isAdding ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <MaterialCommunityIcons name="plus" size={24} color={colors.surface} />
            )}
          </FeedbackPressable>
        </View>
      </View>

      <View style={styles.listHeading}>
        <Text accessibilityRole="header" style={styles.listTitle}>목록</Text>
        <Text style={styles.listCount}>{decks.length}</Text>
      </View>
      {!!loadError && decks.length > 0 && (
        <RequestErrorState error={loadError} onRetry={loadDecks} compact />
      )}
    </>
  );

  const renderItem = ({ item }) => (
    <View style={styles.deckItem}>
      <FeedbackPressable
        accessibilityLabel={`${item.title}, 카드 ${item.cardCount || 0}장`}
        accessibilityHint="카드 목록을 엽니다"
        accessibilityRole="button"
        baseColor={colors.background}
        hoverColor={colors.surfaceHover}
        pressedColor={colors.surfacePressed}
        onPress={() =>
          navigation.navigate('CardList', { deckId: item.id, deckTitle: item.title })
        }
        style={styles.deckMain}
      >
        <View style={styles.deckCopy}>
          <Text numberOfLines={1} style={styles.deckTitle}>
            {item.title}
          </Text>
          <Text style={styles.deckCount}>{item.cardCount || 0}장의 카드</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={22} color={colors.subText} />
      </FeedbackPressable>
      <View style={styles.itemActions}>
        <FeedbackPressable
          accessibilityLabel={`${item.title} 암기장 이름 수정`}
          accessibilityRole="button"
          baseColor="rgba(0, 0, 0, 0)"
          hoverColor={colors.surfacePressed}
          pressedColor={colors.border}
          hitSlop={6}
          onPress={() => openRenameModal(item)}
          style={styles.iconButton}
        >
          <MaterialCommunityIcons name="pencil-outline" size={19} color={colors.subText} />
        </FeedbackPressable>
        <FeedbackPressable
          accessibilityLabel={`${item.title} 암기장 삭제`}
          accessibilityRole="button"
          accessibilityState={{
            busy: deletingDeckId === item.id,
            disabled: deletingDeckId === item.id,
          }}
          baseColor="rgba(0, 0, 0, 0)"
          hoverColor={colors.dangerSoft}
          pressedColor="#F5D7D3"
          disabled={deletingDeckId === item.id}
          hitSlop={6}
          onPress={() => handleDelete(item)}
          style={styles.iconButton}
        >
          {deletingDeckId === item.id ? (
            <ActivityIndicator color={colors.danger} size="small" />
          ) : (
            <MaterialCommunityIcons name="trash-can-outline" size={19} color={colors.danger} />
          )}
        </FeedbackPressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.safeArea}
      >
        <FlatList
          accessibilityState={{ busy: isLoading || isRefreshing }}
          contentContainerStyle={styles.content}
          data={decks}
          initialNumToRender={8}
          keyExtractor={(item) => item.id.toString()}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : loadError ? (
              <RequestErrorState error={loadError} onRetry={loadDecks} />
            ) : (
              <EmptyState
                icon="notebook-plus-outline"
                title="암기장이 없습니다"
              />
            )
          }
          ListHeaderComponent={renderHeader}
          maxToRenderPerBatch={8}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadDecks({ refreshing: true })}
              tintColor={colors.primary}
            />
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          updateCellsBatchingPeriod={40}
          windowSize={7}
        />
        <TextEditModal
          isSaving={isRenaming}
          label="암기장 이름"
          maxLength={40}
          onCancel={closeRenameModal}
          onChangeText={setEditDeckTitle}
          onSubmit={handleRename}
          placeholder="암기장 이름"
          title="이름 바꾸기"
          value={editDeckTitle}
          visible={!!editingDeck}
        />
      </KeyboardAvoidingView>
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
  heading: { marginTop: spacing.lg },
  title: { ...type.title, color: colors.text },
  createBox: {
    marginTop: spacing.xxl,
  },
  inputLabel: { ...type.caption, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
  },
  addButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  addButtonDisabled: { backgroundColor: colors.primary, opacity: 0.5 },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxxl,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  listTitle: { ...type.section, color: colors.text },
  listCount: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    fontSize: 12,
    lineHeight: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  loader: { paddingVertical: spacing.huge },
  deckItem: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  deckMain: { flex: 1, minHeight: 86, flexDirection: 'row', alignItems: 'center' },
  deckCopy: { flex: 1, paddingRight: spacing.md },
  deckTitle: { fontSize: 16, color: colors.text, fontWeight: '700' },
  deckCount: { ...type.caption, color: colors.subText, marginTop: 3 },
  itemActions: { flexDirection: 'row', alignItems: 'center', marginLeft: spacing.xs },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
});
