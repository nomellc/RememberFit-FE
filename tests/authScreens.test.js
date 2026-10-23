import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockSignIn = jest.fn();
const mockSignUp = jest.fn();

jest.mock('../src/auth/AuthContext', () => ({
  useAuth: () => ({ signIn: mockSignIn, signUp: mockSignUp }),
}));

import LoginScreen from '../src/screens/LoginScreen';
import SignupScreen from '../src/screens/SignupScreen';
import { ApiError } from '../src/api';

const navigation = { navigate: jest.fn() };

beforeEach(() => {
  mockSignIn.mockReset();
  mockSignUp.mockReset();
  navigation.navigate.mockReset();
});

describe('로그인 화면', () => {
  test('비어 있는 입력으로는 서버를 부르지 않고 안내만 보여준다', async () => {
    const { getByRole, findByText } = await render(<LoginScreen navigation={navigation} />);

    await fireEvent.press(getByRole('button', { name: '로그인' }));

    expect(await findByText('이메일과 비밀번호를 입력해주세요.')).toBeTruthy();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  test('이메일 앞뒤 공백을 떼고 로그인을 요청한다', async () => {
    mockSignIn.mockResolvedValue(undefined);
    const { getByLabelText, getByRole } = await render(<LoginScreen navigation={navigation} />);

    await fireEvent.changeText(getByLabelText('이메일'), '  user@test.local  ');
    await fireEvent.changeText(getByLabelText('비밀번호'), 'password1234');
    await fireEvent.press(getByRole('button', { name: '로그인' }));

    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith('user@test.local', 'password1234')
    );
  });

  test('서버가 보낸 실패 사유를 그대로 보여준다', async () => {
    mockSignIn.mockRejectedValue(
      new ApiError('이메일 또는 비밀번호가 올바르지 않아요.', {
        status: 401,
        code: 'INVALID_CREDENTIALS',
      })
    );
    const { getByLabelText, getByRole, findByText } = await render(
      <LoginScreen navigation={navigation} />
    );

    await fireEvent.changeText(getByLabelText('이메일'), 'user@test.local');
    await fireEvent.changeText(getByLabelText('비밀번호'), 'wrong-password');
    await fireEvent.press(getByRole('button', { name: '로그인' }));

    expect(await findByText('이메일 또는 비밀번호가 올바르지 않아요.')).toBeTruthy();
  });

  test('회원가입 화면으로 이동할 수 있다', async () => {
    const { getByRole } = await render(<LoginScreen navigation={navigation} />);

    await fireEvent.press(getByRole('button', { name: '회원가입으로 이동' }));

    expect(navigation.navigate).toHaveBeenCalledWith('Signup');
  });
});

describe('회원가입 화면', () => {
  test('짧은 비밀번호는 서버에 보내기 전에 막는다', async () => {
    const { getByLabelText, getByRole, findByText } = await render(
      <SignupScreen navigation={navigation} />
    );

    await fireEvent.changeText(getByLabelText('이메일'), 'user@test.local');
    await fireEvent.changeText(getByLabelText('비밀번호'), 'short');
    await fireEvent.changeText(getByLabelText('닉네임'), '테스터');
    await fireEvent.press(getByRole('button', { name: '회원가입' }));

    expect(await findByText('비밀번호는 8자 이상이어야 해요.')).toBeTruthy();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  test('올바른 입력이면 회원가입을 요청한다', async () => {
    mockSignUp.mockResolvedValue(undefined);
    const { getByLabelText, getByRole } = await render(<SignupScreen navigation={navigation} />);

    await fireEvent.changeText(getByLabelText('이메일'), 'new@test.local');
    await fireEvent.changeText(getByLabelText('비밀번호'), 'password1234');
    await fireEvent.changeText(getByLabelText('닉네임'), '  새사용자  ');
    await fireEvent.press(getByRole('button', { name: '회원가입' }));

    await waitFor(() =>
      expect(mockSignUp).toHaveBeenCalledWith('new@test.local', 'password1234', '새사용자')
    );
  });

  test('이미 가입된 이메일이면 서버 사유를 보여준다', async () => {
    mockSignUp.mockRejectedValue(
      new ApiError('이미 가입된 이메일이에요.', { status: 409, code: 'EMAIL_ALREADY_EXISTS' })
    );
    const { getByLabelText, getByRole, findByText } = await render(
      <SignupScreen navigation={navigation} />
    );

    await fireEvent.changeText(getByLabelText('이메일'), 'dup@test.local');
    await fireEvent.changeText(getByLabelText('비밀번호'), 'password1234');
    await fireEvent.changeText(getByLabelText('닉네임'), '중복');
    await fireEvent.press(getByRole('button', { name: '회원가입' }));

    expect(await findByText('이미 가입된 이메일이에요.')).toBeTruthy();
  });
});
