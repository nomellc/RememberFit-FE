// 액세스 토큰은 메모리에만 둔다. 저장소에 남기지 않으므로 앱을 끄면 사라진다.
// 다시 켰을 때는 보관된 재발급 토큰으로 새로 받는다.
let accessToken = null;
let tokenExpiredHandler = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const getAccessToken = () => accessToken;

export const setTokenExpiredHandler = (handler) => {
  tokenExpiredHandler = handler;
};

export const handleTokenExpired = async () => {
  if (!tokenExpiredHandler) return false;
  return tokenExpiredHandler();
};
