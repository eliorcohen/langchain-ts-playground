import * as dotenv from "dotenv";
dotenv.config();

import {run} from 'agent.ts';


(async function(){
  console.log('[Starting...]');
  await run();
  console.log('[Done]');
})();

// import { OpenAI } from "langchain";



// let OPENAI_MODELS = {
//   GPT__3_5_TURBO: "gpt-3.5-turbo",
//   GPT__3_5_TURBO_0301: "gpt-3.5-turbo-0301",
//   TEXT_DAVINCI_003 :"text-davinci-003"
// }


// let model = new OpenAI({
//   modelName: OPENAI_MODELS.TEXT_DAVINCI_003,
//   openAIApiKey: process.env.OPENAI_API_KEY,
//   maxTokens: 1000,
// });

// const prompt = `
// I am an intelligent question-answering bot. If you ask me a question that is rooted in truth, I will give you the answer. If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with "Unknown".

// Q: What is human life expectancy in the United States?
// A: Human life expectancy in the United States is 78 years.

// Q: Who was the president of the United States in 1955?
// A: Dwight D. Eisenhower was president of the United States in 1955.

// Q: Which party did he belong to?
// A: He belonged to the Republican Party.

// Q: What is the square root of a banana?
// A: Unknown

// Q: How does a telescope work?
// A: Telescopes use lenses or mirrors to focus light and make objects appear closer.

// Q: Where were the 1992 Olympics held?
// A: The 1992 Olympics were held in Barcelona, Spain.

// Q: How many squigs are in a bonk?
// A: Unknown

// Q: explain using llms, how the question answering works?
// `;

// // const res = await model.call(prompt);


// let res = await model.generate([prompt]);

// console.dir(res, {depth: 8});
