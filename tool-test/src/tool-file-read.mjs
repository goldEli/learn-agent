import { ChatOpenAI } from '@langchain/openai'
import 'dotenv/config'
import { tool } from '@langchain/core/tools'
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages'

import fs from 'node:fs/promises'
import { z } from 'zod'

const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: process.env.MODEL_NAME,
    // 温度设置为0，模型输出更加确定性
    temperature: 0,
    connection: {
        baseURL: process.env.OPENAI_BASE_URL,
    },
})

const readFileTool = tool(
    async ({ filePath }) => {
        const content = await fs.readFile(filePath, 'utf-8')
        console.log(`【工具调用】read_file(${filePath}) - 成功读取 ${content.length} 个字符`)
        return `文件内容：\n${content}`
    },
    {
        name: 'read_file',
        description: '用此工具读取文件内容。当用户需要读取文件、查看代码、分析文件内容时，调用此工具。输入文件路径（可以是相对路径或绝对路径）。',
        schema: z.object({
            filePath: z.string().describe('文件路径'),
        }),
    }
)

const tools = [readFileTool]

const modelWithTools = model.bindTools(tools)

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
const response = await modelWithTools.invoke(messages)
console.log(response.content)