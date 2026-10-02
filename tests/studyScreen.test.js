import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import StudyScreen from '../src/screens/StudyScreen';
import { getDueCards, gradeCard } from '../src/api';

jest.mock('../src/api', () => ({
  getDueCards: jest.fn(),
  gradeCard: jest.fn(),
}));

describe('학습 카드', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('앞면과 뒷면은 동일한 카드 영역을 빈틈없이 채운다', async () => {
    getDueCards.mockResolvedValue([
      { id: 1, frontText: '質問', backText: '질문' },
    ]);

    const screen = await render(
      <StudyScreen
        navigation={{ goBack: jest.fn() }}
        route={{ params: { deckId: 7, deckTitle: 'JLPT' } }}
      />
    );

    await screen.findByRole('button', { name: '질문: 質問' });
    for (const face of ['study-card-front', 'study-card-back']) {
      const card = screen.getByTestId(face, { includeHiddenElements: true });
      // A rendered Text node alone cannot catch collapsed native card faces.
      expect(StyleSheet.flatten(card.props.style)).toMatchObject({
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });
    }
    expect(screen.getByRole('button', { name: '질문: 質問' })).toBeTruthy();
  });

  test('뒷면 안에서 평가하고 다음 카드로 넘어간다', async () => {
    getDueCards.mockResolvedValue([
      { id: 1, frontText: 'resilient', backText: '회복력이 있는' },
      { id: 2, frontText: 'meticulous', backText: '꼼꼼한' },
    ]);
    gradeCard.mockResolvedValue({});
    const spring = jest.spyOn(Animated, 'spring').mockReturnValue({ start: jest.fn() });

    try {
      const screen = await render(
        <StudyScreen
          navigation={{ goBack: jest.fn() }}
          route={{ params: { deckId: 7, deckTitle: '영어 단어' } }}
        />
      );

      await fireEvent.press(await screen.findByRole('button', { name: '질문: resilient' }));
      expect(screen.getByRole('button', { name: '답: 회복력이 있는' })).toBeTruthy();

      await fireEvent.press(screen.getByRole('button', { name: '알맞음' }));
      await waitFor(() => {
        expect(gradeCard).toHaveBeenCalledWith(7, 1, 4);
        expect(screen.getByRole('button', { name: '질문: meticulous' })).toBeTruthy();
      });
    } finally {
      spring.mockRestore();
    }
  });
});
