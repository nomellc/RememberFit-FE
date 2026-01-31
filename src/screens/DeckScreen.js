import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/color';

// deleteDeck 추가됨
import { getDecks, createDeck, deleteDeck } from "../api";

export default function DeckScreen({ navigation }) {
    const [decks, setDecks] = useState([]);
    const [newDeckTitle, setNewDeckTitle] = useState('');

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
        if (newDeckTitle.trim() === '') return;
        
        await createDeck(newDeckTitle);
        setNewDeckTitle('');
        loadDecks();
    };

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
                        await deleteDeck(id); 
                        loadDecks(); 
                    }
                }
            ]
        );
    };

    const renderItem = ({item}) => (
        <TouchableOpacity
            style={styles.deckItem}
            onPress={() => navigation.navigate('CardList', { deckId: item.id, deckTitle: item.title })}
            onLongPress={() => handleDelete(item.id)}
        >
            <View>
                <Text style={styles.deckTitle}>{item.title}</Text>
                <Text style={styles.deckCount}>
                    {item.cardCount !== undefined ? `${item.cardCount} Cards` : 'Cards'}
                </Text>
            </View>
        </TouchableOpacity>
    )

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>나의 덱 목록</Text>
            </View>
            
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="새로운 덱 이름 입력"
                    value={newDeckTitle}
                    onChangeText={setNewDeckTitle}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddDeck}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={decks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>등록된 덱이 없습니다.</Text>}
            />
        </KeyboardAvoidingView>
    );    
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, paddingTop: 60, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  listContent: { padding: 20, paddingBottom: 20 },
  deckItem: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2 },
  deckTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  deckCount: { fontSize: 14, color: '#888', marginTop: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 20, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  input: { flex: 1, backgroundColor: '#f5f5f5', padding: 15, borderRadius: 30, marginRight: 10, fontSize: 16 },
  addButton: { width: 50, height: 50, backgroundColor: colors.primary, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
});