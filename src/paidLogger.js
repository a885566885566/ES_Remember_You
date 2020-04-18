const fs = require("fs")
var summary = require("./summary.js")

const PaidJsonFilename = './private/paidLogConfig.json'
var paidConfigStr = fs.readFileSync(PaidJsonFilename);
var paidConfig = JSON.parse(paidConfigStr);

const PaidObjFilename = './private/paidLog.json'
var paidStr = fs.readFileSync(PaidObjFilename);
var paidLog = JSON.parse(paidStr);

function savePaidLog(){
    var log = JSON.stringify(paidLog)
    fs.writeFile(PaidObjFilename, log, 'utf8', (err)=>{
        if (err)
            console.log("Error to write file")
    })
}

function insertLog(personInfo, order){
    if( order.Paid === true ){
        const paidTime = new Date(order.PaidTime).getTime()
        var idx = 0
        while( idx<paidConfig.timeList.length ){
            const time = new Date(paidConfig.timeList[idx].start).getTime()
            if( time < paidTime ){
                const name = paidConfig.timeList[idx].Name 
                if (paidLog[name] === undefined)
                    paidLog[name] = []
                paidLog[name].push({
                    "Buyer":personInfo.Name,
                    "Sid":personInfo.Sid,
                    "Price":order.Price,
                    "BuyTime":order.BuyTime,
                    "PaidTime":order.PaidTime,
                    "Discount":order.Discount,
                    "Cashier":order.Cashier
                })
            }
            idx += 1
        }
    }
}

function createPaidLog(obj){
    paidLog = {}
    const hids = Object.keys(obj)
    hids.forEach((hid)=>{
        const buyer = obj[hid]
        buyer.OrderInfo.forEach((order)=>{
            insertLog({"Name":obj[hid].Name, 
                       "Sid":obj[hid].Sid}, order)
        })
    })
    savePaidLog()
}
module.exports.insertLog = insertLog 
module.exports.getPaidSummary = paidLog
module.exports.savePaidLog = savePaidLog
module.exports.createPaidLog = createPaidLog
