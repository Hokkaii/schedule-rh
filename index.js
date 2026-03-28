import {signMd5Utils} from './utils/md5.js';
// 封装headers构建方法，自动生成sign和vSign
function buildHeaders({token, tenantId, url, params}) {
  const sign = signMd5Utils.getSign (url, params);
  const vSign = signMd5Utils.getVSign (params, sign);
  return {
    'X-Access-Token': token,
    'X-Tenant-Id': tenantId,
    'X-Sign': sign,
    'V-Sign': vSign,
    'X-TIMESTAMP': signMd5Utils.getTimestamp (),
  };
}
import {genAiContent} from './utils/ai.js';
import {loginAndGetToken} from './utils/login.js';
import {submitWorkLog, submitClock, getWorkLog} from './utils/add.js';
import dayjs from 'dayjs';
const USERNAME = process.env.MY_USERNAME;
const PASSWORD = process.env.MY_PASSWORD;

async function runTask () {
  try {
    // 1. 登录获取 Token
    console.log ('正在尝试登录...');
    let token = '';
    let tenantId = '';
    try {
      const loginResult = await loginAndGetToken (USERNAME, PASSWORD);
      token = loginResult.token;
      tenantId = loginResult.tenantId;
      console.log ('登录成功，获取到 Token');
    } catch (e) {
      console.error (e.message);
      process.exit (1);
    }
    // 获取北京时间当前日期（格式：YYYY-MM-DD），多个接口需要用到，提前计算好并复用
    const beijingNow = dayjs ().add (8 - dayjs ().utcOffset () / 60, 'hour');
    const log_date = beijingNow.format ('YYYY-MM-DD');
    // 2.查询日志
    const log_data_params = {
      type: 1,
      date: log_date,
    };
    const log_data_headers = buildHeaders ({
      token,
      tenantId,
      url: 'oa/oaWorkLog/getLog',
      params: log_data_params,
    });
    let logData = null;
    const logDataRes = await getWorkLog (log_data_params, log_data_headers);
    if (logDataRes && logDataRes.success) {
      console.log ('查询日志成功，返回结果:', logDataRes);
      logData = logDataRes.result;
    } else {
      console.error ('查询日志失败，返回结果:', logDataRes);
    }
    // 3. 生成日志内容（AI自动抽取知识库任务）
    console.log ('正在调用 AI 生成日报内容...');
    const aiContent = await genAiContent ();
    console.log ('AI 生成日报:', aiContent);
    // 4. 提交日志
    // 获取北京时间今日日期（格式：YYYY-MM-DD）
    const log_params = {
      log_date,
      workStatus: 0,
      content: aiContent,
      workStatusa: 0,
      contenta: aiContent,
      logType: 1,
      logStatus: 1,
    };
    const log_headers = buildHeaders ({
      token,
      tenantId,
      url: 'oa/oaWorkLog/add',
      params: log_params,
    });
    const cur_log_params = {
      ...logData,
      ...log_params,
      // 如果已有日志则带上id进行更新，否则新增
    };
    const addRes = await submitWorkLog (cur_log_params, log_headers);
    if (addRes && addRes.success) {
      console.log ('填写日志任务执行成功，返回结果:', addRes);
    } else {
      console.error ('填写日志任务执行失败，返回结果:', addRes);
    }

    // 5. 打卡
    const clock_date = beijingNow.format ('YYYY-MM-DD HH:mm:ss');
    const clock_params = {
      lat: '33.35766303168403',
      lng: '120.134970703125',
      signType: '在班',
      address: '黄海街道办公楼 | 盐城市亭湖区盐马路226号',
      signTime: clock_date,
      remark: aiContent,
    };
    const clock_headers = buildHeaders ({
      token,
      tenantId,
      url: 'oa/rhOaSign/add',
      params: clock_params,
    });
    const clockRes = await submitClock (clock_params, clock_headers);
    if (clockRes && clockRes.success) {
      console.log ('打卡任务执行成功，返回结果:', clockRes);
    } else {
      console.error ('打卡任务执行失败，返回结果:', clockRes);
    }
  } catch (error) {
    console.error ('执行过程中发生错误:', error);
    if (error.response && error.response.status === 401) {
      console.error ('权限失效或登录过期，请检查账号密码。');
    } else {
      console.error ('执行出错:', error.message);
    }
    process.exit (1); // 报错退出，让 GitHub Actions 显示为红色失败状态
  }
}

runTask ();
