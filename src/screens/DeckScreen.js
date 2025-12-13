import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>덱 화면</Text>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        alignItems: 'center', 
        justifyContent:'center',
    backgroundColor: '#fff'},
    title: {fontSize: 24, 
        fontWeight: 'bold',
        marginBottom: 10},
});