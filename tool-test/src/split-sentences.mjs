

/**
Create a Pull Request description for the refactoring of the Pagination component.

Main changes

Extract the business logic and state management that were previously coupled within the component into custom hooks.

Refactor the UI component to be presentation-only.

Update the page layer to focus solely on composing hooks and UI components.

Improve the overall testability and maintainability of the codebase after refactoring.

The PR description should include

The background and motivation for this refactoring.

A summary of the key changes that were made.

The benefits introduced by this refactoring (e.g. readability, reusability, testability).

Any behavioral changes, potential risks, or breaking changes, if applicable.

Constraints

Do not include concrete implementation code.

Focus on clear, professional, and engineering-oriented language.

Assume the audience consists of team members and code reviewers.
 */

import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";

dotenv.config();



const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    modelName: process.env.MODEL_NAME,
    connection: {
        baseURL: process.env.OPENAI_BASE_URL,
    },
});

// ai 提炼句式
async function extractSentences(text) {
    const response = await model.invoke(`
        请提炼出以下英文中的短语：${text}
        约束：
        1. 每个句式单独成行。
        2. 不要解释短语的含义，只返回短语本身。
        `);
    const ret = response.content;
    // remove <think> tags
    return ret.replace(/<think>.*?<\/think>/gs, '').trim();
}



// const response = await model.invoke("介绍一下自己");

// console.log(response.content);

const originalText = `
Create a Pull Request description for the refactoring of the Pagination component.

Main changes

`;

// Extract the business logic and state management that were previously coupled within the component into custom hooks.

// Refactor the UI component to be presentation-only.

// Update the page layer to focus solely on composing hooks and UI components.

// Improve the overall testability and maintainability of the codebase after refactoring.

// The PR description should include

// The background and motivation for this refactoring.

// A summary of the key changes that were made.

// The benefits introduced by this refactoring (e.g. readability, reusability, testability).

// Any behavioral changes, potential risks, or breaking changes, if applicable.

// Constraints

// Do not include concrete implementation code.

// Focus on clear, professional, and engineering-oriented language.

// Assume the audience consists of team members and code reviewers.

// 分割段落
function splitParagraphs(text) {
    return text.split('\n').map(para => para.trim()).filter(para => para !== '');
}

async function main() {
    const paragraphs = splitParagraphs(originalText);
    console.log(paragraphs);
    const summary = []
    for (const para of paragraphs) {
        const words = para.split(' ');
        if (words.length > 0) {
            summary.push(...words);
        }
        // words length > 3
        if (words.length > 4) {
            const sentences = await extractSentences(para);
            summary.push(...sentences.split('\n').map(sent => sent.trim()).filter(sent => sent !== ''));
        }
        summary.push(para);
    }
    console.log(summary);
}

main();