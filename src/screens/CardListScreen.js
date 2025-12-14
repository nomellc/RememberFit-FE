import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import { useIsFocused} from '@react-navigation/native';
import { getCards } from '../database/cardOperations';
import { colors } from '../theme/color';

export default function CardListScreen({route, navigation}) {
    const {deckId, deckTitle} = route.params; // 넘겨받은 덱 정보
    const [cards, setCards] = useState([]);
    const IsFocused = useIsFocused(); // 화면이 다시 보일 때 감지

    useEffect(() => {
        // 화면 제목을 덱 이름으로 설정
        navigation.setOptions({title:deckTitle});

        if (IsFocused) {
            loadCards();
        }
    }, [IsFocused]);

    const loadCards = async () => {
        const data = await getCards(deckId);
        setCards(data);
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Study', {deckId: deckId})}>
                    <Text style={{color: colors.primary, fontWeight: 'bold', marginRight: 10}}>
                    학습 시작
                    </Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, deckId]);

    return (
        <View style={styles.container}>
            <FlatList
            data={cards}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item}) => (
                <View style={styles.cardItem}>
                    <Text style={styles.frontText}>Q: {item.front_text}</Text>
                    <Text style={styles.frontText}>A: {item.back_text}</Text>
                </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>카드가 없습니다. 추가해주세요!</Text>}
            />

            <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('CardEditor', {deckId: deckId})}
            >
                <Text styles={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  cardItem: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 8 },
  frontText: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  backText: { fontSize: 14, color: '#555' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
  // 플로팅 버튼 스타일
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    backgroundColor: colors.primary, width: 56, height: 56,
    borderRadius: 28, justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: {width:0, height:2}
  },
  fabText: { color: 'white', fontSize: 30, marginTop: -2 }
});