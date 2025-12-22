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
const response = await model.invoke("介绍一下自己");

console.log(response.content);
