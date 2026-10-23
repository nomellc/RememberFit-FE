import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandMark from './BrandMark';
import FeedbackPressable from './FeedbackPressable';
import { colors, radius, spacing, type } from '../theme/color';

/**
 * 로그인·회원가입 화면의 공통 뼈대.
 * 두 화면이 입력 항목만 다르고 레이아웃과 오류 표시는 같아서 한곳에 모았다.
 */
export default function AuthFormScreen({
  title,
  subtitle,
  fields,
  submitLabel,
  onSubmit,
  submitting,
  formError,
  footer,
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <BrandMark size={52} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.form}>
            {fields.map((field) => (
              <View key={field.name} style={styles.field}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  accessibilityLabel={field.label}
                  style={[styles.input, field.error && styles.inputError]}
                  value={field.value}
                  onChangeText={field.onChangeText}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                  {...field.inputProps}
                />
                {field.error ? <Text style={styles.fieldError}>{field.error}</Text> : null}
              </View>
            ))}

            {formError ? (
              <View accessibilityRole="alert" style={styles.formError}>
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            ) : null}

            <FeedbackPressable
              accessibilityLabel={submitLabel}
              baseColor={submitting ? colors.muted : colors.primary}
              hoverColor={submitting ? colors.muted : colors.primaryHover}
              pressedColor={submitting ? colors.muted : colors.primaryPressed}
              disabled={submitting}
              onPress={onSubmit}
              style={styles.submit}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitText}>{submitLabel}</Text>
              )}
            </FeedbackPressable>
          </View>

          <View style={styles.footer}>{footer}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.huge,
    gap: spacing.xxxl,
  },
  header: { alignItems: 'center', gap: spacing.lg },
  title: { ...type.title, color: colors.text, textAlign: 'center' },
  subtitle: { ...type.body, color: colors.subText, textAlign: 'center' },
  form: { gap: spacing.xl },
  field: { gap: spacing.sm },
  label: { ...type.caption, color: colors.subText, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg + 2,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.danger },
  fieldError: { ...type.caption, color: colors.dangerText },
  formError: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  formErrorText: { ...type.caption, color: colors.dangerText },
  submit: {
    borderRadius: radius.md,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  footer: { alignItems: 'center' },
});
