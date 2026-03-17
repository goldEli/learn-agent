import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import fs from 'node:fs';
import Path from 'node:path';
import chalk from 'chalk';

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
    console.log(`开始提炼句子`);
    const response = await model.invoke(`
        为了学习以下这段英文，请将这段话拆分成多个短句：${text}
        约束：
        1. 每个句式单独成行。
        2. 不要解释短句的含义，不要返回序号，只返回短句本身。
        `);
    console.log(`提炼句子完成 ======`, response.content);
    const ret = response.content;
    // remove <think> tags
    // console.log(ret);
    let res = ret
    .replace(/<think>.*?<\/think>/gs, '')
    // ?.split("</think>")?.[1]
    ?.trim()
    console.log(chalk.blue(res));
    return res;
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
    // const args = process.argv.slice(2);
    // if (args.length === 0) {
    //     console.log('请输入要处理的文本');
    //     return;
    // }


    const text = `So, Lauren, I just wanted to talk to you quickly about our new customer support representative, Jason Huntley. Sure, what's up? Basically, I've got a few concerns about him, and the bottom line is, I don't think he's a good fit for our company. OK, what makes you say that? I thought you were pleased with his overall performance. Didn't you just tell me last week how impressed you were with his attitude? Yeah, his attitude is great, but he's really unreliable. Sometimes he's really productive, but then other times—take last Tuesday for instance—he was 45 minutes late for our morning meeting. Well, I'm sure he had a perfectly good reason. But that's not the only thing. You know, he really doesn't have the best work ethic. I'm constantly catching him on MSN and Facebook when he should be talking to clients. Yeah, but come on, Jeff. As if you don't check Facebook at work. Look, you hired this guy. We've invested a lot of time and money in his training, so now it's up to you to coach him, make it work, Jeff. You would say that, wouldn't you? He's your cousin! What a jerk! You made me hire your stupid, useless cousin. `;
    // console.log(text);
    // return

    const paragraphs = splitParagraphs(text);
    // console.log(paragraphs);
    console.log(`段落分割完成，共 ${paragraphs.length} 段`);
    const summary = []
    for (const para of paragraphs) {
        console.log(`处理段落：${para}`);
        const words = para.split(' ');
        if (words.length > 0) {
            summary.push(...words);
        }
        // words length > 3
        if (words.length > 4) {
            const sentences = await extractSentences(para);
            console.log(`提炼句子：${sentences}`);
            summary.push(...(sentences?.split('\n') || []).map(sent => sent?.trim()).filter(sent => sent !== ''));
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

