import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createCard } from '../api';
import { colors, radius, spacing, type } from '../theme/color';

export default function CardEditorScreen({ route, navigation }) {
  const { deckId } = route.params;
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const canSave = front.trim().length > 0 && back.trim().length > 0 && !isSaving;

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('내용을 확인해주세요', '앞면과 뒷면을 모두 입력해야 카드를 저장할 수 있어요.');
      return;
    }

    setIsSaving(true);
    try {
      await createCard(deckId, front.trim(), back.trim());
      navigation.goBack();
    } catch (error) {
      Alert.alert('카드를 저장하지 못했어요', error.message);
    } finally {
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
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>NEW FLASH CARD</Text>
          <Text style={styles.title}>무엇을 기억할까요?</Text>
          <Text style={styles.subtitle}>질문은 짧고 분명하게, 답은 떠올리기 쉽게 적어보세요.</Text>
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <View>
              <Text style={styles.label}>앞면</Text>
              <Text style={styles.helper}>떠올려야 할 질문이나 단어</Text>
            </View>
          </View>
          <TextInput
            accessibilityLabel="카드 앞면"
            autoFocus
            maxLength={200}
            multiline
            onChangeText={setFront}
            placeholder="예: accommodate의 뜻은?"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.frontInput]}
            textAlignVertical="top"
            value={front}
          />
        </View>

        <View style={styles.connector} />

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <View style={[styles.stepBadge, styles.answerBadge]}>
              <Text style={[styles.stepText, styles.answerStepText]}>2</Text>
            </View>
            <View>
              <Text style={styles.label}>뒷면</Text>
              <Text style={styles.helper}>확인할 정답이나 설명</Text>
            </View>
          </View>
          <TextInput
            accessibilityLabel="카드 뒷면"
            maxLength={1000}
            multiline
            onChangeText={setBack}
            placeholder="예: 수용하다, 공간을 제공하다"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.backInput]}
            textAlignVertical="top"
            value={back}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.85}
          disabled={!canSave}
          onPress={handleSave}
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <>
              <Text style={styles.saveButtonText}>카드 저장하기</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={colors.surface} />
            </>
          )}
        </TouchableOpacity>
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
  heading: { marginBottom: spacing.xxxl },
  eyebrow: { ...type.eyebrow, color: colors.primary, marginBottom: spacing.sm },
  title: { ...type.title, color: colors.text },
  subtitle: { ...type.body, color: colors.subText, marginTop: spacing.sm, maxWidth: 360 },
  fieldGroup: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  stepBadge: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  answerBadge: { backgroundColor: colors.accentSoft },
  stepText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  answerStepText: { color: colors.warning },
  label: { fontSize: 16, color: colors.text, fontWeight: '700' },
  helper: { ...type.caption, color: colors.subText, marginTop: 1 },
  input: {
    minHeight: 126,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 17,
    lineHeight: 25,
  },
  frontInput: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  backInput: { borderLeftWidth: 3, borderLeftColor: colors.accent },
  connector: { width: 1, height: spacing.xl, backgroundColor: colors.border, marginLeft: 33 },
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
    backgroundColor: colors.primaryDark,
  },
  saveButtonDisabled: { backgroundColor: colors.muted },
  saveButtonText: { color: colors.surface, fontSize: 16, fontWeight: '700' },
});
