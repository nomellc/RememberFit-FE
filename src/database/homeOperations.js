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