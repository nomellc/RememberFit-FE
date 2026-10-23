const DEFAULT_ERROR_MESSAGES = {
  400: '입력한 내용을 확인해주세요.',
  401: '로그인이 필요한 요청이에요.',
  403: '이 요청을 처리할 권한이 없어요.',
  404: '요청한 정보를 찾을 수 없어요.',
  409: '현재 상태에서는 요청을 처리할 수 없어요.',
  429: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.',
};

class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status || 0;
    this.code = options.code || 'UNKNOWN_ERROR';
    this.fieldErrors = options.fieldErrors || {};
    this.path = options.path || null;
    this.cause = options.cause;
  }
}

const parseBody = async (response) => {
  const rawBody = await response.text();
  if (!rawBody) return null;

  const contentType = response.headers?.get?.('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(rawBody);
    } catch {
      throw new ApiError('서버 응답 형식을 읽을 수 없어요.', {
        status: response.status,
        code: 'INVALID_RESPONSE',
      });
    }
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
};

const getFirstFieldError = (fieldErrors) => {
  if (!fieldErrors || typeof fieldErrors !== 'object') return null;
  return Object.values(fieldErrors).find((message) => typeof message === 'string') || null;
};

const getStatusMessage = (status) => {
  if (DEFAULT_ERROR_MESSAGES[status]) return DEFAULT_ERROR_MESSAGES[status];
  if (status >= 500) return '서버가 잠시 응답하지 않아요. 잠시 후 다시 시도해주세요.';
  return '요청을 처리하지 못했어요. 다시 시도해주세요.';
};

const createApiClient = ({ baseUrl, timeoutMs = 10000, getAccessToken, onTokenExpired }) => {
  if (!baseUrl) throw new Error('API baseUrl이 필요합니다.');

  const performRequest = async (path, options = {}) => {
    // auth: false 는 토큰 없이 불러야 하는 입구(로그인, 회원가입, 재발급)에 쓴다.
    const { auth = true, retried, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const accessToken = auth && getAccessToken ? getAccessToken() : null;

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...fetchOptions,
        headers: {
          Accept: 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...fetchOptions.headers,
        },
        signal: controller.signal,
      });
      const data = await parseBody(response);

      if (!response.ok) {
        const fieldErrors =
          data && typeof data === 'object' && data.fieldErrors ? data.fieldErrors : {};
        const serverMessage = data && typeof data === 'object' ? data.message : null;
        const message = getFirstFieldError(fieldErrors) || serverMessage || getStatusMessage(response.status);

        throw new ApiError(message, {
          status: response.status,
          code: (data && typeof data === 'object' && data.code) || `HTTP_${response.status}`,
          fieldErrors,
          path: data && typeof data === 'object' ? data.path : null,
        });
      }

      if (
        data &&
        typeof data === 'object' &&
        data.success === true &&
        Object.prototype.hasOwnProperty.call(data, 'data')
      ) {
        return data.data;
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;

      if (error?.name === 'AbortError') {
        throw new ApiError('서버 응답이 늦어 요청을 중단했어요. 다시 시도해주세요.', {
          code: 'REQUEST_TIMEOUT',
          cause: error,
        });
      }

      throw new ApiError('서버에 연결할 수 없어요. 네트워크와 서버 주소를 확인해주세요.', {
        code: 'NETWORK_ERROR',
        cause: error,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  /**
   * 액세스 토큰이 만료된 경우에만 한 번 재발급을 시도하고 같은 요청을 다시 보낸다.
   * 재발급이 실패하면 원래 오류를 그대로 올려 보내 호출한 쪽이 로그아웃 처리하게 한다.
   */
  const request = async (path, options = {}) => {
    try {
      return await performRequest(path, options);
    } catch (error) {
      const canRetry =
        error instanceof ApiError &&
        error.code === 'INVALID_TOKEN' &&
        options.auth !== false &&
        !options.retried &&
        typeof onTokenExpired === 'function';

      if (!canRetry) throw error;

      const refreshed = await onTokenExpired();
      if (!refreshed) throw error;

      return performRequest(path, { ...options, retried: true });
    }
  };

  return { request };
};

module.exports = {
  ApiError,
  createApiClient,
};
