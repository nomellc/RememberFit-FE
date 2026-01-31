const BASE_URL = "http://{computer IP}:8080/api";

// 덱 생성하기
export const createDeck = async (title) => {
    try {
        const response = await fetch(`${BASE_URL}/decks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({title: title}),
        });
        return await response.text();
    } catch (error) {
        console.error("서버 연결 실패:", error);
        return null;
    }
};

// 덱 목록 가져오기
export const getDecks = async () => {
    try {
        const response = await fetch(`${BASE_URL}/decks`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("덱 로딩 실패: ", error);
        return [];
    }
};

// 덱 삭제하기
export const deleteDeck = async (deckId) => {
    try {
        const response = await fetch(`${BASE_URL}/decks/${deckId}`, {
            method: 'DELETE',
        });
        return await response.text();
    } catch (error) {
        console.error("덱 삭제 실패:", error);
        return null;
    }
};

// 특정 덱의 전체 카드 가져오기
export const getCards = async (deckId) => {
    try {
        const response = await fetch(`${BASE_URL}/decks/${deckId}/cards`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("카드 로딩 실패:", error);
        return [];
    }
};

// 카드 생성하기
export const createCard = async (deckId, frontText, backText) => {
    try {
        const response = await fetch(`${BASE_URL}/decks/${deckId}/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                frontText: frontText,
                backText: backText
            }),
        });
        if (!response.ok) {
            const errorText = await response.text(); // 서버가 보낸 에러 메시지 읽기
            throw new Error(errorText || 'Server Error');
        }
        return await response.text();
    } catch (error) {
        console.error("카드 생성 실패:", error);
        return null;
    }
};

// 오늘 학습할 카드 가져오기
export const getDueCards = async (deckId) => {
    try {
        const response = await fetch(`${BASE_URL}/decks/${deckId}/cards/due`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("학습 카드 로딩 실패:", error);
        return [];
    }
};

// 카드 점수 매기기
export const gradeCard = async (deckId, cardId, quality) => {
    try {
        const response = await fetch(`${BASE_URL}/decks/${deckId}/cards/${cardId}/grade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({quality: quality}),
        });
        return await response.text();
    } catch (error) {
        console.error("채점 실패:",error);
        return null;
    }
};

// 홈 화면 통계
export const getHomeStats = async () => {
    try {
        const response = await fetch(`${BASE_URL}/home/stats`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("통계 로딩 실패:", error);
        return {newCount: 0, reviewCount: 0, doneCount: 0};
    }
};