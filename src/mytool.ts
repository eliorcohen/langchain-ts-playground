import { OpenAI } from "langchain/llms/openai";
import { DynamicTool } from "langchain/tools";

export const run = async () => {
    const model = new OpenAI({ temperature: 0 });
    const tools = [
        new DynamicTool({
            name: "FOO",
            description:
                "call this to get the value of foo. input should be an empty string.",
            func: () => printAndReturnPromised("baz"),
        }),
        new DynamicTool({
            name: "BAR",
            description:
                "call this to get the value of bar. input should be an empty string.",
            func: () => printAndReturnPromised("baz1"),
        }),
    ];

};


function printAndReturnPromised(input: string): Promise<string> {
    console.log(input);
    return Promise.resolve(input);
}