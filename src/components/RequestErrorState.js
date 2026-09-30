import React from 'react';
import { View } from 'react-native';
import EmptyState from './EmptyState';
import { API_CONFIG } from '../config/environment';

const CONNECTION_ERROR_CODES = new Set(['NETWORK_ERROR', 'REQUEST_TIMEOUT']);

export default function RequestErrorState({ error, onRetry, compact = false }) {
  const isConnectionError = CONNECTION_ERROR_CODES.has(error?.code);
  const description =
    __DEV__ && isConnectionError
      ? `연결 주소: ${API_CONFIG.baseUrl}`
      : isConnectionError
        ? '네트워크를 확인하고 다시 시도해주세요.'
        : error?.message || '잠시 후 다시 시도해주세요.';

  return (
    <View accessibilityLiveRegion="assertive">
      <EmptyState
        icon="wifi-alert"
        title={isConnectionError ? '서버에 연결할 수 없어요' : '데이터를 불러오지 못했어요'}
        description={description}
        actionLabel="다시 시도"
        onAction={onRetry}
        compact={compact}
      />
    </View>
  );
}
