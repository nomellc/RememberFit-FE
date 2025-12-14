import React, {useState, useRef} from 'react';
import {View, Text, StyleSheet, TouchableWithoutFeedback, Dimensions, Animated} from 'react-native';
import {colors} from '../theme/color';

export default function StudyScreen({route, navigation}) {
    // CardListScreen에서 넘겨준 카드 데이터 (임시)
    const tempCard = {
        front: "Apple",
        back: "사과"
    };

    // 1. 애니메이션 값 (0: 앞면, 1: 뒷면)
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [isFlipped, setIsFlipped] = useState(false); // 현재 뒤집혔는지 상태

    // 2. 뒤집기 함수
    const handleFlip = () => {
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

    // 3. 앞면 각도 계산 (0 -> 180도)
    const frontInterpolate = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    // 4. 뒷면 각도 계산 (180 -> 360도)
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
                        <Text style={styles.cardText}>{tempCard.front}</Text>
                        <Text style={styles.hint}>터치해서 정답 확인</Text>
                    </Animated.View>
                    {/* 뒷면 카드 */}
                    <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
                        <Text style={styles.cardText}>{tempCard.back}</Text>
                        <View style={styles.buttonContainer}>
                            <Text style={styles.hint}>평가 버튼 영역</Text>
                        </View>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background || '#F5F5F5',
    alignItems: 'center', justifyContent: 'center',
  },
  progress: {
    position: 'absolute', top: 50, fontSize: 18, fontWeight: 'bold'
  },
  cardContainer: {
    width: width * 0.85, height: 400,
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    position: 'absolute', width: '100%', height: '100%',
    backgroundColor: 'white', borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  cardFront: { backgroundColor: 'white' },
  cardBack: { backgroundColor: '#F0F8FF' }, 
  cardText: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  hint: { marginTop: 20, color: '#999', fontSize: 14 },
});