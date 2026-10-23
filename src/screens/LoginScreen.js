import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import AuthFormScreen from '../components/AuthFormScreen';
import FeedbackPressable from '../components/FeedbackPressable';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api';
import { colors, radius, spacing, type } from '../theme/color';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setFieldErrors({});
    setFormError('');

    if (!email.trim() || !password) {
      setFormError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors || {});
        setFormError(error.message);
      } else {
        setFormError('로그인하지 못했어요. 잠시 후 다시 시도해주세요.');
      }
      setSubmitting(false);
    }
  };

  return (
    <AuthFormScreen
      title="다시 만나서 반가워요"
      subtitle="이어서 학습하려면 로그인해주세요."
      submitLabel="로그인"
      submitting={submitting}
      formError={formError}
      onSubmit={handleSubmit}
      fields={[
        {
          name: 'email',
          label: '이메일',
          value: email,
          onChangeText: setEmail,
          placeholder: 'rememberfit@example.com',
          error: fieldErrors.email,
          inputProps: { keyboardType: 'email-address', textContentType: 'emailAddress' },
        },
        {
          name: 'password',
          label: '비밀번호',
          value: password,
          onChangeText: setPassword,
          placeholder: '비밀번호를 입력해주세요',
          error: fieldErrors.password,
          inputProps: {
            secureTextEntry: true,
            textContentType: 'password',
            onSubmitEditing: handleSubmit,
            returnKeyType: 'go',
          },
        },
      ]}
      footer={
        <FeedbackPressable
          accessibilityLabel="회원가입으로 이동"
          baseColor={colors.background}
          hoverColor={colors.surfaceHover}
          pressedColor={colors.surfacePressed}
          onPress={() => navigation.navigate('Signup')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>
            아직 계정이 없으신가요? <Text style={styles.linkStrong}>회원가입</Text>
          </Text>
        </FeedbackPressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  linkButton: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  linkText: { ...type.caption, color: colors.subText },
  linkStrong: { color: colors.primary, fontWeight: '700' },
});
