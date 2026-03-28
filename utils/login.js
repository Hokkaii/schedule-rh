import axios from 'axios';
const LOGIN_URL = 'http://www.jsrhzh.net:8080/jeecg-boot/sys/mLogin';
/**
 * 登录并返回 token 和 tenantId
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{token: string, tenantId: string}>}
 */
export async function loginAndGetToken(username, password) {
  const loginRes = await axios.post(LOGIN_URL, {
    username,
    password,
  });
  if (loginRes.data.success && loginRes.data.result.token) {
    return {
      token: loginRes.data.result.token,
      tenantId: loginRes.data.result.userInfo.tenantId || '0',
    };
  } else {
    throw new Error('登录失败，请检查账号密码。');
  }
}
