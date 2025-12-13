import {db} from './database';

// 1. 덱 생성하기 (Create)
export const createDeck = async (title) => {
    try {
        // runAsync: 결과를 반환받지 않는 명령어(INSERT, UPDATE, DELETE)에 사용
        // ? : SQL Injection 방지를 위한 파라미터 바인딩
        const result = await db.runAsync(
            'INSERT INTO decks (title) VALUES (?)',
            [title]
        );

        console.log('덱 생성 완료 ID:', result.lastInsertRowId);
        return result.lastInsertRowId; // 생성된 덱의 ID 반환
    } catch (error) {
        console.log('덱 생성 실패: ', error);
        throw error;
    }
};

// 2. 모든 덱 가져오기 (Read)
export const getDecks = async () => {
    try {
        // getAllAsync: 여러 줄의 데이터를 가져올 때 사용 (SELECT)
        const decks = await db.getAllAsync('SELECT * FROM decks ORDER BY id DESC');
        return decks;
    } catch (error) {
        console.log('덱 목록 가져오기 실패: ', error);
        return [];
    }
};