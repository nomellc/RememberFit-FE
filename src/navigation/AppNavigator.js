import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import DeckStackNavigator from './DeckStackNavigator';
import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import { colors } from '../theme/color';

const Tab = createBottomTabNavigator();

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

const iconNames = {
  Home: ['home-variant-outline', 'home-variant'],
  Decks: ['cards-outline', 'cards'],
  Stats: ['chart-box-outline', 'chart-box'],
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={appTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.subText,
          tabBarHideOnKeyboard: true,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
          },
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 84 : 70,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 22 : 10,
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            ...(Platform.OS === 'web' ? { boxShadow: 'none' } : { elevation: 0, shadowOpacity: 0 }),
          },
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons
                color={color}
                name={iconNames[route.name][focused ? 1 : 0]}
                size={size + 1}
              />
            </View>
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: '홈' }} />
        <Tab.Screen name="Decks" component={DeckStackNavigator} options={{ title: '암기장' }} />
        <Tab.Screen name="Stats" component={StatsScreen} options={{ title: '기록' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 42,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
