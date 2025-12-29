import 'dotenv/config';
import { tool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { spawn } from 'node:child_process';
import { z } from 'zod';

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
});

const runPipelineTool = tool(
  async ({ pipelines, branch }) => {
    const pipelineArg = Array.isArray(pipelines) ? pipelines.join(',') : pipelines;
    const command = `pnpm run start -p "${pipelineArg}" -b "${branch}"`;
    console.log(`执行命令: ${command}`)

    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');

      const child = spawn(cmd, args, {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: true,
      });

      child.on('error', (error) => {
        reject(error);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(`执行成功: ${command}`);
        } else {
          reject(new Error(`命令执行失败，退出码: ${code}`));
        }
      });
    });
  },
  {
    name: 'run_pipeline',
    description: '执行 pnpm run start 命令来运行指定的 pipeline',
    schema: z.object({
      pipelines: z.array(z.string()).describe('要运行的 pipeline 名称列表'),
      branch: z.string().describe('git 分支名称'),
    }),
  }
);

const tools = [runPipelineTool];
const modelWithTools = model.bindTools(tools);

async function parseAndExecute(message) {
  const messages = [
    new SystemMessage(`你是一个 DevOps 助手，负责解析自然语言指令并执行 pipeline。

当前工作目录: ${process.cwd()}

规则：
1. 识别用户要运行的 pipeline 名称（可能有多个，用逗号分隔）
2. 识别目标分支名称
3. 直接调用 run_pipeline 工具执行命令

pipeline 名称：
web-trade,web-trade-2,web_separation,web-pages-2,admin-web-ad,admin-web-cs,admin-web-fin,admin-web-op,admin-web-rd,admin-web,Email Template,KlineTool,boss-web,lambda,lambda_version,web-cms,web-core,web-core-2,web-info,web-pages,weex-mirror-website

分支名称：
rc,rc2,rc3,rc4,stg1,stg2,stg3

pipeline 和 分支名称提取：
- 从 "帮忙部署 web-trade rc 分支" 等模式中提取

别名规则：
- web 表示 web_separation
- trade 表示 web-trade
- trade2 表示 web-trade-2

约束：
1. 必须要提取出分支名字 rc,rc2,rc3,rc4,stg1,stg2,stg3,stg4
2. 必须要提取出 pipeline 名字 web-trade,web-trade-2,web_separation,web-pages-2,admin-web-ad,admin-web-cs,admin-web-fin,admin-web-op,admin-web-rd,admin-web,Email Template,KlineTool,boss-web,lambda,lambda_version,web-cms,web-core,web-core-2,web-info,web-pages,weex-mirror-website
`
),
    new HumanMessage(message),
  ];

  const response = await modelWithTools.invoke(messages);

  if (response.tool_calls && response.tool_calls.length > 0) {
    for (const toolCall of response.tool_calls) {
      const foundTool = tools.find(t => t.name === toolCall.name);
      if (foundTool) {
        const result = await foundTool.invoke(toolCall.args);
        console.log(result);
        return result;
      }
    }
  }

  console.log(response.content);
  return response.content;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('请提供消息参数，例如: node tool-assistant.mjs "Run the Web Separation pipeline on the develop branch"');
  process.exit(1);
}

const message = args.join(' ');
console.log(`【用户输入】${message}\n`);

parseAndExecute(message).catch(error => {
  console.error(`错误: ${error.message}`);
  process.exit(1);
});
