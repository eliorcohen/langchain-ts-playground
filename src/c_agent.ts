import * as dotenv from "dotenv";
import { OpenAI } from "langchain";

dotenv.config();

let OPENAI_MODELS = {
    GPT__3_5_TURBO: "gpt-3.5-turbo",
    GPT__3_5_TURBO_0301: "gpt-3.5-turbo-0301",
    TEXT_DAVINCI_003: "text-davinci-003"
}

let model = new OpenAI({
    modelName: OPENAI_MODELS.GPT__3_5_TURBO,
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxTokens: 1000,
});

export const agent = {
    model
}