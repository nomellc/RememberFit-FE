
# *RememberFit*

<img width="1920" height="1080" alt="1" src="https://github.com/user-attachments/assets/e0ae5f57-ba1f-49cb-a2bd-d52a7cbe951f" />


## 프로젝트 소개
<img width="1920" height="1080" alt="프레젠테이션 - Smart Flashcard Study" src="https://github.com/user-attachments/assets/a512a478-403d-4859-b7cd-47409a3f75ae" />

<img width="1920" height="1080" alt="4" src="https://github.com/user-attachments/assets/8025f1b9-f87f-4a4c-9fb3-4ab516a3cb52" />


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

<img width="1920" height="1080" alt="5" src="https://github.com/user-attachments/assets/cde918ca-10bb-4f28-ba8e-3865265b93a8" />



---

### 2. 암기장 화면
학습 주제별로 암기장을 만들고 이름을 수정하거나 삭제할 수 있습니다. 각 암기장에 포함된 카드 수도 함께 표시됩니다. <br/>

<img width="1920" height="1080" alt="6" src="https://github.com/user-attachments/assets/0615866e-f514-49f8-8e8a-be6491042308" />


---


### 3. 학습 화면
카드 앞면을 터치하면 뒷면에 정답이 나옵니다. <br/>
난이도를 선택하면 그 난이도에 따라 다음 학습 날짜가 자동으로 결정됩니다. <br/>

<img width="1920" height="1080" alt="7" src="https://github.com/user-attachments/assets/022ac752-7bbb-40c2-aad8-1e166705d394" />


---

### 4. 통계 화면
누적 학습 횟수, 최근 7일 학습량, 연속 학습일과 평가 분포를 실제 학습 기록을 기준으로 확인할 수 있습니다. <br/>

<img width="1920" height="1080" alt="8" src="https://github.com/user-attachments/assets/5f848d5a-5556-46d6-9dfe-d90bc909e666" />




