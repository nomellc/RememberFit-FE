export const calculateSM2 = (quality, previousInterval, previousRepetition, previousEf) => {
    let interval, repetition, ef;

    if (quality >= 3) {
        // 3점 이상(정답)인 경우
        if (previousRepetition === 0) {
            interval = 1;
        } else if (previousRepetition === 1) {
            interval = 6;
        } else {
            interval = Math.round(previousInterval * previousEf);
        }
        repetition = previousRepetition + 1;
    } else {
        // 3점 미만(오답/Again)인 경우 -> 초기화
        interval = 1;
        repetition = 0;
    }

    // EF(난이도 계수) 업데이트 공식
    ef = previousEf + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // EF는 최소 1.3 밑으로 떨어지지 않게 제한
    if (ef < 1.3) {
        ef = 1.3;
    }
    return {interval, repetition, ef};
};