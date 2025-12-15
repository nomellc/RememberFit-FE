import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Button, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/color';

// deleteDeck 추가됨
import { createDeck, getDecks, deleteDeck } from '../database/deckOperations';

export default function DeckScreen({ navigation }) {
    const [text, setText] = useState('');
    const [decks, setDecks] = useState([]);

    // 화면이 포커스될 때마다 목록 새로고침
    useFocusEffect(
        useCallback(() => {
            loadDecks();
        }, [])
    );

    const loadDecks = async () => {
        const data = await getDecks();
        setDecks(data);
    };

    const handleAddDeck = async () => {
        if (text.trim() === '') return;
        try {
            await createDeck(text);
            setText('');
            loadDecks();
        } catch (error) {
            console.log('덱 추가 실패:', error);
        }
    };

    // [추가됨] 덱 삭제 핸들러
    const handleDelete = (id) => {
        Alert.alert(
            "덱 삭제",
            "정말 삭제하시겠습니까?\n이 덱에 포함된 모든 카드도 함께 삭제됩니다.",
            [
                { text: "취소", style: "cancel" },
                { 
                    text: "삭제", 
                    style: "destructive", 
                    onPress: async () => {
                        await deleteDeck(id); // DB에서 삭제
                        loadDecks(); // 목록 새로고침
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
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
                        <TouchableOpacity
                            style={styles.deckItem}
                            // 짧게 누르면: 카드 목록 이동
                            onPress={() => navigation.navigate('CardList', {
                                deckId: item.id,
                                deckTitle: item.title
                            })}
                            // [추가됨] 길게 누르면: 삭제 알림창
                            onLongPress={() => handleDelete(item.id)}
                            delayLongPress={500} // 0.5초 누르면 실행
                        >
                            <Text style={styles.deckTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 20 },
  inputContainer: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, marginRight: 10, borderRadius: 5, backgroundColor: 'white' },
  deckItem: { padding: 20, backgroundColor: 'white', marginBottom: 10, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  deckTitle: { fontSize: 18, fontWeight: 'bold' }
});