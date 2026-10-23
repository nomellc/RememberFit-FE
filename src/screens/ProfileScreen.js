import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BrandMark from '../components/BrandMark';
import FeedbackPressable from '../components/FeedbackPressable';
import { useAuth } from '../auth/AuthContext';
import { colors, radius, spacing, type } from '../theme/color';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.card}>
          <BrandMark size={48} />
          <Text style={styles.nickname}>{user?.nickname ?? '사용자'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
        </View>

        <FeedbackPressable
          accessibilityLabel="로그아웃"
          baseColor={colors.surface}
          hoverColor={colors.surfaceHover}
          pressedColor={colors.surfacePressed}
          disabled={signingOut}
          onPress={handleSignOut}
          style={styles.signOut}
        >
          {signingOut ? (
            <ActivityIndicator color={colors.dangerText} />
          ) : (
            <Text style={styles.signOutText}>로그아웃</Text>
          )}
        </FeedbackPressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.xxl, gap: spacing.xxl },
  card: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.huge,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  nickname: { ...type.section, color: colors.text },
  email: { ...type.caption, color: colors.muted },
  signOut: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  signOutText: { color: colors.dangerText, fontSize: 16, fontWeight: '700' },
});
