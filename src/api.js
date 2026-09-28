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

export const deleteDeck = (deckId) =>
  request(`/decks/${deckId}`, { method: 'DELETE' });

export const getCards = (deckId) => request(`/decks/${deckId}/cards`);

export const createCard = (deckId, frontText, backText) =>
  request(
    `/decks/${deckId}/cards`,
    jsonOptions('POST', { frontText, backText })
  );

export const getDueCards = (deckId) =>
  request(`/decks/${deckId}/cards/due`);

export const gradeCard = (deckId, cardId, quality) =>
  request(
    `/decks/${deckId}/cards/${cardId}/grade`,
    jsonOptions('POST', { quality })
  );

export const getHomeStats = () => request('/home/stats');
