import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import DeckStackNavigator from "./DeckStackNavigator";

import HomeScreen from "../screens/HomeScreen";
import DeckScreen from "../screens/DeckScreen";
import StatsScreen from "../screens/StatsScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#007AFF', // 활성화된 탭 색상
                tabBarInactiveBackgroundColor: '#99A1AF',
                headerShown: false,
            }}>
                <Tab.Screen 
                name="Home"
                component={HomeScreen}
                options={{title: '홈'}}
                />
                <Tab.Screen 
                name="Decks"
                component={DeckStackNavigator}
                options={{title: '덱', headerShown: false}}
                />
                <Tab.Screen 
                name="Stats"
                component={StatsScreen}
                options={{title: '통계'}}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}