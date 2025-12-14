import React, {useState, useRef, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableWithoutFeedback, Dimensions, Animated, TouchableOpacity} from 'react-native';
import {colors} from '../theme/color';
import { getCardsForStudy } from '../database/cardOperations';
import { updateCardStatus } from '../database/studyOperations';
import { calculateSM2 } from '../utils/sm2';
import {format, addDays} from 'date-fns';

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
        const data = await getCardsForStudy(deckId);
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

        // 알고리즘 계산
        // DB에서 가져온 값이 없으면 기본값(0, 0, 25) 사용
        const {interval, repetition, ef} = calculateSM2(
            quality,
            currentCard.interval || 0,
            currentCard.repetition || 0,
            currentCard.ease_factor || 2.5
        );

        // 다음 복습 날짜 계산 (오늘 + interval일)
        const nextDate = format(addDays(new Date(), interval), 'yyyy-mm-dd');

        // DB 업데이트 (비동기 처리)
        await updateCardStatus(currentCard.id, interval, repetition, ef, nextDate);

        // 애니메이션 및 다음 카드로 이동 (기존 코드 유지)
        Animated.timing(animatedValue, {toValue: 0, duration: 0, useNativeDriver: true}).start();
        setIsFlipped(false);

        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            alert('오늘의 학습 끝! 수고하셨습니다 👏');
            navigation.goBack();
        }
    };

    // 4. 데이터 로딩 중이거나 카드가 없을 때 처리
    if (cards.length === 0) {
        return (
            <View style={styles.container}>
                <Text>학습할 카드가 없습니다. 카드를 추가해주세요!</Text>
            </View>
        );
    };

    // 현재 보여줄 카드
    const currentCard = cards[currentIndex];

    // 앞면 각도 계산 (0 -> 180도)
    const frontInterpolate = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    // 뒷면 각도 계산 (180 -> 360도)
    const backInterpolate = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '360deg'],
    });

    // 스타일 객체
    const frontAnimatedStyle = {
        transform: [{rotateY: frontInterpolate}]
    };
    const backAnimatedStyle = {
        transform: [{rotateY: backInterpolate}]
    };

    return (
        <View style={styles.container}>
            <Text style={styles.progress}>1 / 5</Text>

            <TouchableWithoutFeedback onPress={handleFlip}>
                <View style={styles.cardContainer}>
                    {/* 앞면 카드 */}
                    <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
                        <Text style={styles.cardText}>{currentCard.front_text}</Text>
                        <Text style={styles.hint}>터치해서 정답 확인</Text>
                    </Animated.View>
                    {/* 뒷면 카드 */}
                    <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                        <Text style={styles.cardText}>{currentCard.back_text}</Text>

                        {/* 평가 버튼 영역 (카드 안에 배치) */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.btn, styles.btnAgain]} onPress={() => handleRate(1)}>
                                <Text style={styles.btnText}>몰라요</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnHard]} onPress={() => handleRate(2)}>
                                <Text style={styles.btnText}>어려움</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnGood]} onPress={() => handleRate(3)}>
                                <Text style={styles.btnText}>알맞음</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnEasy]} onPress={() => handleRate(4)}>
                                <Text style={styles.btnText}>쉬워요</Text>
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
  
  // 버튼 스타일
  buttonRow: { flexDirection: 'row', position: 'absolute', bottom: 20, width: '90%', justifyContent: 'space-between' },
  btn: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, minWidth: 60, alignItems: 'center' },
  btnAgain: { backgroundColor: '#FF3B30' },
  btnHard: { backgroundColor: '#FF9500' },
  btnGood: { backgroundColor: '#34C759' },
  btnEasy: { backgroundColor: '#007AFF' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 12 }
});