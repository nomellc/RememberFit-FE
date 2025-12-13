import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Button} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/color';

// 데미 데이터
const STATUS_DATA = [
    {label: 'New', count: 12, color: colors.primary},
    {label: 'Review', count: 5, color: colors.danger},
    {label: 'Learning', count: 8, color: colors.success},
];

const RECENT_DECKS = [
    {id: 1, title: 'CS 면접 대비', count: 5},
    {id: 2, title: '일본어 기초', count: 10},
    {id:3, title: '정보처리기사 실기', count: 0},
];

export default function HomeScreen({navigation}) {
    return (
        // SafeAreaViewBase: 아이폰 노치 영역 침범 방지
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.container}>
                {/* 섹션 1: 헤더 */}
        <View style={styles.header}>
            <Text style={styles.greeting}>안녕하세요, 학습자님 👋</Text>
            <Text style={styles.subGreeting}>🔥 5일 연속 학습 중!</Text>
        </View>

        {/* 섹션 2: 학습 현황 (박스 3개) */}
        <View style={styles.statusContainer}>
            {STATUS_DATA.map((item, index) => (
                <View key={index} style={styles.statusCard}>
                    <Text style={[styles.statusCount, {color: item.color}]}>{item.count}</Text>
                    <Text style={[styles.statusLabel]}>{item.label}</Text>
                </View>
            ))}
        </View>

        {/* 섹션 3: 오늘의 학습 시작 버튼 */}
        <TouchableOpacity style={styles.heroButton} onPress={() => alert('학습 기능')}>
            <Text style={styles.heroTitle}>▶ 오늘의 학습 시작하기</Text>
            <Text style={styles.heroSubtitle}>총 n개의 카드가 기다리고 있어요.</Text>
        </TouchableOpacity>

        {/* 섹션 4: 최근 학습한 덱 목록 */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 학습한 덱</Text>
        </View>

        {RECENT_DECKS.map((deck) => (
            <TouchableOpacity key={deck.id} style={styles.deckRow}>
                <View style={styles.deckInfo}>
                    <Text style={styles.deckTitle}>{deck.title}</Text>
                    <Text style={styles.deckCount}>잔여: {deck.count}장</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20, // 양옆 위아래 여백
  },
  
  // 헤더 스타일
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  subGreeting: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
  },

  // 상태 카드 스타일
  statusContainer: {
    flexDirection: 'row', // 가로로 배치
    justifyContent: 'space-between', // 사이 간격 균등하게
    marginBottom: 30,
  },
  statusCard: {
    backgroundColor: colors.white,
    width: '30%', // 3개니까 30%씩
    padding: 15,
    borderRadius: 12,
    alignItems: 'center', // 텍스트 가운데 정렬
    // 그림자 효과 (iOS & Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 2, 
  },
  statusCount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.subText,
  },

  // 메인 액션 버튼
  heroButton: {
    backgroundColor: colors.primary,
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    // 그림자
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)', // 반투명 흰색
    fontSize: 14,
  },

  // 최근 덱 리스트
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  deckRow: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deckTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  deckCount: {
    fontSize: 12,
    color: colors.subText,
    marginTop: 4,
  },
});