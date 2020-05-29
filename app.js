
const botMaster = require('./botMaster');
// how to install globle package using npm
(async()=>{
    await botMaster.initializer("/tmp/Stack", "server")
    let data = await botMaster.googleSearch("stackoverflow how to use python vertualenv")
    console.log(data)
})()