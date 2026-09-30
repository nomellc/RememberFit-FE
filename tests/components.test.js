import React from 'react';
import { Animated, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import EmptyState from '../src/components/EmptyState';
import FeedbackPressable from '../src/components/FeedbackPressable';
import RequestErrorState from '../src/components/RequestErrorState';
import { colors } from '../src/theme/color';

describe('공통 상태 컴포넌트', () => {
  test('빈 상태의 제목과 실행 버튼을 접근 가능한 이름으로 제공한다', async () => {
    const onAction = jest.fn();

    const { getByRole } = await render(
      <EmptyState
        title="첫 카드를 추가해보세요"
        description="질문과 답을 한 장씩 쌓아보세요."
        actionLabel="카드 추가"
        onAction={onAction}
      />
    );

    expect(getByRole('header', { name: '첫 카드를 추가해보세요' })).toBeTruthy();
    await fireEvent.press(getByRole('button', { name: '카드 추가' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  test('요청 실패 원인과 다시 시도 동작을 노출한다', async () => {
    const onRetry = jest.fn();

    const { getByRole, getByText } = await render(
      <RequestErrorState
        error={{ code: 'NETWORK_ERROR', message: '서버에 연결할 수 없어요.' }}
        onRetry={onRetry}
      />
    );

    expect(getByRole('header', { name: '서버에 연결할 수 없어요' })).toBeTruthy();
    expect(getByText(/연결 주소: http:\/\//)).toBeTruthy();
    await fireEvent.press(getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('학습 화면 색상', () => {
  test('브랜드 녹색은 유지하고 쉬움은 별도의 파란색으로 구분한다', () => {
    expect(colors.primary).toBe('#315C4C');
    expect(colors.background).toBe('#F4F1E8');
    expect(colors.easy).toBe('#2858A6');
  });
});

describe('버튼 반응', () => {
  test('호버와 터치에 짧은 색 전환을 적용하고 누름 동작은 유지한다', async () => {
    const onPress = jest.fn();
    const animation = jest.spyOn(Animated, 'timing').mockReturnValue({ start: jest.fn() });

    try {
      const { getByRole } = await render(
        <FeedbackPressable
          accessibilityLabel="학습 시작"
          baseColor="#315C4C"
          hoverColor="#254C3D"
          onPress={onPress}
          pressedColor="#1D4033"
        >
          <Text>학습 시작</Text>
        </FeedbackPressable>
      );
      const button = getByRole('button', { name: '학습 시작' });

      await fireEvent(button, 'hoverIn');
      expect(animation).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ toValue: 1, duration: 150, useNativeDriver: false })
      );
      await fireEvent(button, 'pressIn');
      expect(animation).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ toValue: 2, duration: 150, useNativeDriver: false })
      );
      await fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    } finally {
      animation.mockRestore();
    }
  });
});
