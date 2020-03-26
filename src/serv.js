/*
 * 
 * CC, Vincent and Iris All rights deserved.
 */

const express = require('express')
const app = express()
const port = 10418;
const OrderFilename = 'food_list.json';

var fs = require("fs");
var foodStr = fs.readFileSync(OrderFilename);
var foodObj = JSON.parse(foodStr);

app.use(express.static(__dirname + '/public'))
console.log("Prepare done");

app.listen(port)
