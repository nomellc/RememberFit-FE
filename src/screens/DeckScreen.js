import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Button, TextInput, FlatList, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {colors} from '../theme/color';

// DB 함수 가져오기
import {createDeck, db} from '../database/deckOperations';

export default function DeckScreen() {
    const [text, setText] = useState(''); // 입력창의 글자 상태
    const [decks, setDecks] = useState([]); // 화면에 보여줄 덱 리스트

    // 화면 처음 켜질 때 덱 목록 불러오기
    useEffect(() =>{
        loadDecks();
    }, []);

    // DB에서 목록 불러오기 함수
    const loadDecks = async () => {
        const data = await getDecks();
        setDecks(data);
    };

    // 추가 버튼 눌렀을 때 실행할 함수
    const handleAddDeck = async () => {
        if (text.trim() === '') return; // 빈칸이면 무시

        try {
            await createDeck(text); // 덱 생성
            setText(''); // 입력창 초기화
            loadDecks(); // 목록 새로고침
        } catch (error) {
            console.log('덱 추가 실패:', error);
        }
    };

    return (
         <SafeAreaView style={styles.container}>
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput 
                style={styles.input}
                placeholder="새 덱 이름"
                value={text}
                onChangeText={setText}
                />
                <Button title="추가" onPress={handleAddDeck}/>
            </View>

            <FlatList
            data={decks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item}) => (
                <View style={styles.deckItem}>
                    <Text style={styles.deckTitle}>{item.title}</Text>
                </View>
            )}
            />
        </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  inputContainer: { 
    flexDirection: 'row', marginBottom: 20, alignItems: 'center' 
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#ccc', 
    padding: 10, marginRight: 10, borderRadius: 5, backgroundColor: 'white'
  },
  deckItem: {
    padding: 20, backgroundColor: 'white', 
    marginBottom: 10, borderRadius: 10,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3
  },
  deckTitle: { fontSize: 18, fontWeight: 'bold' }
});