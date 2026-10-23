import { Platform } from 'react-native';

const REFRESH_TOKEN_KEY = 'rememberfit.refreshToken';

// SecureStore 는 웹에서 동작하지 않는다. 웹에서는 localStorage 로 대체한다.
const isWeb = Platform.OS === 'web';

const loadSecureStore = () => {
  if (isWeb) return null;
  // 웹 번들에 네이티브 모듈이 들어가지 않도록 필요할 때만 불러온다.
  return require('expo-secure-store');
};

export const saveRefreshToken = async (token) => {
  try {
    if (isWeb) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
      return;
    }
    await loadSecureStore().setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch {
    // 저장에 실패해도 이번 세션은 계속 쓸 수 있어야 한다. 다음 실행에 다시 로그인하면 된다.
  }
};

export const readRefreshToken = async () => {
  try {
    if (isWeb) {
      return window.localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return await loadSecureStore().getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const clearRefreshToken = async () => {
  try {
    if (isWeb) {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
      return;
    }
    await loadSecureStore().deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    // 지우지 못해도 서버 쪽 토큰은 로그아웃 요청으로 이미 폐기된다.
  }
};
