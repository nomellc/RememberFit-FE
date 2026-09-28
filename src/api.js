import { API_CONFIG } from './config/environment';

const { ApiError, createApiClient } = require('./api/client');

const { request } = createApiClient(API_CONFIG);

const jsonOptions = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export { ApiError };

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
