const puppeteer = require('puppeteer')
const TestBugger = require('test-bugger');
const testBugger = new TestBugger({'fileName': __filename});

const botMaster = {
    browser : null,
    page : null,
    
    initializer: async (path, server) => {
        
        botMaster.browser = await puppeteer.launch({
            headless: false,
            // https://peter.sh/experiments/chromium-command-line-switches/
            defaultViewport: null,
            ignoreHTTPSErrors: true,
            acceptInsecureCerts: true,
            slowMo: 100,
            args: [
                '--start-maximized',
                // '--window-size=360,500', 
                // '--window-position=000,000', 
                '--no-sandbox', 
                '--user-data-dir='+path, 
                '--disable-web-security',
                '--disable-dev-shm-usage', 
                // '--user-agent =  Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
                // '--proxy-server='+server,
            ],
        })

        botMaster.page = await botMaster.browser.newPage();
        // await botMaster.page.setExtraHTTPHeaders({"x-lpm-session":"DE"})
    },
    createPage: async()=> {
        return await botMaster.browser.newPage();
         
    },
    googleSearch : async(searchTearm) => {
        try{
            await botMaster.page.goto('https://www.google.com');
            await botMaster.page.setDefaultNavigationTimeout(0)    
        }catch(e){
            testBugger.errorLog("Error in goto url")
            testBugger.errorLog(e)
        }
        let jshandlerevaluate
        try{
            await botMaster.page.evaluate(()=>{
                document.querySelector('input[name="q"]').click()
            })
        }catch(e){
            testBugger.errorLog("Search input")
            testBugger.errorLog(e)
        }
        await botMaster.page.keyboard.type(searchTearm);
        await botMaster.page.keyboard.press('Enter');

        await botMaster.page.waitForSelector('div[class="g"]', {timeout: 10000});
        let urls_list = await botMaster.page.evaluate(() => {
            let elements = document.querySelectorAll('div[class="g"]')
            let urls_list = []
            for(let i=0; i < elements.length; i++){
                urls_list.push(elements[i].querySelector('[class="r"] a').attributes["href"].value)
            }
            return urls_list
        })
        let stackUrl = ""
        console.log(urls_list)
        for (let url of urls_list){
            if(url.includes('stackoverflow')){
                stackUrl = url
                break
            }
        }
        console.log(stackUrl)

        try{
            await botMaster.page.goto(stackUrl);
            await botMaster.page.setDefaultNavigationTimeout(0)    
        }catch(e){
            testBugger.errorLog("Error in goto url")
            testBugger.errorLog(e)
        }
        let result  = await botMaster.page.evaluate(() => {
           return document.querySelector('[class="answer accepted-answer"]').querySelector('[class="post-text"]').innerText
        })
        return result
    },

    destroyPage: async (page)=>{
        await page.close()
    },
    destroyBrowser: async (page)=>{
        await botMaster.browser.close()
    }
}

module.exports = botMaster