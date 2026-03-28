import { OpenAI } from 'openai';
import { dailyKnowledgeBase } from './knowledge.js';

// 初始化 OpenAI（请确保环境变量 API_KEY 已设置）
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.API_KEY,
});

// 随机抽取知识库任务
function getRandomTasks(arr, n) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

/**
 * 生成10-20字日报内容（自动从知识库抽取2~3项任务）
 * @returns {Promise<string>} AI 生成的日报内容
 */
export async function genAiContent() {
  const randomTasks = getRandomTasks(
    dailyKnowledgeBase,
    2 + Math.floor(Math.random() * 2),
  ); // 2~3项
  const taskList = randomTasks.map((t, i) => `${i + 1}. ${t}`).join(' ');
  const aiPrompt = `请将以下任务要点内容编写为一段10-20字的简洁日报：${taskList}`;
  try {
    const aiRes = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content:
            '你是一个专业前端开发工程师，善于生成日报，能够将技术任务内容提炼成简洁的日报。',
        },
        { role: 'user', content: aiPrompt },
      ],
      max_tokens: 40,
      temperature: 0.7,
    });
    return aiRes.choices?.[0]?.message?.content?.trim() || taskList;
  } catch (e) {
    console.error('AI 生成内容失败，使用任务列表作为内容');
    return taskList;
  }
}
