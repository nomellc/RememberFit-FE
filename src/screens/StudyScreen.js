import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Dimensions, Animated, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/color';
import { getDueCards,gradeCard } from '../api';

export default function StudyScreen({route, navigation}) {
    const {deckId} = route.params; // 덱 목록에서 넘겨준 ID
    
    const [cards, setCards] = useState([]); // 전체 카드 리스트
    const [currentIndex, setCurrentIndex] = useState(0); // 현재 보고 있는 카드 번호
    const [isFlipped, setIsFlipped] = useState(false); // 현재 뒤집혔는지 상태

    // 애니메이션 값 (0: 앞면, 1: 뒷면)
    const animatedValue = useRef(new Animated.Value(0)).current;

    // 1. 화면이 켜지면 DB에서 카드 가져오기
    useEffect(() => {
        loadStudyCards();
    }, []);

    const loadStudyCards = async () => {
        const data = await getDueCards(deckId);
        setCards(data);
    }

    // 2. 뒤집기 함수
    const handleFlip = () => {
        if (cards.length === 0) return;

        if (isFlipped) {
            // 뒷면 -> 앞면으로 (0으로 돌아감)
            Animated.spring(animatedValue, {
                toValue: 0,
                friction: 8, // 튕김 정도(스프링 효과)
                tension: 10,
                useNativeDriver: true, // 성능 최적화 필수 옵션
            }).start();
            setIsFlipped(false);
        } else {
            // 앞면 -> 뒷면으로 (1로 이동)
            Animated.spring(animatedValue, {
                toValue: 1,
                friction: 8,
                tension: 10,
                useNativeDriver: true,
            }).start();
            setIsFlipped(true);
        }
    };

    // 3. 난이도 버튼 눌렀을 때 (다음 카드로 이동)
    const handleRate = async (quality) => {
        const currentCard = cards[currentIndex];

        await gradeCard(deckId, currentCard.id, quality);

        Animated.timing(animatedValue, {toValue: 0, duration: 0, useNativeDriver: true}).start();
        setIsFlipped(false);

        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            Alert.alert('학습 완료', '오늘의 학습을 마쳤습니다! 👏', [
                {text: '확인', onPress: () => navigation.goBack()}
            ]);
        }
    };

    // 4. 데이터 로딩 중이거나 카드가 없을 때 처리
    if (cards.length === 0) {
        return (
            <View style={styles.container}>
                <Text>오늘 복습할 카드가 없습니다! 🎉</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>돌아가기</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // 현재 보여줄 카드
    const currentCard = cards[currentIndex];

    // 애니메이션 스타일
    const frontInterpolate = animatedValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
    const backInterpolate = animatedValue.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
    const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
    const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }] };

    return (
    <View style={styles.container}>
      <Text style={styles.progress}>{currentIndex + 1} / {cards.length}</Text>

      <TouchableWithoutFeedback onPress={handleFlip}>
        <View style={styles.cardContainer}>
          {/* 앞면: [중요] 변수명 frontText 확인 */}
          <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
            <Text style={styles.cardText}>{currentCard.frontText}</Text>
            <Text style={styles.hint}>터치해서 정답 확인</Text>
          </Animated.View>

          {/* 뒷면: [중요] 변수명 backText 확인 */}
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <Text style={styles.cardText}>{currentCard.backText}</Text>
            
            {/* 평가 버튼 (서버로 보낼 점수 매핑) */}
            <View style={styles.buttonRow}>
                {/* Again(1점): 다시 보기 (서버 로직에 따라 처리됨)
                   Hard(3점): 어려움 
                   Good(4점): 알맞음
                   Easy(5점): 쉬움
                */}
                <TouchableOpacity style={[styles.btn, styles.btnAgain]} onPress={() => handleRate(1)}>
                    <Text style={styles.btnText}>몰라요</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnHard]} onPress={() => handleRate(3)}>
                    <Text style={styles.btnText}>어려움</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnGood]} onPress={() => handleRate(4)}>
                    <Text style={styles.btnText}>알맞음</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.btnEasy]} onPress={() => handleRate(5)}>
                    <Text style={styles.btnText}>쉬움</Text>
                </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  progress: { position: 'absolute', top: 50, fontSize: 18, fontWeight: 'bold' },
  cardContainer: { width: width * 0.85, height: 400, alignItems: 'center', justifyContent: 'center' },
  card: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'white', borderRadius: 20, alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  cardFront: { backgroundColor: 'white' },
  cardBack: { backgroundColor: '#F0F8FF' }, 
  cardText: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  hint: { marginTop: 20, color: '#999', fontSize: 14 },
  buttonRow: { flexDirection: 'row', position: 'absolute', bottom: 20, width: '90%', justifyContent: 'space-between' },
  btn: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, minWidth: 60, alignItems: 'center' },
  btnAgain: { backgroundColor: '#FF3B30' },
  btnHard: { backgroundColor: '#FF9500' },
  btnGood: { backgroundColor: '#34C759' },
  btnEasy: { backgroundColor: '#007AFF' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 12 }
});