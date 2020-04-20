const emailInterval = 1000;

const summary = require('./summary.js')
const logger = require('./logger.js')
const nodemailer = require("nodemailer");

const fs = require('fs');
const emailFilename = './private/emailConfig.json'
const emailStr = fs.readFileSync(emailFilename);
var email = JSON.parse(emailStr);

const orderObj = logger.getOrderObj
const buyerInfo = summary.getBuyerSummary(orderObj)

const outputFile = "./output.txt"
var totalCount = 0;

var transporter = nodemailer.createTransport({
    service : 'gmail',
    auth: {
        user: `${email.server.account}`,
        pass: `${email.server.password}`
    }
});
var emergency_contact = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email.emergent.account,
        pass: email.emergent.password
    }
})

function getContent(buyer){
    var title = `電記著你 x 繳費須知`
    var content = `
${buyer.Name} 您好,

感謝您購買本次傳情商品
您已付款 ${buyer.Paid} 筆訂單
尚有 ${buyer.UnPaid} 筆訂單未付款
請務必於4/20~4/24晚上6:30~9:00至勝後木桌繳費
否則未繳費之訂單將視為棄單

繳費須知：
1、請自備足夠零錢
2、請配合工作人員使用酒精消毒雙手
3、請提供購買者之學號、姓名（或學生證）以利查詢資料
4、完成繳費後，請主動拍攝工作人員之電腦明細，恕不提供紙本收據

若有加訂需求，直接填寫表單即可
https://reurl.cc/xZO4be（至4/24 21:00止）

如有任何疑問歡迎私訊粉專~


工科系傳情
敬啟
    `
    return {
        "title": title,
        "content": content,
        "email": buyer.Email
    }
}

function sendMsg(target, callback){
    var mailOptions = {
        from: `${email.server.account}`,
        to: `${target.email}`,
        subject: target.title,
        text: target.content
    };
    transporter.sendMail(mailOptions,function(error,info){
        if (error){
            fs.appendFile(outputFile, "Main email error:\n"+error+"\n"+info+"\n", (err)=>{
                if(err) console.log(err);
            });
            console.log('Main email failure. Sending emergency email...')
            emergency_contact.sendMail({
                from: email.emergent.account,
                to: email.emergent.account,
                subject: `ESSA email service error`,
                text: `Error Message: \n${error}\n\nInfo:\n${info}\n`
            }, (err, inf)=>{
                if(err){
                    callback(err, info, false);
                    return;
                }
            })
            callback(null, null, false);
            return;
        }
    });
    callback(null, null, true);
}
var count = 0
function sendOne(len){
    if (count < len){
        buyer = buyerInfo[count]
        const content = getContent(buyer)
        if(buyer.UnPaid > 0 && buyer.Sid == "E94066157"){
            sendMsg(content, (err, inf, succeed)=>{
                if(err)
                    console.log(`Sending emergency email error:\n ${err}, \n\n${inf}\n`); 
                if(!succeed) arr.push(emailAddr);
                else{
                    var percent = String(Math.round(100*(count+1)/len))+"%";
                    console.log(percent + " -> " + buyer.Email);
                    fs.appendFile(outputFile, buyer.Email+"\n", (err)=>{
                        if(err) console.log(err);
                    });
                };
            })
        }
        count += 1
    }
}
setInterval(()=>{
    const len = buyerInfo.length
    sendOne(len);
}, emailInterval);

