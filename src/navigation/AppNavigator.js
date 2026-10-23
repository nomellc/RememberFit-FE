import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import AuthStackNavigator from './AuthStackNavigator';
import DeckStackNavigator from './DeckStackNavigator';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StatsScreen from '../screens/StatsScreen';
import { useAuth } from '../auth/AuthContext';
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
  Profile: ['account-outline', 'account'],
};

function MainTabNavigator() {
  return (
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
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '내 정보' }} />
    </Tab.Navigator>
  );
}

/**
 * 인증 상태가 화면을 정한다.
 * 보관된 토큰으로 복구를 시도하는 동안에는 로그인 화면도 보여주지 않는다.
 * 그러지 않으면 이미 로그인한 사용자에게 로그인 화면이 잠깐 스쳐 지나간다.
 */
export default function AppNavigator() {
  const { status } = useAuth();

  return (
    <NavigationContainer theme={appTheme}>
      {status === 'loading' ? (
        <View style={styles.splash}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : status === 'signedIn' ? (
        <MainTabNavigator />
      ) : (
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  iconWrap: {
    width: 42,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
