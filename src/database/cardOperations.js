import {db} from './database';
import {format} from 'date-fns';

// 1. 특정 덱의 카드 가져오기 (Read)
export const getCards = async (deckId) => {
    try {
        const cards = await db.getAllAsync(
            'SELECT * FROM cards WHERE deck_id = ? ORDER BY id DESC',
            [deckId]
        );
        return cards;
    } catch (error) {
        console.log('카드 불러오기 실패: ', error);
        return [];
    }
};

// 2. 카드 추가하기 (Create)
export const addCard = async (deckId, front, back) => {
    try {
        const result = await db.runAsync(
            'INSERT INTO cards (deck_id, front_text, back_text) VALUES (?, ?, ?)',
            [deckId, front, back]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error('카드 생성 실패: ', error);
        throw error;
    }
};

// 3. 학습용 카드 가져오기
export const getCardsForStudy = async (deckId) => {
    try {
        const today = format(new Date(), 'yyyy-MM-dd'); // 오늘 날짜
        // study_logs가 아예 없는 카드 (새 카드)
        // OR study_logs가 있는데, next_review_date가 오늘보다 작거나 같은 카드 (복습 카드)
        const query = `
        SELECT c.*, COALESCE(s.interval, 0) as interval, COALESCE(s.repetition, 0) as repetition, COALESCE(s.ease_factor, 2.5) as ease_factor
        FROM cards c
        LEFT JOIN study_logs s ON c.id = s.card_id
        WHERE c.deck_id = ?
        AND (s.next_review_date IS NULL OR s.next_review_date <= ?)`;
        const cards = await db.getAllAsync(query, [deckId, today]);
        return cards;
    } catch(error) {
        console.error('학습 카드 로딩 실패: ', error);
        return [];
    }
};