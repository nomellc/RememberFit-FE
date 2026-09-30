import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FeedbackPressable from '../components/FeedbackPressable';
import { createCard, updateCard } from '../api';
import { colors, radius, spacing } from '../theme/color';

export default function CardEditorScreen({ route, navigation }) {
  const { deckId, card } = route.params;
  const isEditing = !!card;
  const [front, setFront] = useState(card?.frontText ?? '');
  const [back, setBack] = useState(card?.backText ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const saveLockRef = useRef(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEditing ? '카드 수정' : '새 카드' });
  }, [isEditing, navigation]);

  const canSave = front.trim().length > 0 && back.trim().length > 0 && !isSaving;

  const handleSave = async () => {
    if (!front.trim() || !back.trim()) {
      Alert.alert('내용을 확인해주세요', '앞면과 뒷면을 모두 입력해야 카드를 저장할 수 있어요.');
      return;
    }
    if (saveLockRef.current) return;

    saveLockRef.current = true;
    setIsSaving(true);
    try {
      if (isEditing) {
        await updateCard(deckId, card.id, front.trim(), back.trim());
      } else {
        await createCard(deckId, front.trim(), back.trim());
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('카드를 저장하지 못했어요', error.message);
    } finally {
      saveLockRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>앞면</Text>
          <TextInput
            accessibilityLabel="카드 앞면"
            autoFocus={Platform.OS === 'web'}
            maxLength={200}
            multiline
            onChangeText={setFront}
            placeholder="예: accommodate의 뜻은?"
            placeholderTextColor={colors.muted}
            style={styles.input}
            textAlignVertical="top"
            value={front}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>뒷면</Text>
          <TextInput
            accessibilityLabel="카드 뒷면"
            maxLength={1000}
            multiline
            onChangeText={setBack}
            placeholder="예: 수용하다, 공간을 제공하다"
            placeholderTextColor={colors.muted}
            style={styles.input}
            textAlignVertical="top"
            value={back}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <FeedbackPressable
          accessibilityLabel={isEditing ? '수정 내용 저장' : '카드 저장하기'}
          accessibilityRole="button"
          accessibilityState={{ busy: isSaving, disabled: !canSave }}
          baseColor={colors.primary}
          hoverColor={colors.primaryHover}
          pressedColor={colors.primaryPressed}
          disabled={!canSave}
          onPress={handleSave}
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <>
              <Text style={styles.saveButtonText}>{isEditing ? '수정 내용 저장' : '카드 저장하기'}</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={colors.surface} />
            </>
          )}
        </FeedbackPressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  fieldGroup: {
    marginBottom: spacing.xxl,
  },
  label: { fontSize: 16, color: colors.text, fontWeight: '700', marginBottom: spacing.sm },
  input: {
    minHeight: 126,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 17,
    lineHeight: 25,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxxl : spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  saveButton: {
    width: '100%',
    maxWidth: 680,
    height: 54,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: { backgroundColor: colors.primary, opacity: 0.5 },
  saveButtonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
});
