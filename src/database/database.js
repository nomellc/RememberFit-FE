import * as SQLite from 'expo-sqlite';

// 1. DB 열기
const db = SQLite.openDatabaseSync('rememberfit.db');

// 2. 테이블 초기화 함수
export const initDB = async () => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS decks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL);

        CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deck_id INTEGER NOT NULL,
        front_text TEXT NOT NULL,
        back_text TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP);

        CREATE TABLE IF NOT EXISTS study_logs (
        card_id INTEGER PRIMARY KEY,
        interval INTEGER,
        repetition INTEGER,
        ease_factor REAL,
        next_review_date TEXT,
        FOREIGN KEY (card_id) REFERENCES cards(id));
      `);
      console.log("DB 초기화 및 테이블 생성 완료");
  } catch(error) {
      console.log("DB 초기화 실패: ", error);
    }
};

export {db};