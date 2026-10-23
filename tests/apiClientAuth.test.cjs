const test = require('node:test');
const assert = require('node:assert/strict');
const { ApiError, createApiClient } = require('../src/api/client');

const originalFetch = global.fetch;

test.afterEach(() => {
  global.fetch = originalFetch;
});

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const okBody = { success: true, message: '불러왔어요.', data: ['deck'] };
const invalidTokenBody = {
  code: 'INVALID_TOKEN',
  message: '로그인 정보가 만료되었어요. 다시 로그인해주세요.',
  path: '/api/decks',
};

test('sends the access token as a Bearer header', async () => {
  let seenHeaders = null;
  global.fetch = async (url, options) => {
    seenHeaders = options.headers;
    return jsonResponse(okBody);
  };

  const client = createApiClient({
    baseUrl: 'http://localhost/api',
    timeoutMs: 100,
    getAccessToken: () => 'token-abc',
  });
  await client.request('/decks');

  assert.equal(seenHeaders.Authorization, 'Bearer token-abc');
});

test('omits the header when there is no token', async () => {
  let seenHeaders = null;
  global.fetch = async (url, options) => {
    seenHeaders = options.headers;
    return jsonResponse(okBody);
  };

  const client = createApiClient({
    baseUrl: 'http://localhost/api',
    timeoutMs: 100,
    getAccessToken: () => null,
  });
  await client.request('/decks');

  assert.equal(seenHeaders.Authorization, undefined);
});

test('never attaches a token to a public endpoint', async () => {
  let seenHeaders = null;
  global.fetch = async (url, options) => {
    seenHeaders = options.headers;
    return jsonResponse(okBody);
  };

  const client = createApiClient({
    baseUrl: 'http://localhost/api',
    timeoutMs: 100,
    getAccessToken: () => 'token-abc',
  });
  await client.request('/auth/login', { method: 'POST', auth: false });

  assert.equal(seenHeaders.Authorization, undefined);
});

test('refreshes once and retries the original request on an expired token', async () => {
  const calls = [];
  let token = 'expired-token';
  global.fetch = async (url, options) => {
    calls.push(options.headers.Authorization);
    if (options.headers.Authorization === 'Bearer expired-token') {
      return jsonResponse(invalidTokenBody, 401);
    }
    return jsonResponse(okBody);
  };

  let refreshCount = 0;
  const client = createApiClient({
    baseUrl: 'http://localhost/api',
    timeoutMs: 100,
    getAccessToken: () => token,
    onTokenExpired: async () => {
      refreshCount += 1;
      token = 'fresh-token';
      return true;
    },
  });

  const result = await client.request('/decks');

  assert.deepEqual(result, ['deck']);
  assert.equal(refreshCount, 1);
  assert.deepEqual(calls, ['Bearer expired-token', 'Bearer fresh-token']);
});

test('gives up and surfaces the original error when the refresh fails', async () => {
  let fetchCount = 0;
  global.fetch = async () => {
    fetchCount += 1;
    return jsonResponse(invalidTokenBody, 401);
  };

  const client = createApiClient({
    baseUrl: 'http://localhost/api',
    timeoutMs: 100,
    getAccessToken: () => 'expired-token',
    onTokenExpired: async () => false,
  });

  await assert.rejects(
    () => client.request('/decks'),
    (error) => error instanceof ApiError && error.code === 'INVALID_TOKEN'
  );
  // 재발급이 실패하면 원래 요청을 다시 보내지 않는다.
  assert.equal(fetchCount, 1);
});

test('retries at most once even if the new token is also rejected', async () => {
  let fetchCount = 0;
  global.fetch = async () => {
    fetchCount += 1;
    return jsonResponse(invalidTokenBody, 401);
  };

  let refreshCount = 0;
  const client = createApiClient({
    baseUrl: 'http://localhost/api',
    timeoutMs: 100,
    getAccessToken: () => 'expired-token',
    onTokenExpired: async () => {
      refreshCount += 1;
      return true;
    },
  });

  await assert.rejects(() => client.request('/decks'), ApiError);
  // 무한 재시도에 빠지면 안 된다.
  assert.equal(fetchCount, 2);
  assert.equal(refreshCount, 1);
});

test('does not try to refresh for an ordinary unauthorized response', async () => {
  global.fetch = async () =>
    jsonResponse({ code: 'UNAUTHORIZED', message: '로그인이 필요해요.' }, 401);

  let refreshCount = 0;
  const client = createApiClient({
    baseUrl: 'http://localhost/api',
    timeoutMs: 100,
    getAccessToken: () => null,
    onTokenExpired: async () => {
      refreshCount += 1;
      return true;
    },
  });

  await assert.rejects(
    () => client.request('/decks'),
    (error) => error.code === 'UNAUTHORIZED'
  );
  assert.equal(refreshCount, 0);
});
