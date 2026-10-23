import { API_CONFIG } from './config/environment';
import { getAccessToken, handleTokenExpired } from './auth/session';

const { ApiError, createApiClient } = require('./api/client');

const { request } = createApiClient({
  ...API_CONFIG,
  getAccessToken,
  onTokenExpired: handleTokenExpired,
});

const jsonOptions = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// 토큰 없이 불러야 하는 입구들이다.
const publicJsonOptions = (method, body) => ({ ...jsonOptions(method, body), auth: false });

export { ApiError };

export const signup = (email, password, nickname) =>
  request('/auth/signup', publicJsonOptions('POST', { email, password, nickname }));

export const login = (email, password) =>
  request('/auth/login', publicJsonOptions('POST', { email, password }));

export const refreshSession = (refreshToken) =>
  request('/auth/refresh', publicJsonOptions('POST', { refreshToken }));

export const logout = () => request('/auth/logout', { method: 'POST' });

export const getMe = () => request('/auth/me');

export const createDeck = (title) =>
  request('/decks', jsonOptions('POST', { title }));

export const getDecks = () => request('/decks');

export const updateDeck = (deckId, title) =>
  request(`/decks/${deckId}`, jsonOptions('PATCH', { title }));

export const deleteDeck = (deckId) =>
  request(`/decks/${deckId}`, { method: 'DELETE' });

export const getCards = (deckId) => request(`/decks/${deckId}/cards`);

export const createCard = (deckId, frontText, backText) =>
  request(
    `/decks/${deckId}/cards`,
    jsonOptions('POST', { frontText, backText })
  );

export const updateCard = (deckId, cardId, frontText, backText) =>
  request(
    `/decks/${deckId}/cards/${cardId}`,
    jsonOptions('PATCH', { frontText, backText })
  );

export const deleteCard = (deckId, cardId) =>
  request(`/decks/${deckId}/cards/${cardId}`, { method: 'DELETE' });

export const getDueCards = (deckId) =>
  request(`/decks/${deckId}/cards/due`);

export const gradeCard = (deckId, cardId, quality) =>
  request(
    `/decks/${deckId}/cards/${cardId}/grade`,
    jsonOptions('POST', { quality })
  );

export const getStudyStatistics = () => request('/statistics/summary');

export const getStudyInsights = () => request('/statistics/insights');
