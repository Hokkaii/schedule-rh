import axios from 'axios';
// 日志提交接口地址
export const LOG_ADD_URL = 'http://www.jsrhzh.net:8080/jeecg-boot/oa/oaWorkLog/add';
export const CLOCK_URL = 'http://www.jsrhzh.net:8080/jeecg-boot/oa/rhOaSign/add';
export const LOG_DATA_URL = 'http://www.jsrhzh.net:8080/jeecg-boot/oa/oaWorkLog/getLog';
/**
 * 打卡业务方法
 * @param {object} params 打卡参数
 * @param {object} headers 请求头
 * @returns {Promise<any>} 接口返回
 */
export async function submitClock(params, headers) {
  // 假设打卡接口与日志接口一致，如有不同请调整 ADD_URL
  const res = await axios.post(CLOCK_URL, params, { headers });
  return res.data;
}

/**
 * 查询日志
 * @param {object} params 日志参数
 * @param {object} headers 请求头
 * @returns {Promise<any>} 接口返回
 */
export async function getWorkLog(params, headers) {
  const res = await axios.get(LOG_DATA_URL, { params, headers });
  return res.data;
}

/**
 * 提交日志
 * @param {object} params 日志参数
 * @param {object} headers 请求头
 * @returns {Promise<any>} 接口返回
 */
export async function submitWorkLog(params, headers) {
  const res = await axios.post(LOG_ADD_URL, params, { headers });
  return res.data;
}
