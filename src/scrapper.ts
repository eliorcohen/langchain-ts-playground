// import { PlaywrightWebBaseLoader } from "langchain/document_loaders/web/playwright";
// import { Browser, Page } from "playwright";

// export async function scrapeWebPage(pageURL: string): Promise<any> {
//     // const pageURL = "https://www.atlassian.com/team-playbook/plays/feature-kick-off";
//     const loader = new PlaywrightWebBaseLoader(pageURL, {
//         launchOptions: {
//             headless: false,
//         },
//         gotoOptions: {
//             waitUntil: "domcontentloaded",
//         },
//         /** Pass custom evaluate, in this case you get page and browser instances */
//         async evaluate(page: Page, browser: Browser) {
//             // await page.waitForResponse("https://www.atlassian.com/team-playbook/plays/feature-kick-off");
//             await page.waitForResponse(response => response.status() === 200);
//             const result = await page.evaluate(() => document.body.querySelector("main")?.innerText || "");
//             return result;
//         },
//     });

//     const docs = await loader.load();
//     return docs;
// }

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const rootURL = 'https://www.atlassian.com/team-playbook';
    const visited = new Set();
    const toVisit = [rootURL];

    let max_visit = 0;

    while (max_visit < 1 || toVisit.length > 0) {
        max_visit = max_visit + 1;
        const url = toVisit.pop() as string;

        if (!visited.has(url)) {
            visited.add(url);

            await page.goto(url);
            await page.waitForLoadState('networkidle');

            const content = await page.innerText('main');
            // const mainContentHTML = await page.$eval('main', el => el.innerHTML);

            let filename = url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            if (!filename.endsWith('.md')) {
                filename += '.md';
            }

            const filePath = path.join('./scrape/', filename);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Saved ${url} to ${filePath}`);

            // extract all the links on the page
            const links = await page.$$eval('a', links => links.map(link => link.href));

            // add the links to the toVisit list, if they're part of the target site and haven't been visited yet
            for (const link of links) {
                if (link.startsWith(rootURL) && !visited.has(link)) {
                    toVisit.push(link);
                }
            }
        }

        break;
    }

    await browser.close();
})();






