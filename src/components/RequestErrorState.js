import React from 'react';
import { View } from 'react-native';
import EmptyState from './EmptyState';
import { API_CONFIG } from '../config/environment';

const CONNECTION_ERROR_CODES = new Set(['NETWORK_ERROR', 'REQUEST_TIMEOUT']);

export default function RequestErrorState({ error, onRetry, compact = false }) {
  const message = error?.message || '잠시 후 다시 시도해주세요.';
  const description =
    __DEV__ && CONNECTION_ERROR_CODES.has(error?.code)
      ? `${message}\n연결 주소: ${API_CONFIG.baseUrl}`
      : message;

  return (
    <View accessibilityLiveRegion="assertive">
      <EmptyState
        icon="wifi-alert"
        title="데이터를 불러오지 못했어요"
        description={description}
        actionLabel="다시 시도"
        onAction={onRetry}
        compact={compact}
      />
    </View>
  );
}
