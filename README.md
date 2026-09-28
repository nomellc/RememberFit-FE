
# *RememberFit*

<img width="1920" height="1080" alt="프레젠테이션 - Smart Flashcard Study" src="https://github.com/user-attachments/assets/03b6cf85-5d30-46d2-be21-56906bbd6671" />

## 프로젝트 소개
<img width="1920" height="1080" alt="프레젠테이션 - Smart Flashcard Study (9)" src="https://github.com/user-attachments/assets/6f810ccf-7f6d-406a-a733-5b9b35382aed" />


<img width="1920" height="1080" alt="프레젠테이션 - Smart Flashcard Study (1)" src="https://github.com/user-attachments/assets/78422012-ba8a-482d-8333-af35cd429400" />

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
```text
src/
├── api/              # 공통 API 클라이언트
├── components/       # 공통 UI 요소
├── config/           # 실행 환경과 API 주소
├── navigation/       # 탭·스택 내비게이션
├── screens/          # 앱 화면
├── theme/            # 디자인 토큰
└── utils/            # 검색 등 순수 함수
```

---

## 사용 방법

### 1. 홈 화면
오늘 학습할 새 카드와 복습 카드 수, 기억 완료 현황을 한눈에 확인하고 바로 학습을 시작할 수 있습니다. <br/>

<img width="1920" height="1080" alt="프레젠테이션 - Smart Flashcard Study (7)" src="https://github.com/user-attachments/assets/9b183e04-b044-4674-9b83-d38000d14623" />




---

### 2. 암기장 화면
학습 주제별로 암기장을 만들고 이름을 수정하거나 삭제할 수 있습니다. 각 암기장에 포함된 카드 수도 함께 표시됩니다. <br/>

<img width="1920" height="1080" alt="프레젠테이션 - Smart Flashcard Study (8)" src="https://github.com/user-attachments/assets/cc06c5eb-84d0-4895-a8ea-8379047d8c1b" />



---

### 3. 학습 화면
카드 앞면을 터치하면 뒷면에 정답이 나옵니다. <br/>
난이도를 선택하면 그 난이도에 따라 다음 학습 날짜가 자동으로 결정됩니다. <br/>

<img width="1920" height="1080" alt="프레젠테이션 - Smart Flashcard Study (5)" src="https://github.com/user-attachments/assets/63162578-9417-43c8-ac3b-dfd18907217f" />


---

### 4. 통계 화면
누적 학습 횟수, 최근 7일 학습량, 연속 학습일과 평가 분포를 실제 학습 기록을 기준으로 확인할 수 있습니다. <br/>

<img width="1920" height="1080" alt="프레젠테이션 - Smart Flashcard Study (6)" src="https://github.com/user-attachments/assets/81c5e10c-874d-403b-91ee-aab3fa97aa9b" />



