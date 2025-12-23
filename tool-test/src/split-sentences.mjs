import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import fs from 'node:fs';
import Path from 'node:path';

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




// 分割段落
function splitParagraphs(text) {
    // split by \n or .
    return text.split(/\n|\./).map(para => para.trim()).filter(para => para !== '');
}

async function main() {
    // get shell arguments
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('请输入要处理的文本');
        return;
    }

    const text = args[0];
    // console.log(text);
    // return

    const paragraphs = splitParagraphs(text);
    // console.log(paragraphs);
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
    // write to dist/summary.json
    // if dist folder not exist, create it
    if (!fs.existsSync('./dist')) {
        fs.mkdirSync('./dist');
    }
    fs.writeFileSync('./dist/summary.json', JSON.stringify(summary));
    // print full file path
    const __dirname = Path.dirname(new URL(import.meta.url).pathname);
    const fullFilePath = Path.join(__dirname, '../dist/summary.json');
    console.log(`cat ${fullFilePath}`);
}

main();