import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet, Alert} from 'react-native';
import { createCard } from '../api';

export default function CardEditorScreen({route, navigation}) {
    const {deckId} = route.params;
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');

    const handleSave = async () => {
        if (!front || !back) {
            Alert.alert('알림', '앞면과 뒷면 내용을 모두 입력해주세요.');
            return;
        }
        const result = await createCard(deckId, front, back);

        if (result) {
            navigation.goBack();
        } else {
            Alert.alert("오류", "카드 저장 중 문제가 발생했습니다.");
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
            style={styles.input}
            placeholder="문제 (앞면)"
            value={front}
            onChangeText={setFront}
            multiline // 여러 줄 입력 가능
            />
            <TextInput
            style={[styles.input, {height:100}]}
            placeholder="정답 (뒷면)"
            value={back}
            onChangeText={setBack}
            multiline
            />
            <Button title="저장하기" onPress={handleSave}/>
        </View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  input: {
    borderWidth: 1, borderColor: '#ddd', padding: 15,
    borderRadius: 10, marginBottom: 20, fontSize: 16,
    textAlignVertical: 'top' // 멀티라인일 때 글자 위쪽 정렬
  }
});