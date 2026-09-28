import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import EmptyState from '../src/components/EmptyState';
import RequestErrorState from '../src/components/RequestErrorState';

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
    fireEvent.press(getByRole('button', { name: '카드 추가' }));
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

    expect(getByText(/서버에 연결할 수 없어요/)).toBeTruthy();
    expect(getByText(/연결 주소: http:\/\//)).toBeTruthy();
    fireEvent.press(getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
