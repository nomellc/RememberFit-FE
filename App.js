// App.js
import React, { useEffect, useState } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { View, Text } from 'react-native';

// DB 초기화 함수 가져오기
import { initDB } from './src/database/database';

export default function App() {
  const [isDbReady, setDbReady] = useState(false);

  useEffect(() => {
    // 앱 켜지면 DB 초기화 실행
    initDB()
    .then(() => {
      setDbReady(true);
    })
    .catch((e) => console.log(e));
  }, []);

  // DB 준비 안됐으면 로딩 화면
  if(!isDbReady) {
    return (
      <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>데이터베이스 준비 중</Text>
      </View>
    )
  }
  return <AppNavigator />;
}