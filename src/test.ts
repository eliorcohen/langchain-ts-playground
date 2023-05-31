import {scrapeWebPage} from './scrapper.ts';
import {agent} from './c_agent.ts';

const docs = await scrapeWebPage("https://www.atlassian.com/team-playbook/plays/feature-kick-off");
console.log(docs);