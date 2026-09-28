const test = require('node:test');
const assert = require('node:assert/strict');
const { ApiError, createApiClient } = require('../src/api/client');

const originalFetch = global.fetch;

test.afterEach(() => {
  global.fetch = originalFetch;
});

test('parses a successful JSON response', async () => {
  global.fetch = async () =>
    new Response(JSON.stringify([{ id: 1, title: '영단어' }]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  const client = createApiClient({ baseUrl: 'http://localhost/api', timeoutMs: 100 });
  const result = await client.request('/decks');

  assert.deepEqual(result, [{ id: 1, title: '영단어' }]);
});

test('keeps a legacy plain-text success response readable', async () => {
  global.fetch = async () =>
    new Response('저장 완료', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });

  const client = createApiClient({ baseUrl: 'http://localhost/api', timeoutMs: 100 });
  const result = await client.request('/legacy');

  assert.equal(result, '저장 완료');
});

test('uses the first field validation message from the server', async () => {
  global.fetch = async () =>
    new Response(
      JSON.stringify({
        code: 'VALIDATION_ERROR',
        message: '입력값을 확인해주세요.',
        path: '/api/decks',
        fieldErrors: { title: '암기장 이름을 입력해주세요.' },
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );

  const client = createApiClient({ baseUrl: 'http://localhost/api', timeoutMs: 100 });

  await assert.rejects(
    client.request('/decks'),
    (error) =>
      error instanceof ApiError &&
      error.status === 400 &&
      error.code === 'VALIDATION_ERROR' &&
      error.message === '암기장 이름을 입력해주세요.'
  );
});

test('maps a disconnected network to a user-facing error', async () => {
  global.fetch = async () => {
    throw new TypeError('Failed to fetch');
  };

  const client = createApiClient({ baseUrl: 'http://localhost/api', timeoutMs: 100 });

  await assert.rejects(
    client.request('/decks'),
    (error) =>
      error instanceof ApiError &&
      error.code === 'NETWORK_ERROR' &&
      error.message.includes('서버에 연결할 수 없어요')
  );
});

test('aborts a request that exceeds the configured timeout', async () => {
  global.fetch = async (_url, options) =>
    new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => {
        const error = new Error('Aborted');
        error.name = 'AbortError';
        reject(error);
      });
    });

  const client = createApiClient({ baseUrl: 'http://localhost/api', timeoutMs: 5 });

  await assert.rejects(
    client.request('/slow'),
    (error) => error instanceof ApiError && error.code === 'REQUEST_TIMEOUT'
  );
});

test('maps an unstructured server failure by status code', async () => {
  global.fetch = async () => new Response('', { status: 503 });

  const client = createApiClient({ baseUrl: 'http://localhost/api', timeoutMs: 100 });

  await assert.rejects(
    client.request('/decks'),
    (error) =>
      error instanceof ApiError &&
      error.status === 503 &&
      error.message.includes('서버가 잠시 응답하지 않아요')
  );
});
