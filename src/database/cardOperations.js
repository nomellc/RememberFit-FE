import {db} from './database';

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
        const cards = await db.getAllAsync(
            'SELECT * FROM cards WHERE deck_id = ?', [deckId]
        );
        return cards;
    } catch(error) {
        console.error('학습 카드 로딩 실패: ', error);
        return [];
    }
};