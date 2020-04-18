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
            prod["Paid"] = order.Paid
            prod["Cashier"] = order.Cashier 
            prod["BuyTime"] = order.BuyTime
            prod["PaidTime"] = order.PaidTime 
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
        /* New luckyguy */
        if(lucky[prod.DestName] === undefined){
            var lucky_info = {
                "Name": prod.DestName,
                "Department": prod.Department,
                "Contact": prod.Contact,
                "Products":[{
                    "ProductType": prod.ProductType,
                    "ProductSpec": prod.ProductSpec,
                    "Paid": prod.Paid,
                    "PaidTime": prod.PaidTime,
                    "Cashier": prod.Cashier,
                    "CardId": prod.CardId,
                    "BuyTime": prod.BuyTime
                }]
            }
            lucky[prod.DestName] = lucky_info 
        }
        /* Already exist */
        else{
            lucky[prod.DestName].Products.push({
                "ProductType": prod.ProductType,
                "ProductSpec": prod.ProductSpec,
                "Paid": prod.Paid,
                "PaidTime": prod.PaidTime,
                "Cashier": prod.Cashier,
                "CardId": prod.CardId,
                "BuyTime": prod.BuyTime
            })
            /* Check personal info */
            if(lucky[prod.DestName].Department != prod.Department){
                lucky[prod.DestName].error = prod 
            }
        }
    })
    return lucky 
}
function getBuyerSummary(obj){
    var buyers = []
    const hids = Object.keys(obj)
    hids.forEach((hid)=>{
        const buyer = obj[hid]
        var unPaidCount = 0
        var paidCount = 0
        buyer.OrderInfo.forEach((order)=>{
            if( !order.Paid ) unPaidCount += 1
            if( order.Paid )  paidCount += 1
        })
        buyers.push({
            "Name":buyer.Name,
            "Sid":buyer.Sid,
            "FB":buyer.FB,
            "Phone":buyer.Phone,
            "Email":buyer.Email,
            "Paid":paidCount,
            "UnPaid":unPaidCount 
        })
    })
    return buyers 
}

module.exports.getSpecSummary =  getSpecSummary 
module.exports.getLuckyGuySummary = getLuckyGuySummary 
module.exports.getBuyerSummary = getBuyerSummary 
