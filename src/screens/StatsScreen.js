import React, { useCallback, useState } from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/color';
import { db } from '../database/database';

export default function StatsScreen() {
    const [stats, setStats] = useState({
        totalCards: 0,
        memorized: 0,
        avgEase: 0
    });

    useFocusEffect(
        useCallback(() => {
            loadDetailedStats();
        }, [])
    );

    const loadDetailedStats = async () => {
        try {
            // 1. 전체 카드 수
            const totalResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM cards');

            // 2. 암기 중인 카드
            const memoResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM study_logs WHERE repetition > 0');

            // 3. 평균 난이도
            const easeResult = await db.getFirstAsync('SELECT AVG(ease_factor) as avg FROM study_logs');

            setStats({
                totalCards: totalResult?.count || 0,
                memorized: memoResult?.count || 0,
                avgEase: easeResult?.avg || 2.5
            });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.headerTitle}>학습 통계 📊</Text>
            {/* 요약 카드 */}
            <View style={styles.card}>
                <Text style={styles.label}>총 보유 카드</Text>
                <Text style={styles.value}>{stats.totalCards}장</Text>
            </View>

            <View style={styles.row}>
                <View style={[styles.card, styles.halfCard]}>
                    <Text style={styles.label}>암기 완료</Text>
                    <Text style={[styles.value, {color: colors.primary}]}>{stats.avgEase.toFixed(2)}</Text>
                    <Text style={styles.subText}>(기본 2.5)</Text>
                </View>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoBox}>
                    💡 망각 곡선을 이기는 유일한 방법은 '꾸준함'입니다.{"\n"}어제보다 더 똑똑해진 당신을 응원합니다!
                </Text>
            </View>
        </ScrollView>
    )
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCard: { width: '48%' },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  value: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  subText: { fontSize: 12, color: '#999', marginTop: 5 },
  infoBox: { backgroundColor: '#F0F8FF', padding: 15, borderRadius: 10, marginTop: 10 },
  infoText: { color: '#555', lineHeight: 20 }
});