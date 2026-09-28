import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DeckScreen from '../screens/DeckScreen';
import CardListScreen from '../screens/CardListScreen';
import CardEditorScreen from '../screens/CardEditorScreen';
import StudyScreen from '../screens/StudyScreen';
import { colors } from '../theme/color';

const Stack = createNativeStackNavigator();

export default function DeckStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontSize: 17, fontWeight: '700' },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="DeckList" component={DeckScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CardList" component={CardListScreen} options={{ title: '카드 목록' }} />
      <Stack.Screen
        name="CardEditor"
        component={CardEditorScreen}
        options={{ title: '새 카드', presentation: 'modal' }}
      />
      <Stack.Screen name="Study" component={StudyScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
