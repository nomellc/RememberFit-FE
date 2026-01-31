import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/color';
import { getHomeStats, getDecks } from '../api';

export default function HomeScreen({navigation}) {
  // 상태 관리
  const [stats, setStats] = useState({review: 0, new: 0, done: 0});
  const [recentDecks, setRecentDecks] = useState([]);

  // 화면이 포커스될 때마다 실행(새로고침)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const statData = await getHomeStats();
    setStats(statData || {newCount: 0, reviewCount: 0, doneCount: 0});

    const decks = await getDecks();
    setRecentDecks(decks.slice(0,3));
  };

    return (
        // SafeAreaViewBase: 아이폰 노치 영역 침범 방지
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                {/* 헤더 */}
        <View style={styles.header}>
            <Text style={styles.greeting}>안녕하세요, 학습자님 👋</Text>
            <Text style={styles.subGreeting}>오늘도 힘내서 공부해봅시다!</Text>
        </View>

        {/* 학습 현황 (박스 3개) */}
        <View style={styles.statusContainer}>
           <View style={styles.statusCard}>
            <Text style={[styles.statusCount, {color: colors.primary}]}>{stats.newCount}</Text>
            <Text style={styles.statusLabel}>New</Text>
           </View>
           <View style={styles.statusCard}>
            <Text style={[styles.statusCount, {color:colors.danger}]}>{stats.reviewCount}</Text>
            <Text style={styles.statusLabel}>Review</Text>
           </View>
            <View style={styles.statusCard}>
              <Text style={[styles.statusCount, {color: colors.success}]}>{stats.doneCount}</Text>
              <Text style={styles.statusLabel}>Done</Text>
            </View>
        </View>

        {/* 오늘의 학습 시작 버튼 */}
        <TouchableOpacity style={styles.heroButton} onPress={() => navigation.navigate('Decks', {screen: 'DeckList'})}>
            <Text style={styles.heroTitle}>▶ 오늘의 학습 시작하기</Text>
            <Text style={styles.heroSubtitle}>{stats.reviewCount > 0 ?  `총 ${stats.reviewCount}장의 카드가 기다리고 있어요.` : `복습 끝! 새 카드를 학습해보세요.`}</Text>
        </TouchableOpacity>

        {/* 최근 학습한 덱 목록 */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 학습한 덱</Text>
        </View>

        {recentDecks.length === 0 && (
          <Text style={{color: '#999', marginTop: 10}}>아직 생성된 덱이 없습니다.</Text>
        )}

        {recentDecks.map((deck) => (
            <TouchableOpacity key={deck.id} style={styles.deckRow} onPress={() => navigation.navigate('Decks', {
              screen: 'CardList',
              params: {deckId: deck.id, deckTitle: deck.title}
            })}>
                <View style={styles.deckInfo}>
                    <Text style={styles.deckTitle}>{deck.title}</Text>
                    <Text style={styles.deckCount}>{deck.cardCount !== undefined ? `총 ${deck.cardCount}장` : '터치해서 이동'}</Text>
                </View>
            </TouchableOpacity>
        ))}

        {/* 하단 여백 */}
        <View style={{height: 20}}/>
        </ScrollView>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20 },
  header: { marginBottom: 20, marginTop: 10 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 5 },
  subGreeting: { fontSize: 14, color: '#FF9500', fontWeight: '600' },
  statusContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statusCard: { backgroundColor: 'white', width: '30%', padding: 15, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2 },
  statusCount: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  statusLabel: { fontSize: 12, color: '#666' },
  heroButton: { backgroundColor: colors.primary, padding: 25, borderRadius: 16, alignItems: 'center', marginBottom: 30, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  heroTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  heroSubtitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  deckRow: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  deckTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  deckCount: { fontSize: 12, color: '#999', marginTop: 4 },
});