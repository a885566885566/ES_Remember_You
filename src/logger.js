const fs = require("fs");

/* Order log file configuration */
const OrderFilename = './order_list/order_list.json';
const KeyFilename = './private/keys.json';
const ProductFilename = './private/products.json'
const LoginLogFilename = './log/login_log.txt'
const OrderLogFilename = './log/order_log.txt'
const VisitedFilename = './private/visited.json'

// Order
var orderStr = fs.readFileSync(OrderFilename);
var orderObj = JSON.parse(orderStr);

var keyStr = fs.readFileSync(KeyFilename);
var keyObj = JSON.parse(keyStr);
var productStr = fs.readFileSync(ProductFilename);
var productObj = JSON.parse(productStr);
var visitedStr = fs.readFileSync(VisitedFilename);
var visitedObj = JSON.parse(visitedStr);

function saveLogFile(obj){
    orderObj = obj
    var content = JSON.stringify(orderObj)
    fs.writeFile(OrderFilename, content, 'utf8', (err)=>{
        if (err)
            console.log("Error to write file")
    })
}
function saveVisitFile(obj){
    visitedObj = obj
    var visit = JSON.stringify(visitedObj)
    fs.writeFile(VisitedFilename, visit, 'utf8', (err)=>{
        if (err)
            console.log("Error to write file")
    })
}
function saveLoginLog(msg){
    fs.appendFile(LoginLogFilename, msg+"\n", function (err) {
        if (err) throw err;
        console.log("LOGIN: " + msg)
    })
}
function saveOrderLog(msg){
    fs.appendFile(OrderLogFilename, msg+"\n", function (err) {
        if (err) throw err;
        console.log("ORDER: " + msg)
    })
}

module.exports.saveLogFile = saveLogFile
module.exports.saveVisitFile = saveVisitFile
module.exports.saveLoginLog = saveLoginLog
module.exports.saveOrderLog = saveOrderLog
module.exports.getOrderObj = orderObj
module.exports.getKeyObj = keyObj
module.exports.getVisitObj = visitedObj
module.exports.getProducObj = productObj
