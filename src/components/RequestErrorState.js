import React from 'react';
import EmptyState from './EmptyState';

export default function RequestErrorState({ error, onRetry, compact = false }) {
  return (
    <EmptyState
      icon="wifi-alert"
      title="데이터를 불러오지 못했어요"
      description={error?.message || '잠시 후 다시 시도해주세요.'}
      actionLabel="다시 시도"
      onAction={onRetry}
      compact={compact}
    />
  );
}
