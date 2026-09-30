import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import FeedbackPressable from './FeedbackPressable';
import { colors, radius, spacing, type } from '../theme/color';

export default function TextEditModal({
  visible,
  title,
  label,
  value,
  placeholder,
  maxLength,
  isSaving,
  onChangeText,
  onCancel,
  onSubmit,
}) {
  const inputRef = useRef(null);
  const canSubmit = value.trim().length > 0 && !isSaving;

  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => {
        if (!isSaving) onCancel();
      }}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable
          accessibilityLabel="편집 창 닫기"
          accessibilityRole="button"
          accessibilityState={{ disabled: isSaving }}
          disabled={isSaving}
          onPress={onCancel}
          style={StyleSheet.absoluteFill}
        />
        <View accessibilityViewIsModal style={styles.sheet}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            accessibilityLabel={label}
            maxLength={maxLength}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            placeholder={placeholder}
            placeholderTextColor={colors.muted}
            ref={inputRef}
            returnKeyType="done"
            selectTextOnFocus
            style={styles.input}
            value={value}
          />
          <View style={styles.actions}>
            <FeedbackPressable
              accessibilityLabel="편집 취소"
              accessibilityRole="button"
              accessibilityState={{ disabled: isSaving }}
              baseColor={colors.surface}
              hoverColor={colors.surfaceHover}
              pressedColor={colors.surfacePressed}
              disabled={isSaving}
              onPress={onCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>취소</Text>
            </FeedbackPressable>
            <FeedbackPressable
              accessibilityLabel="변경 내용 저장"
              accessibilityRole="button"
              baseColor={colors.primary}
              hoverColor={colors.primaryHover}
              pressedColor={colors.primaryPressed}
              accessibilityState={{ busy: isSaving, disabled: !canSubmit }}
              disabled={!canSubmit}
              onPress={onSubmit}
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.surface} size="small" />
              ) : (
                <Text style={styles.submitText}>저장</Text>
              )}
            </FeedbackPressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(32, 35, 31, 0.46)',
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  title: { ...type.section, color: colors.text },
  label: { ...type.caption, color: colors.text, fontWeight: '700', marginTop: spacing.xl, marginBottom: spacing.sm },
  input: {
    height: 52,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 16,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.xl },
  cancelButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  cancelText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  submitButton: {
    minWidth: 84,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: { backgroundColor: colors.primary, opacity: 0.5 },
  submitText: { color: colors.surface, fontSize: 15, fontWeight: '700' },
});
