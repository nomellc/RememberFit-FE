import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors } from '../theme/color';
import { getCards, createCard } from '../api';

export default function CardListScreen({ route, navigation }) {
  const { deckId, deckTitle } = route.params;
  const [cards, setCards] = useState([]);

  useEffect(() => {
    loadCards();
  }, []);

  /// [수정] 화면이 포커스될 때마다 새로고침 (카드가 추가됐을 수 있으니)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCards();
    });
    return unsubscribe;
  }, [navigation]);

  // 서버에서 카드 목록 가져오기
  const loadCards = async () => {
    const data = await getCards(deckId);
    setCards(data);
  };

  // 카드 추가 화면으로 이동
  const goToAddCard = () => {
    navigation.navigate('CardEditor', { 
      deckId: deckId,
      onSave: async (front, back) => {
        // 서버에 카드 저장 요청
        await createCard(deckId, front, back);
        loadCards(); // 목록 갱신
      }
    });
  };

  // 학습 시작 버튼 설정
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: deckTitle,
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Study', { deckId: deckId })}>
          <Text style={{ color: colors.primary, fontWeight: 'bold', marginRight: 10 }}>학습 시작</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, deckId, deckTitle]);

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardItem}>
            {/* [중요] 서버 데이터 변수명: frontText, backText */}
            <Text style={styles.frontText}>{item.frontText}</Text>
            <Text style={styles.backText}>{item.backText}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>카드가 없습니다. 추가해주세요!</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={goToAddCard}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  cardItem: { backgroundColor: 'white', padding: 20, marginHorizontal: 20, marginTop: 15, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 1 },
  frontText: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  backText: { fontSize: 16, color: '#666' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
  fab: { position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, backgroundColor: colors.primary, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, elevation: 5 },
  fabText: { color: 'white', fontSize: 30, fontWeight: 'bold', marginTop: -2 },
});