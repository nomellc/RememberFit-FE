# *RememberFit*

<img width="1920" height="1080" alt="RememberFit 소개" src="https://github.com/user-attachments/assets/5b7c635f-09b6-435c-afd7-069a6d2df843" />

## 앱 소개
**RememberFit**은 에빙하우스 망각 곡선 이론을 적용한<br/>
스마트 단어장 어플입니다.

단어를 단순히 암기하는 것이 아니라<br/>
사용자 반응(Again, Hard, Good, Easy)에 따라 최적의 복습 주기를 계산합니다.

---

## 기술 스택
- React Native
- JavaScript
- Expo

---

## 실행 방법
```bash
npm install
npx expo start
```
<br/>

**실행 환경:**
- Expo Go
- Android Emulator
- iOS Simulator

---

## 앱 구조
```
RememberFit-FE/
├── App.js                           # 앱 진입점
├── src
    ├── database
    │   ├── database.js              # DB 연결 및 테이블 생성
    │   ├── homeOperations.js        # 홈 화면 통계 데이터 조회
    │   ├── deckOperations.js        # 덱 CRUD 로직
    │   ├── cardOperations.js        # 카드 CRUD 및 학습 필터링
    │   └── studyOperations.js       # 학습 결과 저장 로직
    ├── navigation
    │   ├── AppNavigator.js          # 메인 하단 탭 네비게이션 설정
    │   └── DeckStackNavigator.js    # 덱 내부 화면 이동(Stack) 설정
    ├── screens
    │   ├── HomeScreen.js            # 메인 대시보드 화면
    │   ├── DeckScreen.js            # 덱 목록 화면
    │   ├── CardEditorScreen.js      # 카드 추가/삭제 화면
    │   ├── CardListScreen.js        # 카드 목록 화면
    │   ├── StudyScreen.js           # 학습 진행 화면
    │   └── StatsScreen.js           # 통계 화면
    ├── theme
    │   └── color.js                 # 공통 색상 테마 정의
    └── utils
        └── sm2.js                   # SuperMemo-2 알고리즘 구현
├── app.json
├── babel.config.js
├── index.js
├── package-lock.json
└── package.json
```

 
 
## 앱 기능 개요

### SuperMemo-2 (SM-2) 알고리즘
“아는 것은 나중에, 모르는 것은 자주 노출하여 학습 시간 단축“
- **Quality (사용자 피드백)**: 몰라요(0) ~ 쉬움(5)
- **E-Factor (난이도 계수)**: 카드가 얼마나 쉬운지를 나타내는 고유 값 (기본 2.5)
  - 쉽다고 답하면 → 계수 증가 (주기가 더 빠르게 늘어남)
  - 어렵다고 답하면 → 계수 감소 (주기가 천천히 늘어남)
- **Interval (복습 간격)**: 며칠 뒤에 다시 볼 것인가?

---

## 사용 방법

### 1. 홈 화면
오늘의 학습 시작하기 버튼으로 학습을 시작할 수 있습니다.<br/>
SM-2 알고리즘에 의해 분류된 카드 덱만 나타납니다. <br/>

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/ce406794-740f-4b16-aa28-ba7780e955f6" />

---

### 2. 덱 화면
덱 이름을 입력하면 새로운 덱이 생성되고,<br/>
생성된 덱은 아래 리스트로 나타납니다. <br/>

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/784e19b1-fa2c-4c87-9f21-039d172332fe" />

---

### 3. 학습 화면
카드 앞면을 터치하면 뒷면에 정답이 나옵니다. <br/>
난이도를 선택하면 그 난이도에 따라 다음 학습 날짜가 자동으로 결정됩니다. <br/>

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/5e88db7d-8164-4fba-9466-74879101f103" />

---

### 4. 통계 화면
사용자가 갖고 있는 카드의 총 개수와<br/>
난이도 점수의 평균이 표시됩니다. <br/>

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/09067d02-1531-4d0c-b4b1-5efa58c86631" />


