import { LLMSingleActionAgent, AgentActionOutputParser, AgentExecutor } from "langchain/agents";
import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { BasePromptTemplate, BaseStringPromptTemplate, SerializedBasePromptTemplate, renderTemplate, } from "langchain/prompts";
import { InputValues, PartialValues, AgentStep, AgentAction, AgentFinish, } from "langchain/schema";
import { DynamicTool, SerpAPI, Tool } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";

const PREFIX = `Answer the following questions as best you can. You have access to the following tools:`;
const formatInstructions = (toolNames: string) => `
Use the following format in your response:
  
  Question: the input question you must answer
  Thought: you should always think about what to do
  Action: the action to take, should be one of [${toolNames}]
  Action Input: the input to the action
  Observation: the result of the action
  ... (this Thought/Action/Action Input/Observation can repeat N times)
  Thought: I now know the final answer
  Final Answer: the final answer to the original input question`;

const SUFFIX = `Begin!
  
  Question: {input}
  Thought:{agent_scratchpad}`;

class CustomPromptTemplate extends BaseStringPromptTemplate {
    tools: Tool[];

    constructor(args: { tools: Tool[]; inputVariables: string[] }) {
        super({ inputVariables: args.inputVariables });
        this.tools = args.tools;
        
    }

    _getPromptType(): string {
        throw new Error("Not implemented");
    }

    format(input: InputValues): Promise<string> {
        console.log('formatting input', input);
        /** Construct the final template */
        const toolStrings = this.tools
            .map((tool) => `${tool.name}: ${tool.description}`)
            .join("\n");
        const toolNames = this.tools.map((tool) => tool.name).join("\n");
        const instructions = formatInstructions(toolNames);
        const template = [PREFIX, toolStrings, instructions, SUFFIX].join("\n\n");
        /** Construct the agent_scratchpad */
        const intermediateSteps = input.intermediate_steps as AgentStep[];
        const agentScratchpad = intermediateSteps.reduce(
            (thoughts, { action, observation }) =>
                thoughts +
                [action.log, `\nObservation: ${observation}`, "Thought:"].join("\n"),
            ""
        );
        const newInput = { agent_scratchpad: agentScratchpad, ...input };
        /** Format the template. */
        return Promise.resolve(renderTemplate(template, "f-string", newInput));
    }

    partial(_values: PartialValues): Promise<BasePromptTemplate> {
        throw new Error("Not implemented");
    }

    serialize(): SerializedBasePromptTemplate {
        throw new Error("Not implemented");
    }
}

class CustomOutputParser extends AgentActionOutputParser {
    async parse(text: string): Promise<AgentAction | AgentFinish> {

        console.log('parsing text', text);

        if (text.includes("Final Answer:")) {
            const parts = text.split("Final Answer:");
            const input = parts[parts.length - 1].trim();
            const finalAnswers = { output: input };
            return { log: text, returnValues: finalAnswers };
        }

        const match = /Action: (.*)\nAction Input: (.*)/s.exec(text);
        if (!match) {
            throw new Error(`Could not parse LLM output: ${text}`);
        }

        return {
            tool: match[1].trim(),
            toolInput: match[2].trim().replace(/^"+|"+$/g, ""),
            log: text,
        };
    }

    getFormatInstructions(): string {
        throw new Error("Not implemented");
    }
}

export const run = async () => {
    console.log('Running....')

    let OPENAI_MODELS = {
        GPT__3_5_TURBO: "gpt-3.5-turbo",
        GPT__3_5_TURBO_0301: "gpt-3.5-turbo-0301",
        TEXT_DAVINCI_003: "text-davinci-003"
    }

    const model = new OpenAI({
        temperature: 0.9,
        modelName: OPENAI_MODELS.GPT__3_5_TURBO,
    });

    const tools = [
        new DynamicTool({
            name: "FOO",
            description:
                "call this to get the value of foo. input should be an empty string.",
                returnDirect: true, 
                verbose: true,
                //@ts-ignore
            func: () => "baz",
        }),
        // new SerpAPI(process.env.SERPAPI_API_KEY, {
        //     location: "Israel",
        //     hl: "he",
        //     gl: "IL",
        // }),
        new Calculator(),
    ];

    const llmChain = new LLMChain({
        prompt: new CustomPromptTemplate({
            tools,
            inputVariables: ["input", "agent_scratchpad"],
        }),
        llm: model,
    });

    const agent = new LLMSingleActionAgent({
        llmChain,
        outputParser: new CustomOutputParser(),
        stop: ["\nObservation"],
        // verbose: true,
    });
    const executor = new AgentExecutor({
        agent,
        tools,
    });
    console.log("Loaded agent.");

    // const input = `Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?`;
    // const input = "מי זה דוד בן גוריון?";
    const input = `What is the value of foo?`;

    console.log(`Executing with input "${input}"...`);

    const result = await executor.call({ input });

    console.log(`Got output ${result.output}`);
};