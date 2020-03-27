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

app.use(session({
      secret: 'recommand 128 bytes random string', 
      cookie: { "sid": 60 * 1000 }
}));

const port = 11234;

/* Order log file configuration */
const OrderFilename = './log/order_list.json';
const KeyFilename = './private/keys.json';
const ProductFilename = './private/products.json'

var orderStr = fs.readFileSync(OrderFilename);
var orderObj = JSON.parse(orderStr);
var keyStr = fs.readFileSync(KeyFilename);
var keyObj = JSON.parse(keyStr);
var productStr = fs.readFileSync(ProductFilename);
var productObj = JSON.parse(productStr);

app.use(express.static(__dirname + '/public'))

function saveLogFile(){
    var content = JSON.stringify(orderObj)
    fs.writeFile(OrderFilename, content, 'utf8', (err)=>{
        if (err)
            console.log("Error to write file")
    })
}

function getInputValue(value){
    if(value.indexOf('<') >= 0 ||
        value.indexOf('>') >= 0 ||
        value.indexOf('(') >= 0 ||
        value.indexOf(')') >= 0 ||
        value.indexOf('.') >= 0 ||
        value.indexOf(',') >= 0){
        alert("Warning ! Input format error!")
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

    console.log("id= " + hid )
    console.log("summary= " + new_order )
    var newOrderInfo = new_order[hid].OrderInfo[0]
    var products = newOrderInfo["Products"]
    var price = calculatePrice(products)
    /* Save result */
    /* Check if the price is currect */
    if(price === newOrderInfo["Price"]){
        // Somebody already has record
        if(orderObj[hid] !== undefined){
            orderObj[hid]["OrderInfo"].push(newOrderInfo)
        }
        // New user
        else
            orderObj[hid] = new_order[hid]
    }
    new_order[hid].OrderInfo[0]["Price"] = price
    console.log(orderObj)
    res.send(orderObj)
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
    if(req.session.uname === undefined){
        var uname = req.query.uname 
        var pswd = req.query.pswd
        var msg = "LOGIN: " + uname +", pswd= " + pswd
        if( checkAccount(uname, pswd) === true ){
            msg += " SUCCESSED"
            req.session.uname = uname
            res.send({"status":"success"})
        }
        else{
            msg += " FAILED"
            res.send({"status":"fail"})
        }
        console.log(msg)
    }
    else{
        console.log(req.session.uname + "Already login")
        res.send({"status":"already"})
    }
})

console.log("Prepare done");
app.listen(port)
