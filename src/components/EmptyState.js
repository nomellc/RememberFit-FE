import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FeedbackPressable from './FeedbackPressable';
import { colors, radius, spacing, type } from '../theme/color';

export default function EmptyState({
  icon = 'cards-outline',
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}) {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={28} color={colors.primary} />
      </View>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {!!description && <Text style={styles.description}>{description}</Text>}
      {!!actionLabel && !!onAction && (
        <FeedbackPressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          baseColor={colors.primary}
          hoverColor={colors.primaryHover}
          pressedColor={colors.primaryPressed}
          onPress={onAction}
          style={styles.action}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <MaterialCommunityIcons name="arrow-right" size={17} color={colors.surface} />
        </FeedbackPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.huge,
  },
  compactContainer: {
    paddingVertical: spacing.xxl,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    marginBottom: spacing.lg,
  },
  title: {
    ...type.section,
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    ...type.body,
    color: colors.subText,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 280,
  },
  action: {
    marginTop: spacing.xl,
    height: 46,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
});
