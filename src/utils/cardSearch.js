const normalizeSearchText = (value) => String(value ?? '').trim().toLocaleLowerCase('ko-KR');

const filterCards = (cards, query) => {
  const keyword = normalizeSearchText(query);
  if (!keyword) return cards;

  return cards.filter((card) =>
    normalizeSearchText(`${card.frontText ?? ''} ${card.backText ?? ''}`).includes(keyword)
  );
};

module.exports = { filterCards, normalizeSearchText };
