import { ChatOpenAI } from '@langchain/openai'
import 'dotenv/config'
import { tool } from '@langchain/core/tools'
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'

import fs from 'node:fs/promises'
import { z } from 'zod'

// const model = new ChatOpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//     modelName: process.env.MODEL_NAME,
//     // 温度设置为0，模型输出更加确定性
//     temperature: 0,
//     connection: {
//         baseURL: process.env.OPENAI_BASE_URL,
//     },
// })
const model = new ChatOpenAI({
    modelName: process.env.MODEL_NAME || "qwen-coder-turbo",
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    configuration: {
        baseURL: process.env.OPENAI_BASE_URL,
    },
});

const readFileTool = tool(
    async ({ filePath }) => {
        const content = await fs.readFile(filePath, 'utf-8');
        console.log(`  [工具调用] read_file("${filePath}") - 成功读取 ${content.length} 字节`);
        return `文件内容:\n${content}`;
    },
    {
        name: 'read_file',
        description: '用此工具来读取文件内容。当用户要求读取文件、查看代码、分析文件内容时，调用此工具。输入文件路径（可以是相对路径或绝对路径）。',
        schema: z.object({
            filePath: z.string().describe('要读取的文件路径'),
        }),
    }
);

const tools = [
    readFileTool
];

const modelWithTools = model.bindTools(tools);

const messages = [
    new SystemMessage(`你是一个代码助手，可以使用工具读取文件并解释代码。

    工作流程：
    1. 当用户需要读取文件内容时，立即调用 read_file 工具。
    2. 等待工具返回文件的内容。
    3. 基于文件内容进行分析和解释。

    可用工具：

    - read_file：读取文件内容（使用此工具获取文件内容）
    
    `),

    new HumanMessage('请读取 src/tool-file-read.mjs 文件内容并解释代码'),
]

console.log('【用户输入】', messages[1].content)
let response = await modelWithTools.invoke(messages)
// console.log(response)

messages.push(response)

while (response.tool_calls && response.tool_calls.length > 0) {
    console.log(`\n【检测到】${response.tool_calls.length} 个工具调用`)

    // 执行所有工具调用
    const toolResult = await Promise.all(response.tool_calls.map(async (toolCall) => {
        const tool = tools.find(t => t.name === toolCall.name);
        if (!tool) {
            throw new Error(`未找到工具 ${toolCall.id}`);
        }
        console.log(`  [工具调用] ${toolCall.name}(${JSON.stringify(toolCall.args)})`)

        try {
            const result = await tool.invoke(toolCall.args)
            return result

        } catch (error) {
            return `错误：${error.message}`
        }
    }));

    // 将工具调用结果添加到消息列表
    response.tool_calls.forEach((toolCall, index) => {
        messages.push(new ToolMessage({
            content: toolResult[index],
            tool_call_id: toolCall.id,
        }));
    });

    // console.log(`\n messages:`, messages)

    // 再次调用默认，传入工具结果
    response = await modelWithTools.invoke(messages);

}

// 打印模型回复
console.log('\n【模型回复】', response.content);
