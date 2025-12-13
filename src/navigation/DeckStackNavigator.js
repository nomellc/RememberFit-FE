import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DeckScreen from "../screens/DeckScreen";
import CardListScreen from '../screens/CardListScreen';
import CardEditorScreen from '../screens/CardEditorScreen';

const Stack = createNativeStackNavigator();

export default function DeckStackNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="DeckList" component={DeckScreen} options={{title: '내 암기장'}} />
            <Stack.Screen name="CardList" component={CardListScreen} options={{title: '카드 목록'}} />
            <Stack.Screen name="CardEditor" component={CardEditorScreen} options={{tile: '카드 추가', presentation: 'modal'}} />
        </Stack.Navigator>
    );
}

