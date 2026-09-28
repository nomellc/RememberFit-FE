const test = require('node:test');
const assert = require('node:assert/strict');
const { filterCards, normalizeSearchText } = require('../src/utils/cardSearch');

const cards = [
  { id: 1, frontText: 'Accommodate', backText: '수용하다' },
  { id: 2, frontText: 'Resilient', backText: '회복력이 있는' },
  { id: 3, frontText: '망각 곡선', backText: 'Ebbinghaus curve' },
];

test('normalizes surrounding whitespace and letter case', () => {
  assert.equal(normalizeSearchText('  ReMeMbEr  '), 'remember');
});

test('searches both sides of a card without changing the source order', () => {
  assert.deepEqual(filterCards(cards, '회복력').map((card) => card.id), [2]);
  assert.deepEqual(filterCards(cards, 'curve').map((card) => card.id), [3]);
  assert.deepEqual(filterCards(cards, 'ACCOMMODATE').map((card) => card.id), [1]);
});

test('returns the original list for an empty query', () => {
  assert.equal(filterCards(cards, '   '), cards);
});

test('handles incomplete card data safely', () => {
  assert.deepEqual(filterCards([{ id: 1, frontText: null }], 'null'), []);
});
