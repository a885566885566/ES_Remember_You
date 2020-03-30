/*
 * 
 * CC, Vincent and Iris All rights deserved.
 */

const express = require('express')
const app = express()

/* session */
const session = require('express-session');

//const crypto = require('crypto')

const fs = require("fs");

//var bodyParser = require('body-parser');
//var request = require('request');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended : false}));

const port = 11234;

/* Order log file configuration */
const OrderFilename = './order_list/order_list.json';
const KeyFilename = './private/keys.json';
const ProductFilename = './private/products.json'
const LoginLogFilename = './log/login_log.txt'
const OrderLogFilename = './log/order_log.txt'

var orderStr = fs.readFileSync(OrderFilename);
var orderObj = JSON.parse(orderStr);
var keyStr = fs.readFileSync(KeyFilename);
var keyObj = JSON.parse(keyStr);
var productStr = fs.readFileSync(ProductFilename);
var productObj = JSON.parse(productStr);

app.use(session({
    secret: keyObj.session_key, 
    cookie: { "sid": 0 }
}));

app.use(express.static(__dirname + '/public'))

function saveLogFile(){
    var content = JSON.stringify(orderObj)
    console.log("Log saved")
    fs.writeFile(OrderFilename, content, 'utf8', (err)=>{
        if (err)
            console.log("Error to write file")
    })
}

function writeLoginLog(msg){
    fs.appendFile(LoginLogFilename, msg+"\n", function (err) {
        if (err) throw err;
        console.log("LOGIN: " + msg)
    })
}
function writeOrderLog(msg){
    fs.appendFile(OrderLogFilename, msg+"\n", function (err) {
        if (err) throw err;
        console.log("ORDER: " + msg)
    })
}
function getInputValue(value){
    if( value === undefined ||
        value == null ||
        value.length <= 0 ||
        value.indexOf('<') >= 0 ||
        value.indexOf('>') >= 0 ||
        value.indexOf('(') >= 0 ||
        value.indexOf(')') >= 0 ||
        value.indexOf(' ') >= 0 ||
        value.indexOf(',') >= 0){
        return false
    }
    return value
}

function calculatePrice(products){
    var totalPrice = 0
    products.forEach((product)=>{
        var product_type = product["ProductType"]
        totalPrice += productObj[product_type].price
    })

    /* discount rule */
    if( totalPrice > 250 ) totalPrice -= 20
    else if(totalPrice > 150 ) totalPrice -= 10

    return totalPrice
}

app.get("/initial", (req, res)=>{
    res.send(productObj)
})
app.get("/order", (req, res)=>{
    var new_order = JSON.parse(req.query.str)
    var hid = req.query.id

    console.log("Get new order:")
    console.log("id= " + hid )
    console.log("new_order")
    console.log(new_order)
    var price = calculatePrice(new_order.OrderInfo[0].Products)
    /* Save result */
    /* Check if the price is currect */
    new_order.OrderInfo[0].BuyTime = new Date().getTime()
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
        writeOrderLog(`PRICE_ERR: hid=${hid}, name=${new_order.Name}, real_price=${price}, user_price=${new_order.OrderInfo[0]["Price"]}`)
    new_order.OrderInfo[0]["Price"] = price
    saveLogFile()
    writeOrderLog(`hid=${hid}, name=${new_order.Name}, id=${new_order.Sid}`)
    res.send(new_order)
})

app.get("/query", (req, res)=>{
    var hid = req.query.hid
    var msg = `Query request from ${hid}`
    var result = {}
    if( req.session.uname )    result["status"] = "login"
    else result["status"] = "normal"

    console.log(msg)
    if( orderObj[hid] !== undefined ){
        result["query"] = orderObj[hid]
        res.send(result)
    }
    else{
        result["status"] = "failed"
        res.send(result)
    }
    writeOrderLog(`QUERY: hid=${hid}, result=${result.status}`)
})

function checkAccount(uname, pswd){
    if( getInputValue(uname) !== false &&
        keyObj.account[uname] !== undefined && 
        getInputValue(pswd) !== false &&
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
        writeLoginLog(msg)
    }
    else if(req.query.mode == "logout"){
        result.status = "Failed"
        writeLoginLog(`uname=${req.session.uname} LOGOUT`)
        req.session.destroy((err)=>{
            console.log(err)
        })
    }
    res.send(result)
})

app.get("/paid_request", (req, res)=>{
    var response = {}
    const hid = req.query.hid
    const prod_id = req.query.id
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
                response.status = "status_updated"
            }
            else
                response.status = "info_error"
        })
    }
    saveLogFile()
    writeOrderLog(`PAID_REQ: hid=${hid}, pid=${prod_id}, id=${req.session.uname} result=${response.status}`)
    res.send(response)
})
console.log("Prepare done");
app.listen(port)
