var logger = require("./logger.js")
const productInfo = logger.getProducObj 

function getOrderList(obj){
    var orders = []
    const hids = Object.keys(obj)
    hids.forEach((hid)=>{
        const buyer = obj[hid]
        buyer.OrderInfo.forEach((order)=>{
            orders.push(order)
        })
    })
    return orders
}
function getProductList(obj){
    var products = []
    const orders = getOrderList(obj)
    orders.forEach((order)=>{
        order.Products.forEach((prod)=>{
            products.push(prod)
        })
    })
    return products 
}

function getSpecSummary(obj){
    var spec_list = {}
    const prods = Object.keys(productInfo)
    prods.forEach((prod)=>{
        if(productInfo[prod].spec !== undefined){
            spec_list[prod] = {
                "Name":productInfo[prod].name,
                "Spec":[]}
            productInfo[prod].spec.forEach((spec, idx)=>{
                if(prod == "productD" 
                    || idx != productInfo[prod].spec.length-1){
                    var sp = {}
                    sp["name"] = spec.name
                    sp["detail"] = {}
                    spec.detail.forEach((del)=>{
                        sp["detail"][del] = 0
                    })
                    spec_list[prod].Spec.push(sp)
                }
            })
        }
    })
    const products = getProductList(obj)
    products.forEach((prod)=>{
        prod.ProductSpec.forEach((detail, idx)=>{
            if (idx == prod.ProductSpec.length-1){
                if(detail != "不加購")
                    spec_list["productD"].Spec[0].detail[detail] += 1
            }
            else 
                spec_list[prod.ProductType].Spec[idx].detail[detail] += 1
        })
    })
    return spec_list
}

function getLuckyGuySummary(obj){
    var lucky = {}
    const products = getProductList(obj)
    products.forEach((prod)=>{
        if(lucky[prod.DestName] === undefined)
            lucky[prod.DestName] = []
        lucky[prod.DestName].push(prod)
    })
    return lucky 
}
function getBuyerSummary(obj){
    var buyers = []
    const hids = Object.keys(obj)
    hids.forEach((hid)=>{
        const buyer = obj[hid]
        buyers.push({
            "Name":buyer.Name,
            "Sid":buyer.Sid,
            "FB":buyer.FB,
            "Phone":buyer.Phone,
            "Email":buyer.Email
        })
    })
    return buyers 
}

module.exports.getSpecSummary =  getSpecSummary 
module.exports.getLuckyGuySummary = getLuckyGuySummary 
module.exports.getBuyerSummary = getBuyerSummary 
