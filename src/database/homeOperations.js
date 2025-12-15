import {db} from './database';
import { format } from 'date-fns';

export const getHomeStats = async () => {
    try {
        const today = format(new Date(), 'yyyy-MM-dd');

        // 1. 복습 예정 카드 수 (Review)
        const reviewResult = await db.getFirstAsync(
            `SELECT COUNT(*) as count FROM study_logs WHERE next_review_date <= ?`,
            [today]
        );

        // 2. 새 카드 수 (New)
        const newResult = await db.getFirstAsync(
            `SELECT COUNT(*) as count
            FROM cards c
            LEFT JOIN study_logs s ON c.id = s.card_id
            WHERE s.card_id IS NULL`
        );

        // 3. 완료된 카드 수 (Total Done)
        const doneResult = await db.getFirstAsync(
            `SELECT COUNT(*) as count FROM study_logs WHERE repetition > 0`
        );

        return {
            review: reviewResult?.count || 0,
            new: newResult?.count || 0,
            done: doneResult?.count || 0,
        };
    } catch (error) {
        console.error('홈 통계 로딩 실패: ', error);
        return {review: 0, new: 0, done: 0};
    }
};

export const getRecentDecks = async () => {
  try {
    // 덱 정보(d.*)와 그 덱에 속한 카드 수(count)를 가져옵니다.
    // ORDER BY d.id DESC LIMIT 3: 가장 최근에 만든 덱 3개만 가져옴
    const query = `
      SELECT d.id, d.title, COUNT(c.id) as count
      FROM decks d
      LEFT JOIN cards c ON d.id = c.deck_id
      GROUP BY d.id
      ORDER BY d.id DESC
      LIMIT 3
    `;
    
    const decks = await db.getAllAsync(query);
    return decks;
  } catch (error) {
    console.error('최근 덱 로딩 실패:', error);
    return [];
  }
};