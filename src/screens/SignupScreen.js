import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import AuthFormScreen from '../components/AuthFormScreen';
import FeedbackPressable from '../components/FeedbackPressable';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api';
import { colors, radius, spacing, type } from '../theme/color';

const MIN_PASSWORD_LENGTH = 8;

export default function SignupScreen({ navigation }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setFieldErrors({});
    setFormError('');

    // 서버도 같은 규칙으로 검사하지만, 왕복 없이 바로 알려주는 편이 빠르다.
    const localErrors = {};
    if (!email.trim()) localErrors.email = '이메일을 입력해주세요.';
    if (password.length < MIN_PASSWORD_LENGTH) {
      localErrors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 해요.`;
    }
    if (!nickname.trim()) localErrors.nickname = '닉네임을 입력해주세요.';

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email.trim(), password, nickname.trim());
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.fieldErrors || {});
        setFormError(error.message);
      } else {
        setFormError('회원가입하지 못했어요. 잠시 후 다시 시도해주세요.');
      }
      setSubmitting(false);
    }
  };

  return (
    <AuthFormScreen
      title="RememberFit 시작하기"
      subtitle="계정을 만들면 학습 기록이 기기와 상관없이 남아요."
      submitLabel="회원가입"
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
          placeholder: `${MIN_PASSWORD_LENGTH}자 이상 입력해주세요`,
          error: fieldErrors.password,
          inputProps: { secureTextEntry: true, textContentType: 'newPassword' },
        },
        {
          name: 'nickname',
          label: '닉네임',
          value: nickname,
          onChangeText: setNickname,
          placeholder: '앱에서 보일 이름',
          error: fieldErrors.nickname,
          inputProps: {
            maxLength: 20,
            onSubmitEditing: handleSubmit,
            returnKeyType: 'go',
          },
        },
      ]}
      footer={
        <FeedbackPressable
          accessibilityLabel="로그인으로 이동"
          baseColor={colors.background}
          hoverColor={colors.surfaceHover}
          pressedColor={colors.surfacePressed}
          onPress={() => navigation.navigate('Login')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>
            이미 계정이 있으신가요? <Text style={styles.linkStrong}>로그인</Text>
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
