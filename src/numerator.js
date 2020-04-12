const logger = require('./logger.js')
var orderObj = logger.getOrderObj
var visitObj = logger.getVisitObj

var cardId = 0
const key = Object.keys(orderObj)
key.forEach((k)=>{
    orderObj[k].OrderInfo.forEach((order, orderIdx)=>{
        order.Products.forEach((prod, prodIdx)=>{
            orderObj[k].OrderInfo[orderIdx].Products[prodIdx]["CardId"] = cardId
            cardId += 1
        })
    })
})
visitObj["CardId"] = cardId
logger.saveLogFile(orderObj)
logger.saveVisitFile(visitObj)
