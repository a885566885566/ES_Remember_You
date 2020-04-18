
function CreatePaidLogger(){
    try{
        const paidLogger = require('./paidLogger.js')
        const logger = require("./logger.js")
        var orderObj = logger.getOrderObj 
        paidLogger.createPaidLog(orderObj)
    }
    catch(e){
        console.log(e)
    }
}

function NumerateCardId(){
    try{
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
    }
    catch(e){
        console.log(e)
    }
}

function recalculatePrice(){
    const logger = require('./logger.js')
    const utils = require('./utils.js')
    var orderObj = logger.getOrderObj
    const productObj = logger.getProducObj 

    const hids = Object.keys(orderObj)
    hids.forEach((hid)=>{
        orderObj[hid].OrderInfo.forEach((order, idx)=>{
            var price = utils.calculatePrice(order.Products, productObj)
            orderObj[hid].OrderInfo[idx].Price = price 
        })
    })
    logger.saveLogFile(orderObj)
}
recalculatePrice()
CreatePaidLogger()
NumerateCardId()
