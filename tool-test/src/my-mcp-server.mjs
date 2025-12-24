
import { McpServer } from '@modelcontextprotocol/sdk';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const database = {
    users: {
        '001': { id: '001', name: 'Jack', email: '001@example.com', role: 'admin' },
        '002': { id: '002', name: 'Sally', email: '002@example.com', role: 'user' },
        '003': { id: '003', name: 'Mark', email: '003@example.com', role: 'user' }
    }
};

const server = new McpServer({
    name: 'my-mcp-server',
    version: '1.0.0',
});


// 注册工具 查询用户信息
server.registerTool('query_user', {
    description: '查询数据库中的用户信息。输入用户 ID，返回用户详细信息（ID、姓名、邮箱、角色）',
    inputSchema: {
        userId: z.string().describe('用户 ID, 例如 001，002 等')
    },
}, async ({ userId }) => {
    const user = database.users[userId];
    if (!user) {
        return {
            content: [
                {
                    type: 'text',
                    text: `用户 ${userId} 不存在`
                }
            ]
        };
    }
    return {
        content: [
            {
                type: 'text',
                text: `用户 ${userId} 的信息如下：\nID: ${user.id}\n姓名: ${user.name}\n邮箱: ${user.email}\n角色: ${user.role}`
            }
        ]
    }
});

server.registerResource('使用指南', 'docs://guide', {
    description: 'my-mcp-server 的使用指南',
    mineType: 'text/plain',
}, async () => {
    return {
        content: [
            {
                uri: "docs://guide",
                mineType: 'text/plain',
                text: `MCP Server 使用指南

功能：提供用户查询等工具。

使用：在 Cursor 等 MCP Client 中通过自然语言对话，Cursor 会自动调用相应工具。`,
            }
        ]
    }
});


const transport = new StdioServerTransport(server);
await server.connect(transport);  
