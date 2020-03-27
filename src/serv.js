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

var orderStr = fs.readFileSync(OrderFilename);
var orderObj = JSON.parse(orderStr);
var keyStr = fs.readFileSync(KeyFilename);
var keyObj = JSON.parse(keyStr);

var productPrice = {
    "productA":70,
    "productB":50,
    "productC":100,
}

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
        totalPrice += productPrice[product_type]
    })

    /* discount rule */
    if( totalPrice > 250 ) totalPrice -= 20
    else if(totalPrice > 150 ) totalPrice -= 10

    return totalPrice
}

app.get("/initial", (req, res)=>{
    res.send(productPrice)
})
app.get("/order", (req, res)=>{
    var new_order = JSON.parse(req.query.str)

    var hid = Object.keys(new_order)[0]
    var products = new_order[hid]["Products"]

    var price = calculatePrice(products)
    /* Save result */
    if(price === new_order["Price"]){
        if(orderObj[hid] !== undefined){
            orderObj[hid].push(new_order[hid])
            console.log(orderObj)
        }
        else
            orderObj[hid] = new_order
    }
    new_order["Price"] = price
    console.log(orderObj)
    res.send(new_order)
})

app.get("/query", (req, res)=>{
    var hid = req.query.hid
    var msg = `Query request from ${hid}`
    console.log(msg)
    if( orderObj[hid] !== undefined )
        res.send(orderObj[hid])
    else
        res.send({"status":"no"})
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
