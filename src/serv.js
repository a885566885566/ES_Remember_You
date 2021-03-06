/*
 * 
 * CC, Vincent and Iris All rights deserved.
 */

const express = require('express')
const app = express()

/* session */
const session = require('express-session');

//const crypto = require('crypto')

const logger = require('./logger.js')
var paidLogger = require('./paidLogger.js')
const utils = require('./utils.js')

var orderObj = logger.getOrderObj
var visitedObj = logger.getVisitObj
const keyObj = logger.getKeyObj
const productObj = logger.getProducObj 

const order_summary = require('./summary.js')
//var bodyParser = require('body-parser');
//var request = require('request');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended : false}));

const port = 11234;

app.use(session({
    secret: keyObj.session_key, 
    cookie: { "sid": 0 }
}));

app.use(express.static(__dirname + '/public'))

app.get("/initial", (req, res)=>{
    if( req.session.uname !== undefined )
        productObj["status"] = "Success"
    res.send(productObj)
    visitedObj.Initial += 1
    logger.saveVisitFile(visitedObj)
})
app.get("/order", (req, res)=>{
    try{
        var new_order = JSON.parse(req.query.str)
        var hid = req.query.id

        console.log("Get new order: "+hid)
        console.log(new_order)
        new_order.OrderInfo[0]["Paid"] = false
        new_order.OrderInfo[0]["PaidTime"] = ""
        new_order.OrderInfo[0]["Cashier"] = ""
        new_order.OrderInfo[0]["BuyTime"] = new Date().getTime()
        new_order.OrderInfo[0].Products.forEach((prd, idx)=>{
            new_order.OrderInfo[0].Products[idx]["CardId"] = visitedObj["CardId"]
            visitedObj["CardId"] += 1
        })
        var price = utils.calculatePrice(new_order.OrderInfo[0].Products, productObj)
        /* Save result */
        /* Check if the price is currect */
        const orderInfo = new_order.OrderInfo[0]
        if(price == orderInfo["Price"]){
            // Somebody already has record
            if(orderObj[hid] !== undefined){
                orderObj[hid]["OrderInfo"].push(orderInfo)
            }
            // New user
            else
                orderObj[hid] = new_order
        }
        if(new_order.OrderInfo[0]["Price"] != price)
            logger.saveOrderLog(`PRICE_ERR: hid=${hid}, name=${new_order.Name}, real_price=${price}, user_price=${new_order.OrderInfo[0]["Price"]}`)
        new_order.OrderInfo[0]["Price"] = price
        res.send(new_order)

        visitedObj.Order += 1
        logger.saveVisitFile(visitedObj)
        logger.saveLogFile(orderObj)
        logger.saveOrderLog(`hid=${hid}, name=${new_order.Name}, id=${new_order.Sid}`)
    }
    catch(e){
        console.log(e)
        logger.saveOrderLog(`ERROR: hid=${req.query.id} order_json=${req.query.str}`)
        var ip = (req.headers["x-forwarded-for"] || "").split(",").pop() ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress
        var html = "Do not try to hack me: " + ip
        res.send(html)
    }
})

app.get("/query", (req, res)=>{
    var hid = req.query.hid
    const buyid = req.query.buyid
    const sid = req.session.uname
    const mode = req.query.mode

    var msg = `Query request from ${hid} by ${sid}`
    var result = {}

    /* check permission */
    /*
     * Normal Buyer: normal
     * Logined Query: login
     */
    if(buyid === undefined & sid === undefined){
        result["status"] = "Permission deny"
        res.send(result)
        return false
    }

    if(sid !== undefined)   result["status"] = "login"
    else                    result["status"] = "normal"

    if(mode == "personal"){
        if((orderObj[hid] !== undefined) & (sid !== undefined))
            //if( orderObj[hid] == buyid )
            result["query"] = orderObj[hid]
        else
            result["status"] = "failed"
    }
    else if(mode == "spec")
        result["query"] = order_summary.getSpecSummary(orderObj)
    else if(mode == "buyer")
        result["query"] = order_summary.getBuyerSummary(orderObj)
    else if(mode == "luckyguy")
        result["query"] = order_summary.getLuckyGuySummary(orderObj)
    else if(mode == "incomeSummary")
        result["query"] = paidLogger.getPaidSummary 

    res.send(result)

    console.log(msg)
    visitedObj.Query += 1
    logger.saveOrderLog(`QUERY: hid=${hid}, result=${result.status}`)
})

function checkAccount(uname, pswd){
    if( utils.getInputValue(uname) !== false &&
        keyObj.account[uname] !== undefined && 
        utils.getInputValue(pswd) !== false &&
        keyObj.account[uname] === pswd){
        return true
    }
    else{
        return false
    }
}

app.get("/login", (req, res)=>{
    var result = {}
    if(req.query.mode === undefined){
        console.log("Undefined")
        result.status = "Failed"
    }
    else if(req.query.mode == "test"){
        if( req.session.uname === undefined )
            result.status = "Failed"
        else{ 
            result.status = "Success"
            result.uname = req.session.uname
        }
    }
    else if(req.query.mode == "login"){
        var uname = req.query.uname 
        var pswd = req.query.pswd
        var msg = "uname=" + uname +", pswd= " + pswd
        if( checkAccount(uname, pswd) === true ){
            msg += " SUCCESSED"
            req.session.uname = uname
            result.status = "Success"
            result.uname = req.session.uname
        }
        else{
            msg += " FAILED"
            result.status = "Failed"
        }
        logger.saveLoginLog(msg)
    }
    else if(req.query.mode == "logout"){
        result.status = "Failed"
        logger.saveLoginLog(`uname=${req.session.uname} LOGOUT`)
        req.session.destroy((err)=>{
            console.log(err)
        })
    }
    visitedObj.Login += 1
    logger.saveVisitFile(visitedObj)
    res.send(result)
})

app.get("/paid_request", (req, res)=>{
    try{
        var response = {}
        const hid = req.query.hid
        const prod_id = req.query.id
        const special = req.query.special
        if(req.session.uname === undefined){
            response.status = "permission_deny"
        }
        else{
            orderObj[hid].OrderInfo.forEach((prod, idx)=>{
                //console.log(prod.BuyTime)
                //console.log(prod_id)
                //console.log(prod.Paid)
                if((prod.BuyTime == prod_id) && (prod.Paid === false)){
                    orderObj[hid].OrderInfo[idx].Paid = true
                    orderObj[hid].OrderInfo[idx].PaidTime = new Date().getTime()
                    orderObj[hid].OrderInfo[idx].Cashier = req.session.uname
                    // Use discount
                    if(orderObj[hid].OrderInfo[idx].BuyTime == special){
                        orderObj[hid].OrderInfo[idx].Discount = special
                        console.log("Use discount")
                    }
                    else
                        console.log("Discount id error")

                    paidLogger.insertLog({
                        "Name":orderObj[hid].Name,
                        "Sid":orderObj[hid].Sid}, orderObj[hid].OrderInfo[idx])
                    paidLogger.savePaidLog()
                    response.status = "status_updated"
                }
                else
                    response.status = "info_error"
            })
        }
        visitedObj.Paid += 1
        logger.saveLogFile(orderObj)
        logger.saveOrderLog(`PAID_REQ: hid=${hid}, pid=${prod_id}, id=${req.session.uname} result=${response.status}`)
        res.send(response)
    }
    catch(e){
        console.log(e)
    }
})
console.log("Prepare done");
app.listen(port)
