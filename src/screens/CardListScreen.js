import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/color';
import { getCards, deleteCard } from '../database/cardOperations'; // deleteCard 추가됨

export default function CardListScreen({ route, navigation }) {
  const { deckId, deckTitle } = route.params;
  const [cards, setCards] = useState([]);

  // 화면 제목 설정 및 우측 상단 '학습 시작' 버튼
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: deckTitle,
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Study', { deckId: deckId })}>
          <Text style={{ color: colors.primary, fontWeight: 'bold', marginRight: 10 }}>
            학습 시작
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, deckId, deckTitle]);

  // 화면 포커스 시 목록 로드
  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [])
  );

  const loadCards = async () => {
    const data = await getCards(deckId);
    setCards(data);
  };

  // [추가됨] 카드 삭제 핸들러
  const handleDeleteCard = (id) => {
    Alert.alert(
      "카드 삭제",
      "이 카드를 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "삭제", 
          style: "destructive", 
          onPress: async () => {
            await deleteCard(id); // DB 삭제
            loadCards(); // 목록 새로고침
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.cardItem}
            // [추가됨] 길게 누르면 삭제
            onLongPress={() => handleDeleteCard(item.id)}
            delayLongPress={500}
          >
            <Text style={styles.frontText}>Q: {item.front_text}</Text>
            <Text style={styles.backText}>A: {item.back_text}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>카드가 없습니다. 추가해주세요!</Text>}
      />

      {/* 우측 하단 플로팅 버튼 (FAB) */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CardEditor', { deckId: deckId })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  cardItem: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 8 },
  frontText: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  backText: { fontSize: 14, color: '#555' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: colors.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: {width:0, height:2} },
  fabText: { color: 'white', fontSize: 30, marginTop: -2 }
});