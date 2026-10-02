import { NativeModules, Platform } from 'react-native';

const SUPPORTED_ENVIRONMENTS = ['development', 'staging', 'production'];
const DEFAULT_TIMEOUT_MS = 10000;

const environment = process.env.EXPO_PUBLIC_APP_ENV || 'development';

if (!SUPPORTED_ENVIRONMENTS.includes(environment)) {
  throw new Error(
    `EXPO_PUBLIC_APP_ENV는 ${SUPPORTED_ENVIRONMENTS.join(', ')} 중 하나여야 합니다.`
  );
}

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');

const getMetroHost = () => {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' ? window.location.hostname : null;
  }

  const scriptUrl = NativeModules.SourceCode?.scriptURL;
  const hostMatch = scriptUrl?.match(/^https?:\/\/([^/:]+)/i);
  return hostMatch?.[1] || null;
};

const developmentHost =
  getMetroHost() || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const fallbackUrl = `http://${developmentHost}:8080/api`;

if (!configuredUrl && environment !== 'development') {
  throw new Error(`${environment} 환경에서는 EXPO_PUBLIC_API_URL 설정이 필요합니다.`);
}

const baseUrl = configuredUrl || fallbackUrl;

if (!/^https?:\/\//.test(baseUrl)) {
  throw new Error('EXPO_PUBLIC_API_URL은 http:// 또는 https://로 시작해야 합니다.');
}

const configuredTimeout = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS);
const timeoutMs =
  Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_TIMEOUT_MS;

export const API_CONFIG = Object.freeze({
  baseUrl,
  environment,
  timeoutMs,
});
