import {db} from './database';

// 카드 학습 결과 업데이트
export const updateCardStatus = async (cardId, interval, repetition, easeFactor, nextDate) => {
    try {
        await db.runAsync(
            `INSERT OR REPLACE INTO study_logs
        (card_id, interval, repetition, ease_factor, next_review_date)
        VALUES (?, ?, ?, ?, ?)`,
        [cardId, interval, repetition, easeFactor, nextDate]
        );

        console.log(`카드 ${cardId} 업데이트 완료: 다음 복습은 ${nextDate}`);
    } catch (error) {
        console.error('학습 기록 저장 실패: ', error);
    }
};